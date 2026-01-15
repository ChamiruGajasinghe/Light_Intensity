#include "network.h"
#include "config.h"
#include "globals.h"
#include <WiFi.h>
#include "hardware.h"
#include "radar_logic.h"
#include <WiFiClientSecure.h>
#include <UniversalTelegramBot.h>

unsigned long lastSignalUpdate = 0;

// --- TELEGRAM SETUP ---
WiFiClientSecure secured_client;
UniversalTelegramBot bot(TELEGRAM_BOT_TOKEN, secured_client);

// Timer for checking new Telegram messages (every 1 second)
unsigned long lastTelegramCheck = 0;
const unsigned long TELEGRAM_INTERVAL = 1000; 

void publishCommandStatus(const char* message) {
  mqtt_client.publish(mqtt_command_status_topic, message);
  Serial.println(message);
}

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_PIN, HIGH);
    delay(250);
    digitalWrite(LED_PIN, LOW);
    delay(250);
    Serial.print(".");
  }
  
  Serial.println("\n✓ WiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  
  secured_client.setInsecure(); // Allow Telegram connection immediately
  // Set time via NTP so HTTPS certificates work (optional but good practice)
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
}

void connectMQTT() {
  while (!mqtt_client.connected()) {
    Serial.print("Connecting to MQTT broker: ");
    Serial.println(mqtt_broker);
    
    if (mqtt_client.connect(mqtt_client_id)) {
      Serial.println("✓ MQTT Connected!");
      
      mqtt_client.subscribe(mqtt_topic);
      mqtt_client.subscribe(mqtt_led2_topic);
      mqtt_client.subscribe(mqtt_led4_topic);
      mqtt_client.subscribe(mqtt_emergency_light_topic);
      
      mqtt_client.publish(mqtt_status_topic, "OFF");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(mqtt_client.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}
// Handle new Telegram messages
void handleNewMessages(int numNewMessages) {
  for (int i = 0; i < numNewMessages; i++) {
    String chat_id = String(bot.messages[i].chat_id);
    String text = bot.messages[i].text;

    if (chat_id != TELEGRAM_CHAT_ID) continue;

    if (text == "/status") {
      bot.sendMessage(chat_id, "⏳ Waking up system to check status...", "");

      // 1. Check if System was OFF (Active LOW logic: HIGH = OFF)
      bool wasSystemOff = (digitalRead(LED2_PIN) == HIGH);

      // 2. If it was OFF, Turn it ON temporarily
      if (wasSystemOff) {
         digitalWrite(LED2_PIN, LOW); // Turn ON
         Serial.println("Telegram: Temporarily waking system...");
         delay(500); // Wait 0.5s for sensors/power to stabilize
      }

      // 3. Force a fresh reading immediately
      forceSensorUpdate();

      // 4. Prepare the Report
      String msg = "📊 *SYSTEM STATUS* 📊\n\n";
      msg += "⚡ *Main Power*\n";
      msg += "   Voltage: " + String(shared_v1, 2) + " V\n";
      msg += "   Current:   " + String(shared_c1, 1) + " mA\n\n";
      
      msg += "🔋 *BATTERY:*\n";
      msg += "   Voltage: " + String(shared_v2, 2) + " V\n";
      msg += "   Current: " + String(shared_c2, 1) + " mA\n\n";
      
      msg += "☀️ *LIGHT INTENSITY*\n";
      msg += "   Light: " + String(shared_intensity, 0) + "%\n";

      // 5. RADAR SCAN (NEW)
      msg += performRapidScan();

      // 6. If it was OFF before, turn it back OFF
      if (wasSystemOff) {
         digitalWrite(LED2_PIN, HIGH); // Turn OFF
         Serial.println("Telegram: System returning to sleep.");
         msg += "\n_(System returned to sleep mode)_";
         // Also update MQTT to show it's off
         mqtt_client.publish(mqtt_led2_status_topic, "OFF");
      }

      // 7. Send the report
      bot.sendMessage(chat_id, msg, "Markdown");
    }
    
    else if (text == "/start") {
      bot.sendMessage(chat_id, "Welcome! Send /status to check sensors.", "");
    }
  }
}

void sendTelegramMessage(String message) {
  // 1. Configure security (Insecure is fast & easiest for simple projects)
  secured_client.setInsecure(); // Use this if certificates fail, much simpler for ESP32

  // 2. Send the message
  if (WiFi.status() == WL_CONNECTED) {
      Serial.print("Sending Telegram: ");
      Serial.println(message);
      
      bool sent = bot.sendMessage(TELEGRAM_CHAT_ID, message, "");
      
      if (sent) {
        Serial.println("✓ Telegram sent successfully");
      } else {
        Serial.println("X Telegram failed to send");
      }
  } else {
      Serial.println("Error: No WiFi, cannot send Telegram.");
  }
}

void checkNetwork() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }
  if (!mqtt_client.connected()) {
    connectMQTT();
  }
  mqtt_client.loop(); // Essential for MQTT - keep this

  // Skip non-critical tasks when radar active
  if (radarActive) return;

  // --- SIGNAL STRENGTH CHECK (Every 5 Seconds) ---
  unsigned long now = millis();
  if (now - lastSignalUpdate > SIGNAL_UPDATE_INTERVAL) {
    lastSignalUpdate = now;
    long rssi = WiFi.RSSI();
    mqtt_client.publish("chami/esp32/stats/signal", String(rssi).c_str());
  }

  // --- NEW: TELEGRAM POLLING (Every 1 Second) ---
  // This actively checks if YOU sent a command to the bot
  if (now - lastTelegramCheck > TELEGRAM_INTERVAL) {
    int numNewMessages = bot.getUpdates(bot.last_message_received + 1);
    
    while(numNewMessages) {
      handleNewMessages(numNewMessages);
      numNewMessages = bot.getUpdates(bot.last_message_received + 1);
    }
    lastTelegramCheck = now;
  }
  // ----------------------------------------------
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.print("Msg on ["); Serial.print(topic); Serial.print("]: "); Serial.println(message);

  // --- LED 1 CONTROL ---
  if (String(topic) == mqtt_topic) {
    if (message == "ON" || message == "1") {
      digitalWrite(LED_PIN, HIGH);
      mqtt_client.publish(mqtt_status_topic, "ON");
    } else if (message == "OFF" || message == "0") {
      digitalWrite(LED_PIN, LOW);
      mqtt_client.publish(mqtt_status_topic, "OFF");
    }
  }
  // --- LED 2 (GPIO13) CONTROL ---
  else if (String(topic) == mqtt_led2_topic) {
    if (message == "ON" || message == "1") {
      digitalWrite(LED2_PIN, LOW);
    } else if (message == "OFF" || message == "0") {
      digitalWrite(LED2_PIN, HIGH);
      delay(1000); 
      if (digitalRead(LED4_PIN) == HIGH) {
         digitalWrite(LED4_PIN, LOW); delayMicroseconds(10); digitalWrite(LED4_PIN, HIGH);
         delay(100);
         digitalWrite(LED4_PIN, LOW); delayMicroseconds(10); digitalWrite(LED4_PIN, HIGH);
      } else {
         digitalWrite(LED4_PIN, HIGH); delayMicroseconds(10); digitalWrite(LED4_PIN, LOW);
      }
    } else if (message == "PULSE") {
      digitalWrite(LED2_PIN, HIGH); delay(2000); digitalWrite(LED2_PIN, LOW);
    }
  }
  // --- LED 4 (GPIO14) CONTROL ---
  else if (String(topic) == mqtt_led4_topic) {
    if (message == "ON" || message == "1" || message == "OFF" || message == "0") {
      digitalWrite(LED4_PIN, LOW); delayMicroseconds(10); digitalWrite(LED4_PIN, HIGH);
    } else if (message == "PULSE") {
      digitalWrite(LED4_PIN, HIGH); delay(2000); digitalWrite(LED4_PIN, LOW);
    }
  }
  // --- EMERGENCY LIGHT CONTROL ---
  else if (String(topic) == mqtt_emergency_light_topic) {
    manualEmergencyControl = true;
    if (message == "ON" || message == "1") {
      digitalWrite(POWER_STATUS_PIN, LOW);
      mqtt_client.publish(mqtt_emergency_light_status_topic, "ON");
    } else if (message == "OFF" || message == "0") {
      digitalWrite(POWER_STATUS_PIN, HIGH);
      mqtt_client.publish(mqtt_emergency_light_status_topic, "OFF");
    } else if (message == "AUTO") {
      manualEmergencyControl = false;
      mqtt_client.publish(mqtt_emergency_light_status_topic, "AUTO");
    }
  }
  // --- RADAR CONTROL ---
  else if (String(topic) == mqtt_radar_control_topic) {
    extern void handleRadarMQTT(String message);
    handleRadarMQTT(message);
  }
}
#include "hardware.h"
#include "config.h"
#include "globals.h"
#include "network.h"

void setupHardware() {
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  pinMode(LED2_PIN, OUTPUT);
  digitalWrite(LED2_PIN, HIGH); 
  
  pinMode(LED4_PIN, OUTPUT);
  digitalWrite(LED4_PIN, HIGH); 
  
  pinMode(POWER_STATUS_PIN, OUTPUT);
  digitalWrite(POWER_STATUS_PIN, HIGH); 
  
  pinMode(INTENSITY_B0_PIN, INPUT);
  pinMode(INTENSITY_B1_PIN, INPUT);
  pinMode(INTENSITY_B2_PIN, INPUT);
  
  Wire.begin();
  
  Serial.println("Initializing INA3221 (RobTillaart)...");
  
  if (!INA.begin()) {
    Serial.println("ERROR: Could not find INA3221. Check wiring/address!");
  } else {
    Serial.println("✓ INA3221 Sensor Connected!");
    INA.setShuntR(0, 0.1);
    INA.setShuntR(1, 0.1);
    INA.setShuntR(2, 0.1);
  }
}

void updateSensors() {
  static unsigned long lastSensorRead = 0;
  static unsigned long lastIntensityRead = 0;
  unsigned long currentMillis = millis();

  // --- LIGHT INTENSITY ---
  if (currentMillis - lastIntensityRead >= 2000) {
    lastIntensityRead = currentMillis;
    int b0 = digitalRead(INTENSITY_B0_PIN);
    int b1 = digitalRead(INTENSITY_B1_PIN);
    int b2 = digitalRead(INTENSITY_B2_PIN);
    int val = (b2 << 2) | (b1 << 1) | b0;
    currentLightIntensity = (val / 7.0) * 100.0;

    //Save to Shared Variable for Telegram
    shared_intensity = currentLightIntensity;

    char intensityStr[10];
    dtostrf(currentLightIntensity, 5, 1, intensityStr);
    mqtt_client.publish(mqtt_light_intensity_topic, intensityStr);
    Serial.printf("Light Intensity: %.1f%%\n", currentLightIntensity);
  }

  // --- INA3221 READINGS ---
  if (currentMillis - lastSensorRead >= 2000) {
    lastSensorRead = currentMillis;
    
    Serial.println("\n--- Channel Measurements ---");
    
    // --- CHANNEL 1 (Main Power) ---
    float v1 = INA.getBusVoltage(0);
    float c1 = fabsf(INA.getCurrent(0) * 1000.0); // Force Positive Current
    float p1 = v1 * c1; // Calculate Power (mW)
    
    //Save Ch1 to Shared Variables
    shared_v1 = v1;
    shared_c1 = c1;
    shared_p1 = p1;

    char v1s[10], c1s[10], p1s[10];
    dtostrf(v1, 5, 3, v1s); 
    dtostrf(c1, 6, 2, c1s);
    dtostrf(p1, 6, 2, p1s); // Convert Power to String

    mqtt_client.publish(mqtt_sensor_voltage_topic, v1s);
    mqtt_client.publish(mqtt_sensor_current_topic, c1s);
    mqtt_client.publish(mqtt_sensor_power_topic, p1s); // <--- NEW: Publish Power
    
    Serial.printf("CH1: %.3f V | %.2f mA | %.2f mW\n", v1, c1, p1);

    // --- CHANNEL 2 (System Power) ---
    float v2 = INA.getBusVoltage(1);
    float c2 = fabsf(INA.getCurrent(1) * 1000.0); // Force Positive Current
    float p2 = v2 * c2; // Calculate Power (mW)

    //Save Ch2 to Shared Variables
    shared_v2 = v2;
    shared_c2 = c2;
    shared_p2 = p2;

    char v2s[10], c2s[10], p2s[10];
    dtostrf(v2, 5, 3, v2s); 
    dtostrf(c2, 6, 2, c2s);
    dtostrf(p2, 6, 2, p2s); // Convert Power to String

    mqtt_client.publish(mqtt_sensor2_voltage_topic, v2s);
    mqtt_client.publish(mqtt_sensor2_current_topic, c2s);
    mqtt_client.publish(mqtt_sensor2_power_topic, p2s); // <--- NEW: Publish Power
    
    Serial.printf("CH2: %.3f V | %.2f mA | %.2f mW\n", v2, c2, p2);
    
    // --- ENERGY CALCULATION ---
    if (powerCutDetected) {
      float timeDelta = (currentMillis - lastEnergyCalcTime) / 1000.0;
      // p1 is already calculated above as v1 * c1
      totalEnergyConsumed += (p1 * (timeDelta / 3600.0)); 
      lastEnergyCalcTime = currentMillis;
    }

    // --- POWER CUT DETECTION LOGIC ---
    if (v2 < POWER_CUT_THRESHOLD) {
      if (!powerCutDetected) {
        powerCutDetected = true;
        emergencyModeActive = true;
        emergencyStartTime = currentMillis;
        gpio14Activated = false;
        
        powerCutStartTime = currentMillis;
        lastEnergyCalcTime = currentMillis;
        startVoltage = v1;
        totalEnergyConsumed = 0;
        
        mqtt_client.publish(mqtt_powercut_topic, "POWER_CUT");
        publishCommandStatus("⚠️ POWER CUT DETECTED! Starting emergency sequence...");
        
        // ---Send Telegram Alert ---
        String alertMsg = "⚠️ Power Cut Detected!\n";
        alertMsg += "Main Voltage: " + String(v1, 2) + "V\n";
        alertMsg += "System Voltage: " + String(v2, 2) + "V";
        sendTelegramMessage(alertMsg);
        

        // --- 1. IMMEDIATE SYSTEM ACTIONS ---
        digitalWrite(LED2_PIN, LOW); // Turn System ON
        mqtt_client.publish(mqtt_led2_status_topic, "ON");
        publishCommandStatus("✓ Step 1: GPIO13 (System) turned ON");

        // --- 2. IMMEDIATE EMERGENCY LIGHT CHECK ---
        if (currentLightIntensity < 40.0 && !manualEmergencyControl) {
            digitalWrite(POWER_STATUS_PIN, LOW); // ON
            mqtt_client.publish(mqtt_emergency_light_status_topic, "ON");
            publishCommandStatus("💡 Power Cut! Light Intensity Low - Emergency Light ON");
        }
        
        gpio14ActivationTime = currentMillis + GPIO14_DELAY;
        Serial.println("⚠️ POWER CUT DETECTED! Emergency mode activated.");
      }
    } else {
      // Power Restored
      if (powerCutDetected) {
        powerCutDetected = false;
        endVoltage = v1;
        float drop = startVoltage - endVoltage;
        unsigned long dur = currentMillis - powerCutStartTime;
        
        char history[200];
        snprintf(history, sizeof(history), 
          "{\"duration\":%lu,\"startV\":%.2f,\"endV\":%.2f,\"drop\":%.2f,\"energy\":%.2f}",
          dur, startVoltage, endVoltage, drop, totalEnergyConsumed);
        mqtt_client.publish(mqtt_powercut_history_topic, history);
        
        if (!manualEmergencyControl) {
          digitalWrite(POWER_STATUS_PIN, HIGH);
          mqtt_client.publish(mqtt_emergency_light_status_topic, "OFF");
        }
        mqtt_client.publish(mqtt_powercut_topic, "NORMAL");
        mqtt_client.publish(mqtt_command_status_topic, "CLEAR_LOG");
        delay(50);
        publishCommandStatus("✓ Power Restored.");

        // ---Send Restoration Alert To Telegram ---
        String restoreMsg = "✅ Power Restored.\n";
        restoreMsg += "Duration: " + String(dur / 1000) + " seconds\n";
        restoreMsg += "Energy Used: " + String(totalEnergyConsumed, 2) + " mWh";
        sendTelegramMessage(restoreMsg);
        // ------------
        
        // Interrupt Emergency Mode if active
        if (emergencyModeActive) {
           digitalWrite(LED2_PIN, HIGH);
           digitalWrite(LED4_PIN, HIGH);
           mqtt_client.publish(mqtt_led2_status_topic, "OFF");
           mqtt_client.publish(mqtt_led4_status_topic, "OFF");
           emergencyModeActive = false;
           Serial.println("Emergency mode interrupted.");
        }
      }
    }
  }
}

void handleEmergencyLogic() {
  unsigned long currentMillis = millis();

  // --- NEW: PERIODIC LIGHT CHECK (Every 20 Seconds) ---
  // Requirement: "Check for every 20 sec... until power returns"
  if (powerCutDetected) {
      static unsigned long lastLightCheck = 0;
      
      // The timer logic
      if (currentMillis - lastLightCheck >= 20000) {
          lastLightCheck = currentMillis;
          
          if (currentLightIntensity < 40.0 && !manualEmergencyControl) {
             // Ensure it is ON
             digitalWrite(POWER_STATUS_PIN, LOW); 
             mqtt_client.publish(mqtt_emergency_light_status_topic, "ON");
             publishCommandStatus("💡 20s Check: Light < 40% - Keeping Light ON");
          } else if (!manualEmergencyControl) {
             // Turn OFF if intensity improves (> 40%)
             digitalWrite(POWER_STATUS_PIN, HIGH); 
             mqtt_client.publish(mqtt_emergency_light_status_topic, "OFF");
          }
      }
  }

  // --- 1-MINUTE SHUTDOWN SEQUENCE ---
  if (emergencyModeActive) {
    // Step 2: Activate GPIO14 after delay
    if (!gpio14Activated && (currentMillis >= gpio14ActivationTime)) {
      digitalWrite(LED4_PIN, LOW); delayMicroseconds(10); digitalWrite(LED4_PIN, HIGH);
      mqtt_client.publish(mqtt_led4_status_topic, "PULSE");
      publishCommandStatus("✓ Step 2: GPIO14 Pulse Sent");
      gpio14Activated = true;
    }
    
    // Step 3: Check 1 Minute Timer
    if (currentMillis - emergencyStartTime >= EMERGENCY_DURATION) {
      
      // Requirement: "Full system off after 1 min must still function"
      // Turning off Systems (GPIO13, GPIO14)
      digitalWrite(LED2_PIN, HIGH);
      digitalWrite(LED4_PIN, HIGH);
      mqtt_client.publish(mqtt_led2_status_topic, "OFF");
      mqtt_client.publish(mqtt_led4_status_topic, "OFF");
      publishCommandStatus("🔴 Emergency Sequence Complete. Systems OFF.");
      
      // Requirement: "Except for the emergency light keep on"
      // NOTE: We do NOT turn off POWER_STATUS_PIN here anymore.
      // The block above (powerCutDetected) will keep handling the light.
      
      emergencyModeActive = false; // Stop this sequence, but powerCutDetected stays true
    }
  }
  
}
// Force Immediate Reading for Telegram ---
void forceSensorUpdate() {
  Serial.println("Forcing sensor update for Telegram...");

  // 1. Read Light Intensity Immediately
  int b0 = digitalRead(INTENSITY_B0_PIN);
  int b1 = digitalRead(INTENSITY_B1_PIN);
  int b2 = digitalRead(INTENSITY_B2_PIN);
  int val = (b2 << 2) | (b1 << 1) | b0;
  
  // Update the global variables
  currentLightIntensity = (val / 7.0) * 100.0;
  shared_intensity = currentLightIntensity;
  
  // 2. Read Power Sensors Immediately
  float v1 = INA.getBusVoltage(0);
  float c1 = fabsf(INA.getCurrent(0) * 1000.0);
  float p1 = v1 * c1;
  
  shared_v1 = v1;
  shared_c1 = c1;
  shared_p1 = p1;
  
  float v2 = INA.getBusVoltage(1);
  float c2 = fabsf(INA.getCurrent(1) * 1000.0);
  float p2 = v2 * c2;
  
  shared_v2 = v2;
  shared_c2 = c2;
  shared_p2 = p2;
  
  Serial.println("✓ Sensors updated.");
 }

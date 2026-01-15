#include <Arduino.h>
#include "config.h"
#include "globals.h"
#include "network.h"
#include "hardware.h"
#include "radar_logic.h"

// --- GLOBALS ---
unsigned long lastIoTTime = 0;

void readIoTSensors() {
  updateSensors();          
  handleEmergencyLogic();   
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== ESP32 MQTT System Starting ===");
  
  // 1. Hardware Init
  setupHardware(); 
  setupRadar();    
  
  // 2. Network Init
  connectWiFi();
  mqtt_client.setServer(mqtt_broker, mqtt_port);
  mqtt_client.setCallback(mqttCallback);
  mqtt_client.setBufferSize(1024); // Allow larger packets (1KB)
  connectMQTT();
  
  // 3. Subscriptions
  mqtt_client.subscribe(mqtt_radar_control_topic); // Ensure this is subscribed
}

void loop() {
  // 1. Critical Tasks (minimal when radar active)
  checkNetwork(); 
  unsigned long now = millis();

  // 2. Radar Mode Logic
  if (radarActive) {
    runRadarLoop(); // ONLY radar runs - no IoT sensors
  } 
  else {
    // IoT Sensors: Normal Priority (Every 2s)
    if (now - lastIoTTime > 2000) {
      lastIoTTime = now;
      readIoTSensors(); 
    }
  }
}
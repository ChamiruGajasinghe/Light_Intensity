#include "radar_logic.h"
#include "globals.h"
#include "network.h"
#include "config.h"
#include <Wire.h>
#include <VL53L0X.h>
#include <ESP32Servo.h>
#include <vector>
#include <PubSubClient.h>

// --- PIN DEFINITIONS ---
#define SERVO_PIN 26

// --- SETTINGS ---
const int SWEEP_STEP = 5;    // 4 degree steps
const int SWEEP_SPEED = 100;  // 100ms speed
const int RADAR_BUFFER_SIZE = 40; 

// --- PRIVATE VARIABLES ---
VL53L0X radarSensor;
Servo radarServo;
bool manualMode = false;
int currentAngle = 90;
int sweepDirection = 1; 
unsigned long lastSweepTime = 0;

// --- BUFFER ---
struct RadarPoint { int angle; int distance; };
std::vector<RadarPoint> radarBuffer;

// --- PUBLIC GLOBAL ---
bool radarActive = false;

// --- PRIVATE HELPERS ---
void publishRadarBuffer() {
  if (radarBuffer.empty()) return;
  
  String json;
  json.reserve(512); 
  
  json = "[";
  for (size_t i = 0; i < radarBuffer.size(); i++) {
    if (i > 0) json += ",";
    json += "[" + String(radarBuffer[i].angle) + "," + String(radarBuffer[i].distance) + "]";
  }
  json += "]";
  
  if (mqtt_client.connected()) {
      mqtt_client.publish(mqtt_radar_buffer_topic, json.c_str());
  }
  
  radarBuffer.clear();
}

void updateRadar() {
  if (manualMode) return;

  // 1. READ SENSOR
  int dist = radarSensor.readRangeContinuousMillimeters();

  // 2. BUFFER
  radarBuffer.push_back({currentAngle, dist});

  // 3. NEXT ANGLE
  currentAngle += (sweepDirection * SWEEP_STEP);

  // 4. CHECK BOUNDS (Send full packet at edges)
  if (currentAngle >= 165) {
    currentAngle = 165;
    sweepDirection = -1;
    publishRadarBuffer(); 
  }
  else if (currentAngle <= 15) {
    currentAngle = 15;
    sweepDirection = 1;
    publishRadarBuffer(); 
  }

  // 5. MOVE SERVO
  radarServo.write(currentAngle);
}

// --- PUBLIC FUNCTIONS ---

void setupRadar() {
  Serial.println("Initializing Radar System...");
  radarServo.setPeriodHertz(50);
  radarServo.attach(SERVO_PIN, 500, 2400);
  radarServo.write(currentAngle);
  
  radarSensor.setTimeout(500);
  if (!radarSensor.init()) {
    Serial.println("ERROR: VL53L0X Failed!");
  } else {
    radarSensor.setMeasurementTimingBudget(20000); 
    radarSensor.startContinuous();
    Serial.println("✓ Radar Ready");
  }
}

void runRadarLoop() {
  if (!radarActive) return;

  unsigned long now = millis();
  if (now - lastSweepTime > SWEEP_SPEED) {
    lastSweepTime = now;
    updateRadar();
  }
}

void handleRadarMQTT(String message) {
  message.trim();
  
  if (message == "POWER_ON") {
    // Non-blocking start (fixes the crash/restart issue)
    Serial.println("[RADAR] Power ON - Starting Continuous Sweep");
    radarActive = true;
    manualMode = false;
    currentAngle = 15;
    sweepDirection = 1;
    radarServo.write(15); 
    radarBuffer.clear();
    mqtt_client.publish(mqtt_radar_status_topic, "ONLINE");
  }
  else if (message == "POWER_OFF") {
    radarActive = false;
    mqtt_client.publish(mqtt_radar_status_topic, "STANDBY");
  }
  else if (message == "MANUAL_ON") manualMode = true;
  else if (message == "MANUAL_OFF") manualMode = false;
  else if (message.startsWith("SET:") && manualMode) {
    int newAngle = message.substring(4).toInt();
    if (newAngle >= 15 && newAngle <= 165) {
      currentAngle = newAngle;
      radarServo.write(currentAngle);
      delay(30); 
      int dist = radarSensor.readRangeContinuousMillimeters();
      String data = String(currentAngle) + "," + String(dist);
      mqtt_client.publish(mqtt_radar_data_topic, data.c_str());
    }
  }
}

// --- TELEGRAM BLOCKING SCAN (Full Sweep Data) ---
String performRapidScan() {
  String report = "\n📡 *RADAR SCAN* (Full Sweep)\n";
  int threats = 0;
  int totalReadings = 0;
  int minDist = 9999;
  int maxDist = 0;
  
  // 1. Save State
  bool wasActive = radarActive;
  bool wasManual = manualMode;
  int savedAngle = currentAngle;
  
  // 2. Pause Continuous Mode
  radarActive = false;
  delay(50);
  
  radarSensor.stopContinuous();
  delay(30);
  radarSensor.startContinuous();
  delay(30);

  // 3. Full sweep from 15° to 165° matching radar sweep
  radarServo.write(15);
  delay(300);
  
  for (int angle = 15; angle <= 165; angle += SWEEP_STEP) { 
    radarServo.write(angle);
    delay(50); // Servo settle
    int dist = radarSensor.readRangeContinuousMillimeters();
    
    if (dist > 20 && dist < 2000 && !radarSensor.timeoutOccurred()) {
      totalReadings++;
      if (dist < minDist) minDist = dist;
      if (dist > maxDist) maxDist = dist;
      
      // Report threats (< 1m)
      if (dist < 1000) {
        if (threats == 0) report += "\n⚠️ *Threats Detected:*\n";
        report += String(angle) + "° -> " + String(dist) + "mm";
        if (dist < 500) report += " [HIGH]";
        else report += " [MED]";
        report += "\n";
        threats++;
      }
    }
  }
  
  // Summary
  report += "\n📊 *Summary:*\n";
  report += "Threats: " + String(threats) + "\n";
  report += "Total Readings: " + String(totalReadings) + "\n";
  if (totalReadings > 0) {
    report += "Range: " + String(minDist) + "-" + String(maxDist) + "mm\n";
  }
  
  if (threats == 0) report += "✅ Area Clear\n";
  
  // 4. Restore State
  radarServo.write(savedAngle);
  delay(100);
  manualMode = wasManual;
  
  // If radar was active, make sure it continues immediately
  if (wasActive) {
    lastSweepTime = 0; // Reset to trigger immediate sweep
  }
  radarActive = wasActive;
  
  return report;
}
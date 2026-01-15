#include "globals.h"

// --- SHARED OBJECTS ---
WiFiClient espClient;
PubSubClient mqtt_client(espClient);

// RobTillaart's library accepts the standard integer address
INA3221 INA(0x40);

// --- SHARED STATE VARIABLES ---
bool powerCutDetected = false;
bool emergencyModeActive = false;
bool manualEmergencyControl = false;
bool gpio14Activated = false;

// --- SHARED MEASUREMENT VARIABLES ---
float currentLightIntensity = 100.0;
float totalEnergyConsumed = 0;
float startVoltage = 0;
float endVoltage = 0;

unsigned long emergencyStartTime = 0;
unsigned long gpio14ActivationTime = 0;
unsigned long powerCutStartTime = 0;
unsigned long lastEnergyCalcTime = 0;

// --- SHARED SENSOR VALUES ---
// Define the shared variables here (initialize to 0)
float shared_v1 = 0.0;
float shared_c1 = 0.0;
float shared_p1 = 0.0;
float shared_v2 = 0.0;
float shared_c2 = 0.0;
float shared_p2 = 0.0;
float shared_intensity = 0.0;

// --- NOTE ---
// Radar variables (radarActive, radarServo, etc.) have been moved 
// to 'src/radar_logic.cpp' to fix the conflict errors.
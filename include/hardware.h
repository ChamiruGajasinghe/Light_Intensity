#ifndef HARDWARE_H
#define HARDWARE_H

#include <Arduino.h>

// Setup function for pins and sensors
void setupHardware();

// Main logic loops (called repeatedly)
void updateSensors();          // Reads INA3221 and Intensity
void handleEmergencyLogic();   // Manages the 1-minute timer and power cut logic
void forceSensorUpdate(); // Tool to force immediate sensor update(light intensity)
#endif
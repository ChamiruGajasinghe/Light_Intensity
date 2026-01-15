#ifndef RADAR_LOGIC_H
#define RADAR_LOGIC_H

#include <Arduino.h>

// --- SHARED VARIABLES ---
extern bool radarActive; 

// --- FUNCTION PROTOTYPES ---
// These tell main.cpp that these functions exist!
void setupRadar();
void runRadarLoop(); 
void handleRadarMQTT(String message);
String performRapidScan(); 

#endif
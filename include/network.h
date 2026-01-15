#ifndef NETWORK_H
#define NETWORK_H

#include <Arduino.h>

// Initialize network connections
void connectWiFi();
void connectMQTT();

// Checks connections and reconnects if needed
void checkNetwork(); 

// The function that runs when a message arrives
void mqttCallback(char* topic, byte* payload, unsigned int length);

// Helper to send status updates
void publishCommandStatus(const char* message);

//Telegram message sender   
void sendTelegramMessage(String message);

void startTelegramTask();
#endif
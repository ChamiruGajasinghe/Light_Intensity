#include "config.h"

// --- WIFI CREDENTIALS ---
const char* ssid = "Dialog 4G 858";
const char* password = "04588A9D";

// --- MQTT SETTINGS ---
const char* mqtt_broker = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* mqtt_client_id = "ESP32_LED_Controller";

// --- MQTT TOPICS ---
const char* mqtt_topic = "esp32/led/control";
const char* mqtt_status_topic = "esp32/led/status";
const char* mqtt_led2_topic = "esp32/led2/control";
const char* mqtt_led2_status_topic = "esp32/led2/status";
const char* mqtt_led4_topic = "esp32/led4/control";
const char* mqtt_led4_status_topic = "esp32/led4/status";
const char* mqtt_sensor_voltage_topic = "esp32/sensor/voltage";
const char* mqtt_sensor_current_topic = "esp32/sensor/current";
// --- POWER TOPIC 1 ---
const char* mqtt_sensor_power_topic = "esp32/sensor/power"; 
// ---------------------
const char* mqtt_sensor2_voltage_topic = "esp32/sensor2/voltage";
const char* mqtt_sensor2_current_topic = "esp32/sensor2/current";
// --- POWER TOPIC 2 ---
const char* mqtt_sensor2_power_topic = "esp32/sensor2/power";
// ---------------------
const char* mqtt_powercut_topic = "esp32/powercut/status";
const char* mqtt_command_status_topic = "esp32/command/status";
const char* mqtt_emergency_light_topic = "esp32/emergency/control";
const char* mqtt_emergency_light_status_topic = "esp32/emergency/status";
const char* mqtt_powercut_history_topic = "esp32/history/powercut";
const char* mqtt_light_intensity_topic = "esp32/light/intensity";

// --- RADAR TOPICS ---
const char* mqtt_radar_control_topic = "esp32/radar/control";
const char* mqtt_radar_status_topic = "esp32/radar/status";
const char* mqtt_radar_data_topic = "esp32/radar/data";
const char* mqtt_radar_buffer_topic = "esp32/radar/buffer";
const char* mqtt_radar_report_topic = "esp32/radar/report"; // Initial scan JSON
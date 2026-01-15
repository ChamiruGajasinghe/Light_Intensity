# 🌟 Light Intensity & Power Backup System

Complete IoT monitoring and control system for intelligent lighting and emergency power management using ESP32, INA3221 sensors, and real-time MQTT communication.

---

## 📋 Project Overview

This system provides:
- **Real-time Light Intensity Monitoring** (3-bit binary input, 0-100%)
- **Dual Power Monitoring** (Battery backup and main power via INA3221)
- **Intelligent Emergency Light Control** (activates only when needed)
- **Automated Emergency Sequence** during power cuts
- **Web Dashboard** for monitoring and control from anywhere
- **Power Cut History Tracking** with energy consumption data 


---

## 🏗️ System Architecture

```
┌──────────────────┐          ┌──────────────────┐          ┌─────────────────┐
│  Web Dashboard   │────────▶│  MQTT Broker     │────────▶│     ESP32       │
│  (Any Browser)   │          │ (HiveMQ Cloud)   │          │  + INA3221      │
│                  │◀────────│                  │◀────────│  + Sensors      │
└──────────────────┘          └──────────────────┘          └─────────────────┘
     Internet                     Internet                   Local Network
```

### Key Components

1. **ESP32 Dev Module** - Main controller with WiFi connectivity
2. **INA3221 Sensor** - Dual channel voltage/current monitoring
3. **Light Intensity Sensor** - 3-bit binary input (GPIO 32, 33, 35)
4. **Control Outputs** - GPIO 13 (System), GPIO 14 (Intensity), GPIO 27 (Emergency Light)
5. **Web Dashboard** - Real-time monitoring and control interface
6. **MQTT Broker** - Cloud-based message routing (HiveMQ)

---

## 🔧 Hardware Setup

### ESP32 Pin Configuration

| Pin | Function | Description |
|-----|----------|-------------|
| GPIO 2 | LED_PIN | Built-in LED indicator |
| GPIO 13 | LED2_PIN | System control (inverted logic) |
| GPIO 14 | LED4_PIN | Average intensity control (inverted logic) |
| GPIO 27 | POWER_STATUS_PIN | Emergency light control |
| GPIO 32 | INTENSITY_B0 | Light intensity bit 0 (LSB) |
| GPIO 33 | INTENSITY_B1 | Light intensity bit 1 |
| GPIO 35 | INTENSITY_B2 | Light intensity bit 2 (MSB) |
| GPIO 21 | SDA | I2C data for INA3221 |
| GPIO 22 | SCL | I2C clock for INA3221 |

### INA3221 Sensor Channels

- **Channel 1**: Battery backup monitoring (voltage & current)
- **Channel 2**: Main power monitoring (voltage & current)

### Light Intensity Input

The system reads 3 binary inputs (B0, B1, B2) to determine light intensity:
- **000** (0) → 0%
- **001** (1) → 14.3%
- **010** (2) → 28.6%
- **011** (3) → 42.9%
- **100** (4) → 57.1%
- **101** (5) → 71.4%
- **110** (6) → 85.7%
- **111** (7) → 100%

---

## ⚡ Emergency Power Cut Sequence

When main power voltage drops below 9.0V:

### Timeline:

1. **t = 0ms** - Power cut detected
   - GPIO13 (System) turns ON immediately
   - Emergency mode activated
   - Start tracking power cut history

2. **t = 200ms** - Intensity control activated
   - GPIO14 sends pulse to toggle average intensity

3. **t = 60 seconds** - Emergency evaluation
   - GPIO13 turns OFF
   - GPIO14 turns OFF
   - **Check light intensity:**
     - If intensity < 40% → GPIO27 (Emergency Light) turns ON
     - If intensity ≥ 40% → Emergency light stays OFF (sufficient ambient light)

4. **Power restored** - Normal operation resumes
   - All emergency controls turn OFF
   - Log power cut history (duration, voltage drop, energy consumed)

---

## 🌐 Network Configuration

### WiFi Settings
- **SSID**: Chamix
- **Password**: 12345678

### MQTT Broker
- **Host**: broker.hivemq.com
- **Port**: 1883 (TCP for ESP32)
- **WebSocket**: 8884 (WSS for web)

### MQTT Topics

| Topic | Direction | Purpose |
|-------|-----------|---------|
| `esp32/led/control` | Web → ESP32 | Built-in LED control |
| `esp32/led/status` | ESP32 → Web | Built-in LED status |
| `esp32/led2/control` | Web → ESP32 | System control (GPIO13) |
| `esp32/led2/status` | ESP32 → Web | System status |
| `esp32/led4/control` | Web → ESP32 | Intensity control (GPIO14) |
| `esp32/led4/status` | ESP32 → Web | Intensity status |
| `esp32/emergency/control` | Web → ESP32 | Manual emergency light control |
| `esp32/emergency/status` | ESP32 → Web | Emergency light status |
| `esp32/sensor/voltage` | ESP32 → Web | Battery voltage (Channel 1) |
| `esp32/sensor/current` | ESP32 → Web | Battery current (Channel 1) |
| `esp32/sensor2/voltage` | ESP32 → Web | Main power voltage (Channel 2) |
| `esp32/sensor2/current` | ESP32 → Web | Main power current (Channel 2) |
| `esp32/light/intensity` | ESP32 → Web | Light intensity percentage |
| `esp32/powercut/status` | ESP32 → Web | Power cut alerts |
| `esp32/command/status` | ESP32 → Web | System command logs |
| `esp32/history/powercut` | ESP32 → Web | Power cut history data |

---

## 📁 Project Structure

```
Modular_ESP32_Controller/
├── README.md                          # This file
├── PROJECT_DOCUMENTATION.md           # Detailed documentation
├── HOW_TO_RUN.md                     # Complete setup guide
├── MQTT Connection.code-workspace    # VS Code workspace
├── platformio.ini                    # PlatformIO configuration
├── web/                              # React web dashboard
│   ├── README.md                     # Comprehensive React app documentation
│   ├── package.json                  # React dependencies (Vite, React Router, Chart.js, MQTT.js)
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── index.html                    # React app entry point
│   ├── src/                          # React source code
│   │   ├── App.jsx                   # Main application component
│   │   ├── main.jsx                  # React entry point
│   │   ├── index.css                 # Global styles
│   │   ├── components/               # Reusable React components
│   │   │   ├── Header.jsx            # Navigation header
│   │   │   ├── Sidebar.jsx           # Responsive sidebar
│   │   │   └── Card.jsx              # Dashboard cards
│   │   ├── pages/                    # Page components
│   │   │   ├── Dashboard.jsx         # Real-time monitoring dashboard (1030 lines)
│   │   │   └── History.jsx           # Power cut history analytics (450 lines)
│   │   └── hooks/                    # Custom React hooks
│   │       └── useMQTT.js            # MQTT connection management
│   └── public/                       # Static assets
├── src/                              # ESP32 firmware (modular C++)
│   ├── main.cpp                      # Main application entry point
│   ├── config.cpp                    # Configuration management
│   ├── globals.cpp                   # Global variables
│   ├── hardware.cpp                  # Hardware control (GPIO, INA3221, sensors)
│   └── network.cpp                   # WiFi & MQTT networking
├── include/                          # Header files
│   ├── config.h                      # System configuration constants
│   ├── globals.h                     # Global variable declarations
│   ├── hardware.h                    # Hardware function declarations
│   └── network.h                     # Network function declarations
├── lib/                              # External libraries
└── test/                             # Test files
```

---

## 🚀 Quick Start

### 1. ESP32 Firmware Setup

```bash
cd "d:\Projects\Modular_ESP32_Controller"
pio run -e esp32dev --target upload
pio device monitor
```

### 2. Web Dashboard Setup (React + Vite)

```bash
cd "d:\Projects\Modular_ESP32_Controller\web"
npm install
npm run dev
```

### 3. Access Dashboard

Open browser: http://localhost:3001

**Note**: The React application runs on **port 3001** (not 3000) with Vite's development server.

---

## 📊 Features

### Real-Time Monitoring (React Dashboard with Chart.js)
- ✅ Light intensity percentage (0-100%)
- ✅ Dual voltage monitoring with live charts (60-sample history)
- ✅ Battery voltage and current (Channel 1)
- ✅ Main power voltage and current (Channel 2)
- ✅ Power calculations (V × A = W)
- ✅ Real-time timestamps on chart x-axis
- ✅ Data persistence across page navigation (LocalStorage)
- ✅ Smooth animations (300ms transitions)
- ✅ 2 samples per second update rate
- ✅ Connection status indicators

### Control Features (Interactive Dashboard)
- ✅ Manual system control (GPIO13)
- ✅ Manual intensity control (GPIO14)
- ✅ Manual emergency light control (GPIO27)
- ✅ Automatic emergency sequence
- ✅ Toggle switches with real-time feedback
- ✅ MQTT WebSocket communication

### Data Logging & Analytics
- ✅ Power cut history with timestamps
- ✅ Duration tracking and statistics
- ✅ Voltage drop measurements
- ✅ Energy consumption during outages
- ✅ Browser LocalStorage persistence
- ✅ Historical charts (voltage drainage, duration timeline, energy consumption)
- ✅ Export to CSV functionality

### Modern User Interface (React + Tailwind CSS)
- ✅ Responsive design (mobile-friendly)
- ✅ Component-based architecture
- ✅ React Router for navigation
- ✅ Custom React hooks for MQTT
- ✅ Lazy initialization for performance
- ✅ Throttled updates to prevent overload
- ✅ Real-time chart updates without discontinuities

---

## 🔐 Safety Features

- **Low Voltage Warning**: Alert when battery < 10V
- **Automatic Power Cut Detection**: Threshold at 9.0V
- **Intelligent Light Control**: Emergency light only activates when needed (< 40% ambient light)
- **Energy Tracking**: Monitor battery consumption during outages
- **Reconnection Handling**: Auto-reconnect for WiFi and MQTT
- **Manual Override**: Emergency light can be controlled manually via web interface

---

## 📖 Documentation

- **[HOW_TO_RUN.md](HOW_TO_RUN.md)** - Complete setup and running guide
- **[Web Application Guide](web/README.md)** - Comprehensive React app documentation (tech stack, features, API reference)
- **[PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)** - Complete system architecture and detailed documentation

---

## 🛠️ Technology Stack

### Firmware (ESP32)
- **PlatformIO** - Development environment
- **Arduino Framework** - ESP32 programming
- **PubSubClient** - MQTT client library
- **SDL_Arduino_INA3221** - Triple-channel power monitoring

### Web Dashboard (React Application)
- **React 18.3.1** - UI library
- **Vite 5.4.21** - Build tool and dev server
- **React Router 6.22.0** - Client-side routing
- **Tailwind CSS 3.4.3** - Utility-first CSS framework
- **Chart.js 4.4.0** - Data visualization
- **react-chartjs-2 5.2.0** - React Chart.js wrapper
- **MQTT.js 5.3.5** - WebSocket MQTT client
- **React Icons 5.5.0** - Icon library

### Communication
- **MQTT Protocol** - IoT messaging
- **WebSocket (WSS)** - Secure browser connection
- **HiveMQ Cloud** - Public MQTT broker

---

## 📝 License

This project is for educational and personal use.

---

## 👤 Author

**Chami**
- Project: Light Intensity & Power Backup System
- Date: December 2025

---

## 🔗 Resources

- [ESP32 Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/)
- [PlatformIO](https://platformio.org/)
- [HiveMQ MQTT Broker](https://www.hivemq.com/)
- [INA3221 Datasheet](https://www.ti.com/product/INA3221)
#   L i g h t _ I n t e n s i t y  
 
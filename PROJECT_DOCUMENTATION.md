# 🌟 Light Intensity & Power Backup System

## 📋 Project Overview

Complete IoT monitoring and control system for intelligent lighting and emergency power management using ESP32, INA3221 sensors, React web dashboard, and real-time MQTT communication.

### Key Features
✅ Real-time Light Intensity Monitoring (3-bit binary input, 0-100%)  
✅ Dual Power Monitoring (Battery backup and main power via INA3221)  
✅ Intelligent Emergency Light Control (activates only when needed)  
✅ Automated Emergency Sequence during power cuts  
✅ Modern React Web Dashboard with live charts and data persistence  
✅ Power Cut History Tracking with analytics and energy consumption data  
✅ Responsive design for mobile and desktop access  
✅ Component-based architecture for maintainability  

---


## 🏗️ System Architecture
```
┌──────────────────────────┐         ┌────────────────────┐         ┌────────────────┐
│   React Dashboard        │         │   MQTT Broker      │         │     ESP32      │
│   (Vite + React Router)  │─────────▶│  (HiveMQ Cloud)    │─────────▶│  + INA3221     │
│   localhost:3001         │         │  broker.hivemq.com │         │  + Sensors     │
│                          │◀────────│                    │◀────────│  Modular C++   │
│   Components:            │         │   MQTT Protocol    │         │                │
│   - Dashboard.jsx        │         │   Port 1883 (TCP)  │         └────────────────┘
│   - History.jsx          │         │   Port 8884 (WSS)  │              Local WiFi
│   - useMQTT hook         │         └────────────────────┘              USB/COM4
│   - Chart.js             │              Internet
└──────────────────────────┘         WebSocket (WSS)
     React + Tailwind               MQTT.js Client
     LocalStorage Persist           Real-time Updates
```

### Communication Flow

1. **User Action**: Click control button in React dashboard
2. **React → Broker**: useMQTT hook publishes command to MQTT topic via WebSocket
3. **Broker → ESP32**: MQTT broker forwards message to ESP32 via TCP
4. **ESP32**: Receives command in `mqttCallback()`, updates hardware state
5. **ESP32 → Broker**: Firmware publishes sensor data and status every 500ms
6. **Broker → React**: Dashboard receives updates via WebSocket subscription
7. **React State**: Components update via useState, charts animate smoothly
8. **LocalStorage**: Chart data persists automatically (throttled saves)

---

## 🔧 Hardware Requirements

### ESP32 Dev Module
- **Model**: ESP32 Dev Module (38-pin board)
- **Chip**: ESP32-D0WD-V3 (dual-core 240MHz)
- **RAM**: 320KB SRAM
- **Flash**: 4MB
- **WiFi**: 802.11 b/g/n (2.4GHz only)
- **USB**: Micro-USB for programming and power
- **Built-in LED**: GPIO 2

### INA3221 Triple-Channel Power Monitor
- **Interface**: I2C (address 0x40)
- **Channels**: 3 independent power monitors
- **Voltage Range**: 0-26V per channel
- **Current Sensing**: Via external shunt resistors
- **Resolution**: 12-bit ADC
- **Accuracy**: ±0.2% (typical)

### Light Intensity Sensor
- **Type**: 3-bit binary encoder (8 levels)
- **Inputs**: GPIO 32, 33, 35
- **Range**: 0% to 100% (8 discrete levels)
- **Logic**: Active high (3.3V = 1, 0V = 0)

### Emergency Control Outputs
- **GPIO 13**: System control LED (inverted logic)
- **GPIO 14**: Intensity control LED (inverted logic)
- **GPIO 27**: Emergency light relay/LED

---

## 🌐 Network Configuration

### WiFi Network
- **SSID**: Configured in `include/config.h`
- **Password**: Configured in `include/config.h`
- **Security**: WPA/WPA2
- **Frequency**: 2.4GHz (ESP32 requirement)

### MQTT Broker
- **Host**: broker.hivemq.com
- **Port**: 1883 (TCP for ESP32)
- **WebSocket Port**: 8884 (WSS for React web browser)
- **Protocol**: wss:// (secure WebSocket for browser)
- **Type**: Public cloud broker (no authentication required)
- **Client IDs**: Auto-generated unique IDs for each connection

### MQTT Topics
| Topic | Direction | Purpose | Update Rate |
|-------|-----------|---------|-------------|
| `esp32/led/control` | React → ESP32 | Built-in LED control (ON/OFF) | On-demand |
| `esp32/led/status` | ESP32 → React | Built-in LED status | On change |
| `esp32/led2/control` | React → ESP32 | System control GPIO13 (ON/OFF) | On-demand |
| `esp32/led2/status` | ESP32 → React | GPIO13 status | On change |
| `esp32/led4/control` | React → ESP32 | Intensity control GPIO14 (ON/OFF) | On-demand |
| `esp32/led4/status` | ESP32 → React | GPIO14 status | On change |
| `esp32/emergency/control` | React → ESP32 | Manual emergency light control | On-demand |
| `esp32/emergency/status` | ESP32 → React | Emergency light status | On change |
| `esp32/sensor/voltage` | ESP32 → React | Battery voltage (V) | 500ms |
| `esp32/sensor/current` | ESP32 → React | Battery current (A) | 500ms |
| `esp32/sensor2/voltage` | ESP32 → React | Main power voltage (V) | 500ms |
| `esp32/sensor2/current` | ESP32 → React | Main power current (A) | 500ms |
| `esp32/light/intensity` | ESP32 → React | Light intensity (0-100%) | 500ms |
| `esp32/powercut/status` | ESP32 → React | Power cut alerts (JSON) | On change |
| `esp32/history/powercut` | ESP32 → React | Power cut history data (JSON) | On event |

---

## 📁 Project Structure

```
Modular_ESP32_Controller/
├── platformio.ini                     # PlatformIO configuration
├── README.md                          # Project overview
├── PROJECT_DOCUMENTATION.md           # This file (detailed docs)
├── HOW_TO_RUN.md                     # Complete setup guide
├── MQTT Connection.code-workspace    # VS Code workspace
│
├── src/                              # ESP32 Firmware (Modular C++)
│   ├── main.cpp                      # ✅ Main application entry point
│   ├── config.cpp                    # ✅ Configuration management
│   ├── globals.cpp                   # ✅ Global variables implementation
│   ├── hardware.cpp                  # ✅ Hardware control (GPIO, INA3221, sensors)
│   └── network.cpp                   # ✅ WiFi & MQTT networking
│
├── include/                          # Header files
│   ├── config.h                      # System configuration constants
│   ├── globals.h                     # Global variable declarations
│   ├── hardware.h                    # Hardware function declarations
│   └── network.h                     # Network function declarations
│
├── web/                              # React Web Dashboard
│   ├── README.md                     # ✅ Comprehensive React documentation
│   ├── package.json                  # React dependencies
│   ├── vite.config.js                # Vite build configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── postcss.config.js             # PostCSS configuration
│   ├── index.html                    # React app entry HTML
│   │
│   ├── src/                          # React source code
│   │   ├── App.jsx                   # Main application component
│   │   ├── main.jsx                  # React entry point
│   │   ├── index.css                 # Global styles (Tailwind)
│   │   │
│   │   ├── components/               # Reusable React components
│   │   │   ├── Header.jsx            # Navigation header with routing
│   │   │   ├── Sidebar.jsx           # Responsive sidebar menu
│   │   │   └── Card.jsx              # Dashboard card wrapper
│   │   │
│   │   ├── pages/                    # Page components (Routes)
│   │   │   ├── Dashboard.jsx         # ✅ Real-time monitoring (1030 lines)
│   │   │   │                         #    - Dual voltage charts
│   │   │   │                         #    - Control buttons
│   │   │   │                         #    - Data persistence
│   │   │   │                         #    - 2 samples/sec updates
│   │   │   └── History.jsx           # ✅ Power cut analytics (450 lines)
│   │   │                             #    - Statistical summaries
│   │   │                             #    - Interactive charts
│   │   │                             #    - CSV export
│   │   │
│   │   └── hooks/                    # Custom React hooks
│   │       └── useMQTT.js            # ✅ MQTT connection management
│   │                                 #    - WebSocket connection
│   │                                 #    - Auto-reconnect
│   │                                 #    - Subscription handling
│   │
│   └── public/                       # Static assets
│
├── lib/                              # External libraries (PlatformIO)
└── test/                             # Test files
```

### Architecture Highlights

#### ESP32 Firmware (Modular Design)
- **main.cpp**: Coordinates all modules, runs main loop
- **hardware.cpp**: Encapsulates all GPIO and sensor operations
- **network.cpp**: Handles WiFi and MQTT connectivity
- **config.h**: Centralized configuration (WiFi, MQTT, pins, thresholds)
- **globals.h**: Shared state across modules

#### React Application (Component-Based)
- **App.jsx**: Root component with React Router
- **Dashboard.jsx**: Main monitoring page with Chart.js integration
- **History.jsx**: Analytics page with multiple chart types
- **useMQTT hook**: Encapsulates MQTT.js WebSocket connection
- **Components**: Reusable UI elements (Header, Sidebar, Card)
- **Tailwind CSS**: Utility-first styling for responsive design

---

## 💻 ESP32 Firmware Explanation

### Architecture Overview

The firmware follows a modular architecture pattern:
```
main.cpp → Entry point and coordination
   ↓
hardware.cpp → Physical layer (GPIO, sensors)
   ↓
network.cpp → Communication layer (WiFi, MQTT)
   ↓
config.h → Configuration layer (constants)
```

### Key Components

**1. Hardware Module (`hardware.cpp` / `hardware.h`)**
```cpp
void setupHardware();          // Initialize all GPIO pins and sensors
void updateSensors();          // Read INA3221 and light intensity
void handleEmergencyLogic();   // Manage 60-second emergency sequence
int readLightIntensity();      // Convert 3-bit input to percentage
float calculatePower();        // Compute V × A for power calculations
```

**2. Network Module (`network.cpp` / `network.h`)**
```cpp
void connectWiFi();               // Connect to WiFi network
void connectMQTT();               // Connect to MQTT broker
void mqttCallback();              // Handle incoming MQTT messages
void checkNetwork();              // Maintain WiFi/MQTT connection
void publishSensorData();         // Send sensor readings to MQTT
```

**3. Main Application (`main.cpp`)**
```cpp
void setup() {
    Serial.begin(115200);
    setupHardware();              // Initialize GPIO and sensors
    connectWiFi();                // Connect to WiFi
    mqtt_client.setServer(...);   // Configure MQTT
    mqtt_client.setCallback(...); // Set message handler
    connectMQTT();                // Connect to broker
}

void loop() {
    checkNetwork();               // Maintain connections
    updateSensors();              // Read all sensors
    handleEmergencyLogic();       // Emergency sequence logic
}
```

**4. Configuration (`config.h`)**
```cpp
// WiFi Configuration
const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";

// MQTT Configuration
const char* mqtt_broker = "broker.hivemq.com";
const int mqtt_port = 1883;

// Hardware Pins
const int LED_PIN = 2;
const int LED2_PIN = 13;
const int LED4_PIN = 14;
const int POWER_STATUS_PIN = 27;
const int INTENSITY_B0 = 32;
const int INTENSITY_B1 = 33;
const int INTENSITY_B2 = 35;

// Emergency Thresholds
const float POWER_CUT_THRESHOLD = 9.0;  // Volts
const int LIGHT_THRESHOLD = 40;         // Percentage
const unsigned long EMERGENCY_DURATION = 60000;  // 60 seconds
```

---

## 🌐 React Web Dashboard Explanation

### Architecture Overview

Modern single-page application (SPA) built with React and Vite:
```
index.html → Entry point
   ↓
main.jsx → React initialization
   ↓
App.jsx → Router setup
   ↓
Dashboard.jsx / History.jsx → Page components
   ↓
useMQTT hook → MQTT connection management
```

### Key Components

**1. Main Application (`App.jsx`)**
```javascript
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar isOpen={sidebarOpen} />
        <div className="flex-1 flex flex-col">
          <Header toggleSidebar={...} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
```
- React Router for navigation
- Responsive sidebar with mobile support
- Shared layout across pages
- Tailwind CSS for styling

**2. Dashboard Page (`Dashboard.jsx` - 1030 lines)**

This is the main monitoring interface with real-time charts and controls.

**State Management:**
```javascript
// Lazy initialization from LocalStorage
const [chartData1, setChartData1] = useState(() => {
  try {
    const saved = localStorage.getItem('chartData1');
    return saved ? JSON.parse(saved) : { labels: [], data: [] };
  } catch { return { labels: [], data: [] }; }
});

// Refs for synchronization (IIFE pattern)
const dataPointIndex = useRef((() => {
  try {
    const saved = localStorage.getItem('dataPointIndex');
    return saved ? JSON.parse(saved) : 0;
  } catch { return 0; }
})());

const latestVoltage1 = useRef(null);
const latestVoltage2 = useRef(null);
const lastChartUpdate = useRef(0);
```

**MQTT Integration:**
```javascript
const { connectionStatus } = useMQTT({
  onMessage: handleMessage,
  topics: [
    'esp32/sensor/voltage',      // Battery voltage
    'esp32/sensor2/voltage',     // Main power voltage
    'esp32/led/status',          // Control statuses
    // ... more topics
  ],
});
```

**Chart Update Logic (Throttled 500ms):**
```javascript
const updateChart = useCallback((voltage, setChartData) => {
  const now = Date.now();
  if (now - lastChartUpdate.current < 500) return;  // Throttle
  
  lastChartUpdate.current = now;
  const currentIndex = dataPointIndex.current;
  
  setChartData(prev => {
    const newLabels = [...prev.labels];
    const newData = [...prev.data];
    const timestamp = new Date().toLocaleTimeString();
    
    if (newLabels.length < MAX_DATA_POINTS) {
      // Initial fill - append
      newLabels.push(timestamp);
      newData.push(voltage);
    } else {
      // Sliding window - shift oldest
      newLabels.shift();
      newData.shift();
      newLabels.push(timestamp);
      newData.push(voltage);
    }
    
    return { labels: newLabels, data: newData, avgVoltage: ... };
  });
  
  dataPointIndex.current++;
}, []);
```

**Data Persistence (Throttled saves):**
```javascript
const saveChartDataToStorage = useCallback(() => {
  if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
  
  saveTimerRef.current = setTimeout(() => {
    localStorage.setItem('chartData1', JSON.stringify(chartData1));
    localStorage.setItem('chartData2', JSON.stringify(chartData2));
    localStorage.setItem('dataPointIndex', dataPointIndex.current);
  }, 1000);  // Debounce 1 second
}, [chartData1, chartData2]);
```

**Chart Configuration:**
```javascript
const options = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 300,           // Smooth transitions
    easing: 'linear',
    active: { duration: 0 }, // Instant for interactions
  },
  elements: {
    line: { tension: 0.4 },  // Curved lines
    point: { radius: 2 },    // Small points
  },
  scales: {
    x: {
      ticks: { maxRotation: 45, minRotation: 45 },
    },
    y: {
      beginAtZero: false,
      min: 10,
      max: 14,
    },
  },
  plugins: {
    legend: { display: true },
    tooltip: { mode: 'index', intersect: false },
  },
  spanGaps: true,  // Connect lines even with nulls
};
```

**Custom Chart.js Plugin:**
```javascript
const latestValuePlugin = {
  id: 'latestValue',
  afterDatasetsDraw: (chart) => {
    const ctx = chart.ctx;
    const datasets = chart.data.datasets;
    
    datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      if (!meta.hidden) {
        const lastPoint = meta.data[meta.data.length - 1];
        const value = dataset.data[dataset.data.length - 1];
        
        // Draw voltage value at last point
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = dataset.borderColor;
        ctx.fillText(`${value.toFixed(2)}V`, 
                     lastPoint.x + 10, lastPoint.y);
      }
    });
  }
};
```

**3. History Page (`History.jsx` - 450 lines)**

Analytics dashboard for power cut events.

**Features:**
- Statistical summaries (total cuts, duration, energy)
- Voltage drainage chart (Line chart)
- Duration timeline (Bar chart)
- Energy consumption chart (Line chart)
- Detailed event table with export to CSV

**MQTT Integration (History Only):**
```javascript
const { connectionStatus } = useMQTT({
  onMessage: handleMessage,
  topics: ['esp32/history/powercut'],  // Only history topic
});
```

**Note:** History page does NOT handle voltage topics anymore, so charts remain frozen when navigating away from Dashboard.

**4. Custom MQTT Hook (`useMQTT.js`)**

Encapsulates MQTT.js WebSocket connection:
```javascript
export const useMQTT = ({ onMessage, topics = [] }) => {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const clientRef = useRef(null);
  
  useEffect(() => {
    const MQTT_BROKER = 'wss://broker.hivemq.com:8884/mqtt';
    const clientId = `WebClient_${Math.random().toString(16).substr(2, 8)}`;
    
    const client = mqtt.connect(MQTT_BROKER, {
      clientId,
      clean: true,
      reconnectPeriod: 1000,
    });
    
    client.on('connect', () => {
      setConnectionStatus('Connected');
      topics.forEach(topic => client.subscribe(topic));
    });
    
    client.on('message', (topic, message) => {
      onMessage(topic, message.toString());
    });
    
    // Cleanup on unmount
    return () => {
      topics.forEach(topic => client.unsubscribe(topic));
      client.end(false);
    };
  }, [onMessage, topics]);
  
  return { connectionStatus, publish: (topic, msg) => {...} };
};
```

**5. Reusable Components**

**Header Component:**
```javascript
function Header({ toggleSidebar }) {
  const navigate = useNavigate();
  
  return (
    <header className="bg-white shadow-md">
      <div className="flex items-center justify-between">
        <button onClick={toggleSidebar} className="md:hidden">
          <HiMenu />
        </button>
        <nav>
          <button onClick={() => navigate('/')}>Dashboard</button>
          <button onClick={() => navigate('/history')}>History</button>
        </nav>
        <div className={connectionStatus === 'Connected' ? 'text-green-500' : 'text-red-500'}>
          {connectionStatus}
        </div>
      </div>
    </header>
  );
}
```

**Sidebar Component:**
```javascript
function Sidebar({ isOpen }) {
  return (
    <aside className={`
      fixed md:static inset-y-0 left-0 z-30
      transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0 transition-transform duration-300
      w-64 bg-blue-900 text-white
    `}>
      {/* Navigation links */}
    </aside>
  );
}
```

---

## 🚀 How to Use

### Setup (One-time)

1. **Upload Firmware to ESP32**
   ```bash
   cd "d:\Projects\Modular_ESP32_Controller"
   pio run -e esp32dev --target upload
   ```

2. **Verify ESP32 Connection**
   ```bash
   pio device monitor -b 115200
   ```
   
   Expected output:
   ```
   === ESP32 MQTT LED Controller (Modular) ===
   ✓ Hardware initialized
   Connecting to WiFi...
   ✓ WiFi Connected!
   IP Address: 192.168.x.x
   ✓ MQTT Connected to broker.hivemq.com
   ✓ Ready for control!
   ```

3. **Start React Dashboard**
   ```bash
   cd "d:\Projects\Modular_ESP32_Controller\web"
   npm install   # First time only
   npm run dev
   ```
   
   Output:
   ```
   VITE v5.4.21  ready in 500 ms
   ➜  Local:   http://localhost:3001/
   ➜  Network: http://192.168.x.x:3001/
   ```

4. **Access Dashboard**
   - Open browser: `http://localhost:3001/`
   - Verify MQTT shows "Connected" in header
   - Check charts are updating in real-time

### Daily Use

1. Ensure ESP32 is powered and connected (check Serial Monitor)
2. Start Vite dev server: `npm run dev` (in web directory)
3. Access dashboard from any device on your network
4. Monitor real-time data and control outputs
5. Navigate to History page for analytics

---

## 🔍 Troubleshooting

### ESP32 Issues

**Problem**: ESP32 won't connect to WiFi
- ✅ Check WiFi credentials in `include/config.h`
- ✅ Verify router is on and broadcasting
- ✅ Ensure WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
- ✅ Move ESP32 closer to router
- ✅ Check Serial Monitor for error messages

**Problem**: INA3221 sensor not detected
- ✅ Verify I2C connections (SDA=GPIO21, SCL=GPIO22)
- ✅ Check sensor power (3.3V and GND)
- ✅ Confirm I2C address is 0x40
- ✅ Use I2C scanner to detect devices

**Problem**: Light intensity not reading
- ✅ Check 3-bit inputs (GPIO 32, 33, 35)
- ✅ Verify voltage levels (3.3V = HIGH, 0V = LOW)
- ✅ Test with multimeter
- ✅ Check Serial Monitor for raw binary values

### React Dashboard Issues

**Problem**: "Disconnected" status (red badge)
- ✅ Check internet connection
- ✅ Open browser DevTools console (F12) for errors
- ✅ Verify WebSocket connection to wss://broker.hivemq.com:8884/mqtt
- ✅ Try different browser (Chrome recommended)
- ✅ Disable browser extensions that might block WebSockets

**Problem**: Charts not updating
- ✅ Verify ESP32 is publishing data (check Serial Monitor)
- ✅ Check MQTT connection shows "Connected"
- ✅ Open DevTools console for JavaScript errors
- ✅ Clear browser LocalStorage: `localStorage.clear()`
- ✅ Hard refresh: Ctrl+Shift+R

**Problem**: Old data not showing after page reload
- ✅ Check LocalStorage is enabled in browser
- ✅ Open DevTools → Application → Local Storage
- ✅ Verify keys exist: chartData1, chartData2, dataPointIndex
- ✅ If corrupted, clear and reload: `localStorage.clear()`

**Problem**: Vite dev server won't start
- ✅ Verify Node.js v16+: `node --version`
- ✅ Delete node_modules and reinstall: `npm install`
- ✅ Check port 3001 is available
- ✅ Try different port: `npm run dev -- --port 3002`

### Network Issues

**Problem**: Can't control from outside home network
- ✅ Verify using cloud MQTT broker (not local)
- ✅ Check ESP32 has internet access
- ✅ Confirm both ESP32 and browser can reach broker.hivemq.com
- ✅ Deploy React app to cloud (Vercel, Netlify) for global access

---

## 📊 MQTT Message Examples

### Control Messages (React → ESP32)
```
Topic: esp32/led/control
Payload: "ON"   → Turn built-in LED on
Payload: "OFF"  → Turn built-in LED off

Topic: esp32/led2/control
Payload: "ON"   → Turn GPIO13 on (inverted: pin goes LOW)
Payload: "OFF"  → Turn GPIO13 off (inverted: pin goes HIGH)

Topic: esp32/emergency/control
Payload: "ON"   → Manually activate emergency light (GPIO27)
Payload: "OFF"  → Manually deactivate emergency light
```

### Sensor Messages (ESP32 → React)
```
Topic: esp32/sensor/voltage
Payload: "12.45"  → Battery voltage in volts

Topic: esp32/sensor/current
Payload: "0.523"  → Battery current in amps

Topic: esp32/light/intensity
Payload: "85.7"   → Light intensity percentage (0-100)
```

### Status Messages (ESP32 → React)
```
Topic: esp32/powercut/status
Payload: "NORMAL" → Main power is above threshold
Payload: "POWER CUT" → Main power below 9.0V

Topic: esp32/history/powercut
Payload: {
  "timestamp": "2024-12-15T14:30:00",
  "duration": 120,          // seconds
  "startVoltage": 12.8,     // volts
  "endVoltage": 11.2,       // volts
  "voltageDrop": 1.6,       // volts
  "energyConsumed": 15.4    // watt-hours
}
```

### Message Flow Example
```
1. User clicks "Turn ON" button in React Dashboard
2. React: useMQTT hook publishes "ON" to esp32/led/control
3. ESP32: mqttCallback() receives "ON" message
4. ESP32: digitalWrite(LED_PIN, HIGH) - LED lights up
5. ESP32: Publishes "ON" to esp32/led/status
6. React: handleMessage() receives status update
7. React: Updates button state and UI (via setState)
8. Chart: Continues updating with sensor data at 500ms intervals
```

---

## 🔒 Security Considerations

### Current Setup (Public Broker - Development Mode)
⚠️ Using public MQTT broker without authentication:
- Anyone who knows your topics can subscribe or publish
- Messages transmitted in cleartext (except WebSocket uses TLS)
- Suitable for learning, development, and non-critical projects
- **Not recommended for production deployment**

### Security Risks
1. **No Authentication**: Any client can connect to broker
2. **Topic Discovery**: Topics are not secret
3. **Message Interception**: MQTT traffic visible to broker
4. **Denial of Service**: Malicious flooding possible
5. **Data Privacy**: Sensor readings publicly accessible

### Recommended for Production

**1. Use Private MQTT Broker with Authentication**

Options:
- **Self-hosted Mosquitto** with username/password
  ```cpp
  // ESP32 code
  mqtt.connect(clientId, "username", "password");
  ```
  ```javascript
  // React code
  mqtt.connect('wss://your-broker.com:8884/mqtt', {
    username: 'user',
    password: 'pass',
  });
  ```

- **Cloud Providers with built-in security:**
  - AWS IoT Core (certificate-based auth)
  - Azure IoT Hub (SAS tokens)
  - HiveMQ Cloud (paid tier with credentials)

**2. Use SSL/TLS for ESP32 Connection**
```cpp
#include <WiFiClientSecure.h>

WiFiClientSecure espClient;
PubSubClient mqtt(espClient);

void setup() {
  espClient.setCACert(ca_cert);  // Root CA certificate
  espClient.setCertificate(client_cert);  // Client certificate
  espClient.setPrivateKey(client_key);    // Private key
}
```

**3. Implement Topic Security**
- Use unique, unpredictable topic names (UUIDs)
- Keep topics secret (don't publish in public repos)
- Use ACL (Access Control Lists) on broker
- Example: `device/a7f3c2e9-4d8b-11ed-bdc3-0242ac120002/voltage`

**4. Add Message Encryption**
- Encrypt sensitive payloads before publishing
- Use AES-256 encryption for messages
- Share keys securely (not in code)

**5. Environment Variables for Credentials**
```javascript
// vite.config.js
export default {
  define: {
    'import.meta.env.VITE_MQTT_USER': JSON.stringify(process.env.MQTT_USER),
    'import.meta.env.VITE_MQTT_PASS': JSON.stringify(process.env.MQTT_PASS),
  }
}

// .env file (not committed to git)
MQTT_USER=myuser
MQTT_PASS=mypassword
```

**6. Implement Rate Limiting**
- Throttle publish frequency on ESP32
- Detect and block excessive subscriptions
- Monitor for unusual traffic patterns

### Security Checklist for Production

- [ ] Private MQTT broker with authentication
- [ ] TLS/SSL enabled for all connections
- [ ] Unique, secret topic names
- [ ] ACL configured on broker
- [ ] Client certificates for ESP32
- [ ] Encrypted sensitive data
- [ ] Environment variables for credentials
- [ ] Regular security audits
- [ ] Monitoring and alerting
- [ ] Firewall rules on broker

---

## 🎯 Future Enhancements

### Potential Improvements

**1. Advanced Data Visualization**
- Multiple time ranges (5min, 1hr, 24hr, 7day)
- Zoom and pan functionality on charts
- Export charts as PNG/PDF
- Comparison views (day-over-day)
- Real-time energy cost calculations

**2. Enhanced React Features**
- Dark/Light theme toggle
- User preferences persistence
- Real-time notifications (browser Push API)
- PWA (Progressive Web App) support
- Offline data caching with Service Workers
- Multi-language support (i18n)

**3. Data Management**
- Backend database (MongoDB, PostgreSQL)
- Historical data API
- Data backup and restore
- Configurable data retention policies
- Advanced analytics and ML predictions

**4. Hardware Enhancements**
- Multiple ESP32 devices support
- Temperature and humidity sensors
- Sound/alarm integration
- Solar panel monitoring
- Battery health tracking
- OTA firmware updates via web interface

**5. Control Features**
- Scheduling (turn on/off at specific times)
- Automation rules (if-then logic)
- Geo-fencing (control based on location)
- Voice control integration (Alexa, Google Home)
- Mobile app (React Native)

**6. Security & Authentication**
- User login system
- Role-based access control (RBAC)
- Private MQTT broker
- End-to-end encryption
- Audit logs

**7. Testing & Quality**
- Unit tests (Jest, React Testing Library)
- Integration tests (Cypress, Playwright)
- E2E tests for critical workflows
- Performance monitoring (Lighthouse)
- Error tracking (Sentry)

**8. Deployment & DevOps**
- CI/CD pipeline (GitHub Actions)
- Docker containerization
- Kubernetes orchestration
- Automatic deployment on merge
- Environment-specific configurations

**9. Documentation**
- API documentation (OpenAPI/Swagger)
- Interactive component storybook
- Video tutorials
- Architecture diagrams (C4 model)

**10. Performance Optimization**
- Server-Side Rendering (SSR) with Next.js
- Code splitting and lazy loading
- Image optimization
- CDN for static assets
- WebSocket connection pooling

---

## 📚 Libraries & Dependencies

### ESP32 Firmware
| Library | Version | Purpose | Repository |
|---------|---------|---------|------------|
| Arduino.h | Built-in | Core Arduino functions | - |
| WiFi.h | Built-in | ESP32 WiFi connectivity | - |
| PubSubClient | 2.8 | MQTT client for ESP32 | [GitHub](https://github.com/knolleary/pubsubclient) |
| SDL_Arduino_INA3221 | Latest | Triple-channel power monitoring | [GitHub](https://github.com/switchdoclabs/SDL_Arduino_INA3221) |
| Wire.h | Built-in | I2C communication | - |

### React Web Application
| Package | Version | Purpose | Documentation |
|---------|---------|---------|---------------|
| react | 18.3.1 | UI library | [Docs](https://react.dev/) |
| react-dom | 18.3.1 | React DOM rendering | [Docs](https://react.dev/) |
| react-router-dom | 6.22.0 | Client-side routing | [Docs](https://reactrouter.com/) |
| vite | 5.4.21 | Build tool & dev server | [Docs](https://vitejs.dev/) |
| tailwindcss | 3.4.3 | Utility-first CSS | [Docs](https://tailwindcss.com/) |
| chart.js | 4.4.0 | Canvas-based charts | [Docs](https://www.chartjs.org/) |
| react-chartjs-2 | 5.2.0 | React wrapper for Chart.js | [GitHub](https://github.com/reactchartjs/react-chartjs-2) |
| mqtt | 5.3.5 | MQTT.js WebSocket client | [Docs](https://github.com/mqttjs/MQTT.js) |
| react-icons | 5.5.0 | Icon library | [Docs](https://react-icons.github.io/react-icons/) |
| postcss | 8.4.35 | CSS transformation | [Docs](https://postcss.org/) |
| autoprefixer | 10.4.18 | CSS vendor prefixes | [GitHub](https://github.com/postcss/autoprefixer) |

### Development Tools
| Tool | Purpose | Website |
|------|---------|---------|
| PlatformIO | ESP32 development environment | [platformio.org](https://platformio.org/) |
| VS Code | Code editor | [code.visualstudio.com](https://code.visualstudio.com/) |
| Node.js | JavaScript runtime | [nodejs.org](https://nodejs.org/) |
| npm | Package manager | [npmjs.com](https://www.npmjs.com/) |
| Git | Version control | [git-scm.com](https://git-scm.com/) |

---

## 🛠️ Development Workflow

### Setting Up Development Environment

**1. Clone and Install**
```bash
# Clone repository
git clone <repository-url>
cd Modular_ESP32_Controller

# Install React dependencies
cd web
npm install
```

**2. ESP32 Development**
```bash
# Build firmware
pio run -e esp32dev

# Upload to ESP32
pio run -e esp32dev --target upload

# Monitor serial output
pio device monitor -b 115200
```

**3. React Development**
```bash
# Start dev server with hot reload
cd web
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Making Changes

**ESP32 Firmware:**
1. Edit files in `src/` or `include/`
2. Build: `pio run -e esp32dev`
3. Upload: `pio run -e esp32dev --target upload`
4. Test: Monitor serial output

**React Application:**
1. Edit files in `web/src/`
2. Save changes (Vite auto-reloads)
3. Test in browser
4. Commit changes

### Testing Checklist

**ESP32:**
- [ ] Compiles without errors
- [ ] Connects to WiFi successfully
- [ ] Connects to MQTT broker
- [ ] Publishes sensor data correctly
- [ ] Responds to control messages
- [ ] Emergency logic works as expected
- [ ] No memory leaks (check with Serial Monitor)

**React App:**
- [ ] npm run build succeeds
- [ ] No console errors in browser
- [ ] MQTT connects successfully
- [ ] Charts update in real-time
- [ ] Data persists across navigation
- [ ] Responsive on mobile devices
- [ ] All buttons and controls work
- [ ] History page displays correctly

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-sensor

# Make changes and commit
git add .
git commit -m "Add: New temperature sensor integration"

# Push to remote
git push origin feature/new-sensor

# Create pull request on GitHub
```

### Code Style Guidelines

**ESP32 C++:**
- Use camelCase for functions: `void connectWiFi()`
- Use UPPER_SNAKE_CASE for constants: `const int LED_PIN = 2`
- Comment complex logic
- Keep functions focused and small

**React JavaScript:**
- Use PascalCase for components: `function Dashboard() {}`
- Use camelCase for functions and variables: `const updateChart = () => {}`
- Use hooks at top of component
- Keep components under 500 lines
- Extract logic into custom hooks when possible
- Use meaningful prop names

**Tailwind CSS:**
- Use utility classes: `className="bg-blue-500 text-white"`
- Group related utilities: `className="flex items-center justify-between"`
- Extract repeated patterns into components

---

## 📖 References & Documentation

### Official Documentation
- [React Documentation](https://react.dev/) - React fundamentals
- [Vite Documentation](https://vitejs.dev/) - Build tool configuration
- [React Router](https://reactrouter.com/) - Client-side routing
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Chart.js](https://www.chartjs.org/) - Data visualization
- [PlatformIO Docs](https://docs.platformio.org/) - ESP32 development
- [ESP32 Arduino Core](https://docs.espressif.com/projects/arduino-esp32/) - Arduino framework
- [PubSubClient Library](https://pubsubclient.knolleary.net/) - MQTT for Arduino
- [MQTT.js Documentation](https://github.com/mqttjs/MQTT.js) - WebSocket MQTT client
- [HiveMQ Public Broker](https://www.hivemq.com/mqtt/public-mqtt-broker/) - Free MQTT broker

### MQTT Protocol
- [MQTT Specification](https://mqtt.org/) - Official protocol docs
- [MQTT Topics Guide](https://www.hivemq.com/blog/mqtt-essentials-part-5-mqtt-topics-best-practices/) - Topic naming best practices
- [MQTT QoS Levels](https://www.hivemq.com/blog/mqtt-essentials-part-6-mqtt-quality-of-service-levels/) - Quality of Service explained

### Hardware References
- [ESP32 Datasheet](https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf) - Complete specifications
- [INA3221 Datasheet](https://www.ti.com/lit/ds/symlink/ina3221.pdf) - Power monitor chip
- [ESP32 Pinout Reference](https://randomnerdtutorials.com/esp32-pinout-reference-gpios/) - GPIO mapping

### Tutorials & Learning
- [React Tutorial](https://react.dev/learn) - Learn React from scratch
- [Tailwind CSS Tutorial](https://tailwindcss.com/docs/utility-first) - Learn utility-first CSS
- [MQTT Essentials](https://www.hivemq.com/mqtt-essentials/) - Complete MQTT guide
- [ESP32 Arduino Tutorials](https://randomnerdtutorials.com/projects-esp32/) - Practical ESP32 projects
- [Chart.js Getting Started](https://www.chartjs.org/docs/latest/getting-started/) - Chart basics

### Project-Specific Documentation
- **[README.md](README.md)** - Project overview and quick start
- **[HOW_TO_RUN.md](HOW_TO_RUN.md)** - Complete setup and running guide
- **[web/README.md](web/README.md)** - Comprehensive React application documentation

---

## 📝 License

This project is for educational purposes. Feel free to use, modify, and distribute.

---

## 👤 Author & Project Info

**Project**: Light Intensity & Power Backup System with React Dashboard  
**Architecture**: Modular ESP32 Firmware + Modern React Web Application  
**Technology Stack**: ESP32, INA3221, React 18, Vite, Tailwind CSS, Chart.js, MQTT  
**Date**: December 2024  

### Project Milestones

- **Phase 1**: Basic ESP32 MQTT control with HTML interface
- **Phase 2**: Added INA3221 power monitoring and light intensity sensor
- **Phase 3**: Implemented emergency power cut sequence
- **Phase 4**: Converted to modular C++ firmware architecture
- **Phase 5**: Complete React migration with Chart.js integration ✅
- **Phase 6**: Optimized performance (2 samples/sec, throttling, animations)
- **Phase 7**: Implemented data persistence with LocalStorage
- **Phase 8**: Added power cut history and analytics
- **Current**: Production-ready with comprehensive documentation

### Key Achievements

✅ Modular, maintainable firmware architecture  
✅ Component-based React application  
✅ Real-time monitoring with smooth chart animations  
✅ Data persistence across page navigation  
✅ Responsive design for mobile and desktop  
✅ Comprehensive error handling and reconnection logic  
✅ Extensive documentation for developers and users  

---

## 🎓 Learning Outcomes

By studying or contributing to this project, you will learn:

**Hardware & Embedded Systems:**
✅ ESP32 WiFi connectivity and configuration  
✅ I2C communication with sensors (INA3221)  
✅ GPIO control and digital input reading  
✅ Real-time sensor data acquisition  
✅ Modular firmware architecture  

**IoT Communication:**
✅ MQTT publish/subscribe protocol  
✅ Cloud IoT communication patterns  
✅ WebSocket connections for browsers  
✅ Real-time bidirectional messaging  
✅ Topic design and message routing  

**Web Development:**
✅ Modern React with hooks (useState, useEffect, useRef, useCallback)  
✅ Custom React hooks for business logic  
✅ React Router for SPA navigation  
✅ Chart.js integration for data visualization  
✅ Tailwind CSS utility-first styling  
✅ Responsive design patterns  

**Software Architecture:**
✅ Component-based design  
✅ Separation of concerns (modular firmware, presentational components)  
✅ State management patterns  
✅ Data persistence strategies  
✅ Performance optimization techniques  

**Development Tools:**
✅ PlatformIO for embedded development  
✅ Vite for fast React development  
✅ npm package management  
✅ Browser DevTools for debugging  
✅ Version control with Git  

**Advanced Concepts:**
✅ Lazy initialization for performance  
✅ Throttling and debouncing  
✅ LocalStorage for client-side persistence  
✅ WebSocket lifecycle management  
✅ Asynchronous programming  
✅ Real-time data streaming  

---

**🌟 Congratulations on exploring this advanced IoT monitoring system! 🌟**

**Ready to build your own IoT solutions with modern web technologies!** 🚀

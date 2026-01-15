# ESP32 IoT Dashboard - React + Vite Application

Modern real-time web dashboard for ESP32 IoT monitoring and control system with power management and light intensity monitoring.

---

## 📋 Overview

A React-based single-page application with real-time MQTT communication featuring:
- **Real-time Monitoring**: Light intensity, dual power sources (battery + main power)
- **Live Data Visualization**: Interactive charts with Chart.js showing voltage trends
- **Control Interface**: Toggle switches for system controls and emergency light
- **Power Cut Management**: Automated alerts and history tracking
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Data Persistence**: LocalStorage for chart data and history across page navigation

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **ESP32** with firmware running and connected to MQTT broker

### Installation

1. Navigate to web directory:
```bash
cd web
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Access the dashboard:
```
http://localhost:3001
```

### Production Build

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
web/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Header.jsx      # App header with connection status
│   │   ├── Sidebar.jsx     # Navigation sidebar
│   │   └── Card.jsx        # Card containers
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx   # Main monitoring dashboard
│   │   └── History.jsx     # Power cut history viewer
│   ├── hooks/              # Custom React hooks
│   │   └── useMQTT.js      # MQTT connection management
│   ├── App.jsx             # Main app component with routing
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── README.md               # This file
```

---

## 🎨 Tech Stack

### Core Technologies
- **React 18.3.1** - UI framework with hooks
- **Vite 5.2.11** - Fast build tool and dev server
- **React Router 6.22.0** - Client-side routing

### UI & Styling
- **Tailwind CSS 3.4.3** - Utility-first CSS framework
- **React Icons** - Icon library (Font Awesome, Heroicons)
- **Custom Theme** - Primary colors with smooth animations

### Data Visualization
- **Chart.js 4.4.0** - Powerful charting library
- **react-chartjs-2 5.2.0** - React wrapper for Chart.js
- **Custom Plugins** - Latest value labels on charts

### Communication
- **MQTT.js 5.3.5** - MQTT client for browser
- **WebSocket** - Real-time bidirectional communication
- **HiveMQ Cloud Broker** - wss://broker.hivemq.com:8884/mqtt

---

## 🌐 Available Pages

### Dashboard (`/`)
**Real-time Monitoring & Control**
- **Live Metrics**:
  - LED status with ON/OFF controls
  - System and intensity control toggles
  - Emergency light control (ON/OFF/AUTO)
  - Light intensity percentage (0-100%)
  - Battery voltage/current/power (Channel 1)
  - Main power voltage/current/power (Channel 2)
  - WiFi signal strength and RSSI
  
- **Real-time Charts**:
  - 5V System voltage graph (last 60 data points)
  - Main Power voltage graph (last 60 data points)
  - Smooth animations with 500ms throttling
  - Timestamp tracking with sliding window
  - 1-minute average voltage display
  - Custom latest value labels on charts

- **Alerts & Logs**:
  - Power cut detection with visual/audio alerts
  - Browser notifications for power failures
  - Real-time command log with timestamps
  - Color-coded log entries (error/success/warning/info)

### History (`/history`)
**Power Cut Analytics & Data Export**
- **Statistics Cards**:
  - Total power cuts count
  - Total downtime (minutes)
  - Total battery usage (mWh)
  - Average voltage drop (V)

- **Visualization Charts**:
  - Battery voltage drainage over time (Line chart)
  - Power cut duration timeline (Bar chart)
  - Battery energy consumption (Line chart)
  - Last 10 events displayed

- **Data Table**:
  - Detailed power cut log with timestamps
  - Duration tracking (ms and minutes)
  - Voltage analysis (start/end/drop)
  - Energy consumption per event
  - Color-coded duration indicators
  - Export to CSV functionality
  - Clear history option

---

## 📡 MQTT Integration

### Broker Configuration

```javascript
const MQTT_BROKER = 'wss://broker.hivemq.com:8884/mqtt';
const CLIENT_ID = 'Dashboard_' + Math.random().toString(16).substr(2, 8);
```

### Topics & Messages

**Control Topics** (Dashboard → ESP32):
- `esp32/led/control` → "ON"/"OFF"
- `esp32/led2/control` → "ON"/"OFF"
- `esp32/led4/control` → "ON"/"OFF"
- `esp32/emergency/control` → "AUTO"/"ON"/"OFF"

**Status Topics** (ESP32 → Dashboard):
- `esp32/led/status` → "ON"/"OFF"
- `esp32/sensor/voltage` → "12.45"
- `esp32/powercut/status` → "POWER_CUT"/"NORMAL"
- `esp32/history/powercut` → JSON data

---

## 🎛️ Key Features

### 1. Real-Time Data Updates
- **Update Rate**: 2 samples per second (500ms throttling)
- **Data Buffer**: Latest values cached in React refs
- **Synchronized**: Both voltage charts update together
- **Animations**: 300ms smooth transitions
- **Performance**: Optimized with debounced saves

### 2. Data Persistence
- **Chart Data**: 60 data points preserved in localStorage
- **Navigation**: Data persists when switching pages
- **Lazy Load**: Data loaded only once on component mount
- **Auto-save**: Throttled saves every 1 second
- **Cleanup**: Final save on unmount

### 3. Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Fixed Sidebar**: Desktop width 250px, mobile slide-in
- **Adaptive Layout**: 1-3 column grids
- **Touch-Friendly**: Large tap targets
- **Hamburger Menu**: Mobile navigation

### 4. Alert System
- **Visual**: Red/green banners with animations
- **Audio**: Web Audio API beep sounds
- **Browser**: Native notifications
- **Test**: Manual alert testing

---

## 🔧 Configuration Files

### vite.config.js
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: true
  }
})
```

### tailwind.config.js
```javascript
theme: {
  extend: {
    colors: {
      'primary-blue': '#4A90E2',
      'primary-green': '#50C878',
      'primary-yellow': '#F4B400',
      'primary-red': '#FF6B6B',
      'primary-purple': '#9D4EDD'
    }
  }
}
```

---

## 📊 Chart Features

- **60 Data Points**: Sliding window with timestamp labels
- **Throttled Updates**: Max 2 updates per second
- **Continuous Lines**: spanGaps enabled
- **Value Labels**: Custom plugin shows latest voltage
- **Dual Charts**: 5V System (blue) + Main Power (purple)
- **Average Display**: 1-minute rolling average

---

## 💾 LocalStorage Schema

```javascript
// Dashboard chart data
dashboardChartData: {
  labels1: [...60 timestamps],
  data1: [...60 voltage values],
  labels2: [...60 timestamps],
  data2: [...60 voltage values],
  avgVoltage1: "12.44",
  avgVoltage2: "220.4",
  dataPointIndex: 45,
  timestamp: 1735689015000
}

// Power cut history
powerCutHistory: [
  {
    timestamp: "12/31/2025, 10:30:45 AM",
    duration: 120000,
    startV: 12.5,
    endV: 11.8,
    drop: 0.7,
    energy: 245.3
  }
]
```

---

## 🚀 npm Scripts

```bash
npm run dev      # Start dev server (port 3001)
npm run build    # Build for production
npm run preview  # Preview production build
npm run server   # Legacy Node.js server (deprecated)
```

---

## 🔧 Troubleshooting

**Charts not updating**
→ Check MQTT connection status, verify ESP32 publishing

**Data not persisting**
→ Check localStorage in DevTools (F12 → Application)

**Mobile sidebar issues**
→ Verify React Icons installed, check z-index

**MQTT connection failed**
→ Check internet, verify broker URL, test in another browser

**Build errors**
→ Delete node_modules, npm install, check Node.js version

---

## 📱 Responsive Breakpoints

- **sm**: 640px (Tablets portrait)
- **md**: 768px (Tablets landscape)  
- **lg**: 1024px (Desktops)
- **xl**: 1280px (Large desktops)

---

## 🔐 Security Notes

**Current** (Development):
- ⚠️ Public MQTT broker
- ⚠️ No authentication
- ⚠️ Client-side storage only

**Recommended** (Production):
- ✅ Private MQTT broker
- ✅ User authentication
- ✅ HTTPS/WSS
- ✅ Rate limiting

---

## 🚀 Future Enhancements

- TypeScript migration
- Unit/E2E tests
- PWA offline support
- Theme toggle (dark/light)
- Multi-language (i18n)
- Advanced analytics
- Email/SMS alerts
- Mobile app

---

## 📖 Component API

### useMQTT Hook
```javascript
const { connectionStatus, publish } = useMQTT(handleMessage);
```

### Header Props
```javascript
<Header
  title="string"
  subtitle="string"
  onTestAlert={() => void}
  connectionStatus="string"
  onToggleMenu={() => void}
  isMenuOpen={boolean}
/>
```

### Sidebar Props
```javascript
<Sidebar isOpen={boolean} onClose={() => void} />
```

---

## 📝 License

Educational and personal use.

---

## 👤 Author

ESP32 IoT Dashboard - React Implementation  
December 2025

---

## 🔗 Related Docs

- [Main README](../README.md)
- [How to Run](../HOW_TO_RUN.md)
- [Project Docs](../PROJECT_DOCUMENTATION.md)

---

**Built with ❤️ using React, Vite, and Tailwind CSS**

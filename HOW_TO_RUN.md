# 🚀 HOW TO RUN - ESP32 IoT Monitoring System (React + Vite)
---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Hardware Setup](#hardware-setup)
3. [Software Installation](#software-installation)
4. [ESP32 Firmware Upload](#esp32-firmware-upload)
5. [React Web Dashboard Setup](#react-web-dashboard-setup)
6. [Running the System](#running-the-system)
7. [Testing & Verification](#testing--verification)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Configuration](#advanced-configuration)

---

## 📦 System Requirements

### Hardware
- **ESP32 Dev Module** (38-pin board with ESP32-D0WD-V3 chip)
- **INA3221 Triple-Channel Power Monitor** (I2C address 0x40)
- **3-bit Light Intensity Sensor** (binary input)
- **USB Cable** (Type-A to Micro-USB)
- **Power supplies** for battery backup and main power monitoring
- **Optional**: External LEDs for GPIO 13 and GPIO 14

### Software
- **Windows OS** (or Linux/macOS)
- **Visual Studio Code** with PlatformIO extension
- **Node.js** (v16 or higher) - Download from [nodejs.org](https://nodejs.org/)
- **Git** (optional, for version control)
- **Modern Web Browser** (Chrome, Firefox, or Edge with WebSocket support)

### Network
- **WiFi Network** with internet access
- **MQTT Broker**: HiveMQ public cloud (broker.hivemq.com)

---

## 🔧 Hardware Setup

### Step 1: Wire the ESP32

#### Pin Connections

| Component | ESP32 Pin | GPIO | Description |
|-----------|-----------|------|-------------|
| Built-in LED | - | GPIO 2 | Status indicator |
| System Control | - | GPIO 13 | External LED (inverted logic) |
| Intensity Control | - | GPIO 14 | External LED (inverted logic) |
| Emergency Light | - | GPIO 27 | Emergency light output |
| Light Sensor B0 | - | GPIO 32 | Intensity bit 0 (LSB) |
| Light Sensor B1 | - | GPIO 33 | Intensity bit 1 |
| Light Sensor B2 | - | GPIO 35 | Intensity bit 2 (MSB) |
| INA3221 SDA | SDA | GPIO 21 | I2C Data |
| INA3221 SCL | SCL | GPIO 22 | I2C Clock |
| INA3221 VCC | 3.3V | - | Power supply |
| INA3221 GND | GND | - | Ground |

#### Light Intensity Encoding
```
Binary Input → Percentage
000 (0) → 0%
001 (1) → 14.3%
010 (2) → 28.6%
011 (3) → 42.9%
100 (4) → 57.1%
101 (5) → 71.4%
110 (6) → 85.7%
111 (7) → 100%
```

### Step 2: Connect INA3221 Channels

- **Channel 1**: Connect to battery backup power source (voltage + current shunt)
- **Channel 2**: Connect to main power source (voltage + current shunt)

### Step 3: Connect USB Cable

- Plug the ESP32 into your computer via USB
- Note the COM port (e.g., COM4)

---

## 💻 Software Installation

### Step 1: Install Visual Studio Code

1. Download from [code.visualstudio.com](https://code.visualstudio.com/)
2. Install with default settings

### Step 2: Install PlatformIO Extension

1. Open VS Code
2. Click Extensions icon (left sidebar)
3. Search for "PlatformIO IDE"
4. Click **Install**
5. Wait for installation to complete (may take several minutes)
6. Restart VS Code if prompted

### Step 3: Install Node.js

1. Download from [nodejs.org](https://nodejs.org/) (LTS version 16+ recommended)
2. Run installer
3. Accept default settings
4. **Important**: Check "Automatically install necessary tools" (for node-gyp)
5. Verify installation:
   ```powershell
   node --version  # Should show v16.x.x or higher
   npm --version   # Should show 8.x.x or higher
   ```

---

## 📤 ESP32 Firmware Upload

### Step 1: Open Project in PlatformIO

1. Open VS Code
2. Click **PlatformIO Home** icon (bottom toolbar)
3. Select **Open Project**
4. Navigate to:
   ```
   d:\Projects\Modular_ESP32_Controller
   ```
5. Click **Open**

### Step 2: Configure WiFi Credentials

1. Open `include/config.h`
2. Find the WiFi settings section:
   ```cpp
   const char* ssid = "Chamix";
   const char* password = "12345678";
   ```
3. **IMPORTANT**: Change to your WiFi network:
   ```cpp
   const char* ssid = "YOUR_WIFI_NAME";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```
4. Save the file (Ctrl+S)

### Step 3: Verify COM Port

1. Open `platformio.ini`
2. Verify the COM port matches your device:
   ```ini
   upload_port = COM4
   monitor_port = COM4
   ```
3. If different, change to your actual COM port
4. Save the file

### Step 4: Build and Upload

1. Click the **PlatformIO** icon (ant icon) in left sidebar
2. Expand **esp32dev** → **General**
3. Click **Build** (checkmark icon) - wait for successful build
4. Click **Upload** (arrow icon) - firmware will upload to ESP32
5. Wait for "SUCCESS" message

### Step 5: Verify Connection

1. Click **Monitor** (plug icon) in PlatformIO
2. Watch for output:
   ```
   Connecting to WiFi: YOUR_WIFI_NAME
   ✓ WiFi Connected!
   IP Address: 192.168.x.x
   ✓ Connected to MQTT Broker
   ```
3. If you see this, the ESP32 is ready!

**Note**: Keep the Serial Monitor open to see real-time logs from the ESP32.

---

## 🌐 React Web Dashboard Setup

### Step 1: Navigate to Web Directory

Open PowerShell or Command Prompt:
```powershell
cd "d:\Projects\Modular_ESP32_Controller\web"
```

### Step 2: Install Dependencies

**First time only** - Install all React and Node.js dependencies:
```powershell
npm install
```

This installs the complete technology stack:
- **React 18.3.1** - UI library
- **Vite 5.4.21** - Build tool and development server
- **React Router 6.22.0** - Client-side routing
- **Tailwind CSS 3.4.3** - Styling framework
- **Chart.js 4.4.0** & react-chartjs-2 5.2.0 - Data visualization
- **MQTT.js 5.3.5** - WebSocket MQTT client
- **React Icons 5.5.0** - Icon library
- **PostCSS & Autoprefixer** - CSS processing

### Step 3: Start the Vite Development Server

```powershell
npm run dev
```

You should see output like:
```
  VITE v5.4.21  ready in 500 ms

  ➜  Local:   http://localhost:3001/
  ➜  Network: http://192.168.x.x:3001/
  ➜  press h + enter to show help
```

**Important Notes:**
- The React app runs on **port 3001** (not 3000)
- Vite provides Hot Module Replacement (HMR) for instant updates
- **Keep this terminal window open** - the server must run continuously
- Changes to React files will automatically reload in the browser

### Step 4: Build for Production (Optional)

To create an optimized production build:
```powershell
npm run build
```

This creates a `dist/` folder with optimized static files.

To preview the production build:
```powershell
npm run preview
```

---

## ⚡ Running the System

### Complete Startup Sequence

#### 1. Power On ESP32
- Connect ESP32 via USB or external power
- Built-in LED will blink rapidly during WiFi connection
- LED will stay solid once connected
- Check Serial Monitor for confirmation:
  ```
  === ESP32 MQTT LED Controller (Modular) ===
  ✓ Hardware initialized
  ✓ WiFi Connected! IP: 192.168.x.x
  ✓ MQTT Connected
  ```

#### 2. Start Vite Development Server (if not running)
```powershell
cd "d:\Projects\Modular_ESP32_Controller\web"
npm run dev
```

#### 3. Access React Dashboard

Open your web browser and navigate to:
```
http://localhost:3001/
```

The React application will automatically redirect you to the Dashboard page.

#### 4. Verify System Status

Check the dashboard shows:
- **MQTT Status**: Connected (green badge in header)
- **Light Intensity**: Current reading (0-100%)
- **Battery Voltage/Current**: Real-time values with live charts
- **Main Power Voltage/Current**: Real-time values with live charts
- **Power Status**: Normal (green) or Power Cut (red)
- **Charts**: Updating smoothly at 2 samples per second

---

## 🎮 Using the React Dashboard

### Main Dashboard Page (`/`)

The Dashboard is a modern React application with real-time monitoring capabilities.

#### Real-Time Monitoring
- **Light Intensity Display**: Live percentage (0-100%) with visual indicator
- **Dual Voltage Charts**: 
  - Battery Monitor (Channel 1): Real-time chart with 60-sample history
  - Main Power Monitor (Channel 2): Real-time chart with 60-sample history
  - Charts update at 2 samples per second with smooth 300ms animations
  - Data persists across page navigation using LocalStorage
  - X-axis shows real-time timestamps
- **Power Calculations**: Automatic V × A = W calculations
- **Connection Status**: Live MQTT connection indicator in header

#### Manual Controls
- **Built-in LED**: Toggle ON/OFF (GPIO 2)
- **System Control**: Toggle GPIO 13 (inverted logic)
- **Intensity Control**: Toggle GPIO 14 (inverted logic)
- **Emergency Light**: Manual ON/OFF control (GPIO 27)

#### Features
- **Data Persistence**: Charts retain 60 samples even when navigating away
- **Lazy Initialization**: Fast page loads with LocalStorage-backed state
- **Throttled Updates**: Performance-optimized with 500ms update intervals
- **Smooth Animations**: 300ms linear transitions for chart updates
- **Responsive Design**: Mobile-friendly layout with Tailwind CSS

### History Page (`/history`)

View comprehensive power cut analytics with interactive visualizations:
- **Power Cut Statistics**: Total events, total duration, energy consumption
- **Voltage Drainage Chart**: Line chart showing voltage drop patterns
- **Duration Timeline**: Bar chart of power cut durations over time
- **Energy Consumption Chart**: Line chart of energy used during outages
- **Detailed Event Table**: Timestamp, duration, voltages, energy for each event
- **Export to CSV**: Download power cut history for external analysis
- **Full-Width Layout**: Optimized for data visualization

### Navigation

The React Router provides seamless navigation:
- **Header Navigation**: Click "Dashboard" or "History" to switch pages
- **Responsive Sidebar**: Mobile menu with hamburger icon
- **Browser History**: Full support for back/forward buttons
- **No Page Reloads**: SPA architecture for instant navigation

---

## 🔍 Testing & Verification

### Test 1: Basic LED Control

1. Open dashboard: `http://localhost:3001/`
2. Click **Built-in LED** toggle → LED on ESP32 should light up
3. Click again → LED should turn off
4. Check Serial Monitor for confirmation messages
5. Verify toggle button updates in real-time

### Test 2: Light Intensity Reading

1. Connect 3-bit binary input to GPIO 32, 33, 35
2. Change input values (000 to 111)
3. Dashboard should update with percentage (0-100%)
4. Verify the light intensity display updates immediately

### Test 3: Real-Time Charts and Data Persistence

1. Verify INA3221 is properly connected
2. Dashboard should show:
   - Battery voltage chart updating in real-time
   - Main power voltage chart updating in real-time
   - Charts display last 60 samples with timestamps
   - Update rate: 2 samples per second
3. **Test Data Persistence**:
   - Watch charts update for 10-15 seconds
   - Navigate to History page (click in header)
   - Return to Dashboard page
   - Verify charts still show the previous data (no reset)
   - Charts should continue updating from where they left off
4. **Test Smooth Animations**:
   - Observe chart lines animate smoothly (300ms transitions)
   - No jumps or discontinuities in the graph

### Test 4: Emergency Power Cut Simulation

1. Reduce main power voltage below 9.0V
2. Watch Serial Monitor for:
   ```
   ⚠️ POWER CUT DETECTED!
   Starting emergency sequence...
   GPIO13 ON immediately
   GPIO14 ON after 200ms
   ```
3. Dashboard should show:
   - Power Status: POWER CUT (red)
   - Emergency mode activated
4. After 60 seconds:
   - GPIO13 and GPIO14 turn OFF
   - If light intensity < 40%, Emergency Light (GPIO27) turns ON
5. Restore power > 9.0V → System returns to normal

### Test 5: Manual Emergency Override & History

1. Click **Emergency Light** toggle on dashboard
2. GPIO27 should turn ON regardless of power status
3. Navigate to History page (`/history`)
4. Verify power cut history displays with charts:
   - Voltage drainage chart
   - Duration timeline (bar chart)
   - Energy consumption chart
   - Detailed event table
5. Test CSV export functionality

### Test 6: React Router Navigation

1. Start on Dashboard page
2. Click "History" in header → Should navigate instantly without reload
3. Click "Dashboard" → Should return to Dashboard page
4. Use browser back button → Should navigate between pages
5. Verify MQTT connection stays alive during navigation

### Test 7: Responsive Design

1. Resize browser window to mobile size (<768px width)
2. Verify sidebar collapses to hamburger menu
3. Verify charts remain readable
4. Test mobile navigation works correctly

---

## 🔧 Troubleshooting

### ESP32 Issues

#### Problem: WiFi Not Connecting
```
Solution:
1. Verify SSID and password in main.cpp
2. Check WiFi network is 2.4GHz (ESP32 doesn't support 5GHz)
3. Ensure router is broadcasting SSID
4. Move ESP32 closer to router
```

#### Problem: Upload Failed
```
Solution:
1. Check USB cable is data-capable (not charge-only)
2. Verify correct COM port in platformio.ini
3. Hold BOOT button on ESP32 during upload
4. Try different USB port
5. Install/update USB drivers (CP2102 or CH340)
```

#### Problem: MQTT Connection Failed
```
Solution:
1. Verify ESP32 has internet access (ping google.com from router)
2. Check broker.hivemq.com is accessible
3. Restart ESP32 (reset button)
4. Check Serial Monitor for error messages
```

#### Problem: INA3221 Not Detected
```
Solution:
1. Verify I2C connections (SDA=GPIO21, SCL=GPIO22)
2. Check INA3221 power (3.3V and GND)
3. Verify I2C address is 0x40 (default)
4. Test with I2C scanner sketch
```

### Web Dashboard Issues

#### Problem: Vite Dev Server Won't Start
```
Solution:
1. Verify Node.js is installed: node --version (v16+ required)
2. Delete node_modules and package-lock.json
3. Run: npm install (in web directory)
4. Check port 3001 is not in use
5. Try different port: npm run dev -- --port 3002
6. Check console for specific error messages
```

#### Problem: Dashboard Not Updating / Charts Frozen
```
Solution:
1. Open browser DevTools console (F12)
2. Check for WebSocket connection errors
3. Verify MQTT broker is accessible (broker.hivemq.com)
4. Clear browser cache and LocalStorage (Ctrl+Shift+Delete)
5. Check ESP32 is publishing data (Serial Monitor)
6. Verify no JavaScript errors in console
7. Try hard refresh (Ctrl+Shift+R)
```

#### Problem: MQTT Connection Failed (Browser)
```
Solution:
1. Verify internet connection
2. Check browser allows WebSocket connections
3. Try different browser (Chrome recommended)
4. Verify wss://broker.hivemq.com:8884/mqtt is accessible
5. Check browser console for connection error details
6. Disable browser extensions that might block WebSockets
```

#### Problem: Charts Show Old Data / Not Persisting
```
Solution:
1. Check browser LocalStorage is enabled
2. Open DevTools → Application → Local Storage → http://localhost:3001
3. Verify chartData1, chartData2 keys exist with data
4. Clear LocalStorage if corrupted: localStorage.clear()
5. Refresh page and let charts repopulate
```

#### Problem: Build Errors with npm run build
```
Solution:
1. Ensure all dependencies are installed: npm install
2. Check Node.js version is 16+ : node --version
3. Delete node_modules: Remove-Item -Recurse -Force node_modules
4. Delete package-lock.json: Remove-Item package-lock.json
5. Reinstall: npm install
6. Try build again: npm run build
```

### Network Issues

#### Problem: Can't Access from Other Devices on Network
```
Solution:
1. Get your computer's local IP:
   PowerShell: ipconfig
   Look for "IPv4 Address" (e.g., 192.168.1.100)
2. Vite automatically shows network URL when starting:
   ➜ Network: http://192.168.x.x:3001/
3. Ensure devices are on same WiFi network
4. Check Windows Firewall allows port 3001:
   Control Panel → Windows Defender Firewall → Advanced Settings
   → Inbound Rules → New Rule → Port 3001 → Allow connection
5. Try accessing from other device: http://[YOUR_IP]:3001/
```

---

## ⚙️ Advanced Configuration

### Change MQTT Topics

Edit `include/config.h` in the ESP32 firmware:
```cpp
const char* mqtt_topic = "your/custom/topic";
```

Then update the corresponding topics in the React application:
Edit `web/src/hooks/useMQTT.js` and `web/src/pages/Dashboard.jsx`

### Adjust Chart Update Rate

Edit `web/src/pages/Dashboard.jsx`:
```javascript
// Change throttle interval (default: 500ms = 2 samples/sec)
const THROTTLE_INTERVAL = 500; // milliseconds

// Change sample storage count (default: 60)
const MAX_DATA_POINTS = 60; // number of samples

// Change animation duration (default: 300ms)
animation: {
  duration: 300, // milliseconds
}
```

### Customize Chart Appearance

Edit chart options in `web/src/pages/Dashboard.jsx`:
```javascript
// Change colors
borderColor: 'rgb(59, 130, 246)', // Blue
backgroundColor: 'rgba(59, 130, 246, 0.1)',

// Change line thickness
borderWidth: 2,

// Enable/disable animations
animation: {
  duration: 0, // Disable animations
}
```

### Adjust Emergency Thresholds

In `include/config.h`:
```cpp
const float POWER_CUT_THRESHOLD = 9.0;  // Change voltage threshold
const unsigned long EMERGENCY_DURATION = 60000;  // Change duration (ms)
const unsigned long GPIO14_DELAY = 200;  // Change GPIO14 delay (ms)
const int LIGHT_THRESHOLD = 40; // Change light intensity threshold (%)
```

### Enable Production Build

For optimized deployment:
```powershell
cd "d:\Projects\Modular_ESP32_Controller\web"
npm run build
```

This creates a `dist/` folder with:
- Minified JavaScript bundles
- Optimized CSS
- Compressed assets
- Production-ready index.html

Deploy the `dist/` folder to any static hosting service:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag and drop dist folder
- **GitHub Pages**: Push dist to gh-pages branch
- **Azure Static Web Apps**: Connect GitHub repo

### Configure LocalStorage Persistence

Edit `web/src/pages/Dashboard.jsx` to change storage keys:
```javascript
// Change storage keys
const STORAGE_KEY_CHART1 = 'myapp_chartData1';
const STORAGE_KEY_CHART2 = 'myapp_chartData2';

// Change save delay
const SAVE_DELAY = 1000; // milliseconds
```

### Deploy to Cloud (Internet Access)

**Option 1: Vercel (Recommended for React + Vite)**
```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy from web directory
cd "d:\Projects\Modular_ESP32_Controller\web"
vercel deploy

# Follow prompts, get live URL: https://your-app.vercel.app
```

**Option 2: Netlify**
```powershell
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

**Option 3: GitHub Pages**
```powershell
# Build the app
npm run build

# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts:
# "deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

**Option 4: Azure Static Web Apps**
- Connect your GitHub repository
- Set build command: `npm run build`
- Set output directory: `dist`
- Azure automatically deploys on git push

---

## 📊 System Architecture

```
┌──────────────────────────┐         ┌────────────────────┐         ┌─────────────────────┐
│   React Dashboard        │         │   MQTT Broker      │         │       ESP32         │
│   (Vite + React)         │         │   (HiveMQ Cloud)   │         │    + INA3221        │
│   localhost:3001         │────────▶│ broker.hivemq.com  │────────▶│    + Sensors        │
│                          │         │                    │         │    GPIO Controls    │
│   Components:            │◀────────│   MQTT Topics      │◀────────│    Modular C++      │
│   - Dashboard.jsx        │         │   Port 1883 (TCP)  │         │                     │
│   - History.jsx          │         │   Port 8884 (WSS)  │         └─────────────────────┘
│   - useMQTT hook         │         │                    │              WiFi Connection
│                          │         └────────────────────┘              USB/COM Port
└──────────────────────────┘              Internet
   React Router                         WebSocket (WSS)
   Chart.js Visualization              MQTT.js Client
   LocalStorage Persistence
```

### Technology Flow

1. **ESP32 Firmware** (Modular C++)
   - `main.cpp` → Entry point
   - `hardware.cpp` → GPIO & sensor control
   - `network.cpp` → WiFi & MQTT communication
   - `config.h` → Configuration constants
   
2. **MQTT Communication**
   - ESP32 publishes sensor data every 500ms
   - React app subscribes via WebSocket
   - Bidirectional control messages
   
3. **React Application**
   - Vite dev server with HMR
   - React Router for navigation
   - useMQTT custom hook manages connection
   - Chart.js visualizes real-time data
   - LocalStorage persists chart history

---

## 📈 MQTT Topics Reference

| Topic | Direction | Purpose |
|-------|-----------|---------|
| `esp32/led/control` | Web → ESP32 | Built-in LED control (ON/OFF) |
| `esp32/led/status` | ESP32 → Web | Built-in LED status |
| `esp32/led2/control` | Web → ESP32 | GPIO13 control (ON/OFF) |
| `esp32/led2/status` | ESP32 → Web | GPIO13 status |
| `esp32/led4/control` | Web → ESP32 | GPIO14 control (ON/OFF) |
| `esp32/led4/status` | ESP32 → Web | GPIO14 status |
| `esp32/emergency/control` | Web → ESP32 | Emergency light control |
| `esp32/emergency/status` | ESP32 → Web | Emergency light status |
| `esp32/light/intensity` | ESP32 → Web | Light intensity (0-100%) |
| `esp32/sensor/voltage` | ESP32 → Web | Battery voltage (V) |
| `esp32/sensor/current` | ESP32 → Web | Battery current (A) |
| `esp32/sensor2/voltage` | ESP32 → Web | Main power voltage (V) |
| `esp32/sensor2/current` | ESP32 → Web | Main power current (A) |
| `esp32/powercut/status` | ESP32 → Web | Power status (NORMAL/CUT) |
| `esp32/history/powercut` | ESP32 → Web | Power cut event history (JSON) |
| `esp32/command/status` | ESP32 → Web | Command execution status |

---

## 🎯 Quick Reference Commands

### ESP32 Firmware
```powershell
# Navigate to project
cd "d:\Projects\Modular_ESP32_Controller"

# Build firmware
pio run -e esp32dev

# Upload to ESP32
pio run -e esp32dev --target upload

# Open serial monitor
pio device monitor -b 115200

# Clean build
pio run -t clean
```

### React Web Application
```powershell
# Navigate to web directory
cd "d:\Projects\Modular_ESP32_Controller\web"

# Install dependencies (first time)
npm install

# Start development server (port 3001)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for outdated packages
npm outdated

# Update dependencies
npm update
```

### Browser Access
```
Local:    http://localhost:3001/
Network:  http://[YOUR_IP]:3001/
```

---

## 📝 Important Notes

1. **Keep Serial Monitor Open**: Essential for debugging and seeing real-time ESP32 logs

2. **Vite Dev Server Must Run**: Execute `npm run dev` to access the React dashboard

3. **Port 3001**: The React application runs on port 3001 (not 3000)

4. **Same Network**: For local network access, devices must be on the same WiFi

5. **Internet Required**: Both ESP32 and web browser need internet to connect to MQTT broker

6. **USB Power**: ESP32 can be powered via USB or external 5V supply

7. **Backup Configuration**: Save your WiFi credentials in `include/config.h` before updates

8. **Emergency Mode**: Automatic emergency light activation works when main power < 9.0V

9. **Manual Override**: Manual emergency light control overrides automatic logic

10. **Data Persistence**: Chart data persists in browser LocalStorage (60 samples per chart)

11. **React Hot Reload**: Vite automatically reloads changes - no manual refresh needed

12. **Browser Compatibility**: Use modern browsers (Chrome 90+, Firefox 88+, Edge 90+)

13. **LocalStorage Limits**: Browser LocalStorage limited to ~5-10MB per domain

---

## 📞 Support & Documentation

- **[Main README](README.md)** - Project overview and features
- **[React App Documentation](web/README.md)** - Comprehensive React application guide
- **[Project Documentation](PROJECT_DOCUMENTATION.md)** - Detailed system architecture
- **ESP32 Firmware** - Modular C++ code in `src/` directory
- **React Source Code** - Component-based architecture in `web/src/`

### Key Documentation Files

1. **web/README.md** - Complete React app documentation including:
   - Technology stack details (React, Vite, Tailwind, Chart.js, MQTT.js)
   - Component API reference
   - Custom hooks documentation
   - Chart configuration
   - LocalStorage schema
   - Troubleshooting guide
   - Development workflows

2. **include/config.h** - ESP32 configuration constants
3. **web/src/pages/Dashboard.jsx** - Main monitoring interface (1030 lines)
4. **web/src/pages/History.jsx** - Analytics and history (450 lines)
5. **web/src/hooks/useMQTT.js** - MQTT connection management

---

## ✅ Pre-Flight Checklist

Before running the system:

**Hardware Setup:**
- [ ] ESP32 properly wired with all sensors connected
- [ ] INA3221 on I2C bus (SDA=GPIO21, SCL=GPIO22)
- [ ] Light intensity sensor connected (GPIO 32, 33, 35)
- [ ] Emergency light wired to GPIO27
- [ ] Control LEDs on GPIO13 and GPIO14 (optional)
- [ ] USB cable connected (or external 5V power)

**Software Setup:**
- [ ] Visual Studio Code installed with PlatformIO extension
- [ ] Node.js v16+ installed and verified (`node --version`)
- [ ] WiFi credentials updated in `include/config.h`
- [ ] COM port verified in `platformio.ini`
- [ ] Firmware successfully uploaded to ESP32
- [ ] React dependencies installed (`npm install` in web directory)

**System Verification:**
- [ ] ESP32 shows "WiFi Connected" in Serial Monitor
- [ ] ESP32 shows "MQTT Connected" in Serial Monitor  
- [ ] Vite dev server running (`npm run dev`)
- [ ] Dashboard accessible at `http://localhost:3001/`
- [ ] MQTT connection status shows "Connected" in header
- [ ] Light intensity sensor reading and displaying
- [ ] Voltage charts updating in real-time
- [ ] Charts persist when navigating between pages
- [ ] Control buttons responsive and updating status

**Performance Checks:**
- [ ] Charts update at 2 samples per second
- [ ] Smooth 300ms animations on chart updates
- [ ] No discontinuities or holes in graphs
- [ ] Data persists after page refresh
- [ ] History page loads with analytics

---

## 🎉 You're Ready!

If all checks pass, your ESP32 IoT Monitoring System with React dashboard is fully operational!

**Access your dashboard at:** `http://localhost:3001/`

### What You Can Do:

✅ Monitor real-time voltage with interactive charts  
✅ Control GPIO outputs remotely via MQTT  
✅ View power cut history and analytics  
✅ Export data to CSV for external analysis  
✅ Access from any device on your network  
✅ Deploy to cloud for global access  

**Enjoy your intelligent power backup system with modern React interface! 🚀**

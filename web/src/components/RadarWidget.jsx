import { useEffect, useRef, useState } from "react";
import "./RadarWidget.css";
import { useRadarMQTT } from "../hooks/useRadarMQTT";

const MAX_RANGE = 1000;

function RadarWidget() {
  const canvasRef = useRef(null);
  const azimuthRef = useRef(null); 
  const statusRef = useRef(null);

  // --- MQTT RADAR HOOK ---
  const { radarStatus, radarData, initialScanReport, connectionStatus, controlRadar } = useRadarMQTT();

  const [isPowerOn, setIsPowerOn] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [scanReport, setScanReport] = useState([]);
  const [showUI, setShowUI] = useState(true);

  // Logic Refs
  const targetsRef = useRef([]);      
  const physicalAngleRef = useRef(90);
  const beamAngleRef = useRef(0);     
  const isManualRef = useRef(false);
  const lastCmdTime = useRef(0);
  const scanBufferRef = useRef(new Array(181).fill(null));

  // --- NEW: RESET HELPER FUNCTION ---
  const resetRadarUI = () => {
    // 1. Reset State
    setIsPowerOn(false);
    setIsManual(false);
    isManualRef.current = false;
    setScanReport([]); // Clear HUD List

    // 2. Clear Data & Visuals
    scanBufferRef.current = new Array(181).fill(null); // Clear Memory
    targetsRef.current = []; // Clear Green Dots
    beamAngleRef.current = 0; // Reset Beam to start
    
    // 3. Reset Text
    if (azimuthRef.current) azimuthRef.current.innerText = "000°";
  };

  // --- SYNC STATUS ---
  useEffect(() => {
    if (radarStatus === "ONLINE" && !isPowerOn) {
        setIsPowerOn(true);
    } else if (radarStatus === "STANDBY" && isPowerOn) {
        // If system goes Standby externally, perform full reset
        resetRadarUI();
    }
  }, [radarStatus]);

  useEffect(() => {
    if (statusRef.current) {
      if (connectionStatus === "Connected") {
        statusRef.current.innerText = radarStatus;
        statusRef.current.className = radarStatus === "ONLINE" ? "value" : "value alert";
      } else {
        statusRef.current.innerText = connectionStatus.toUpperCase();
        statusRef.current.className = "value alert";
      }
    }
  }, [connectionStatus, radarStatus]);

  // --- DATA HANDLING ---
  useEffect(() => {
    if (radarData.length === 0) return;
    
    const lastPoint = radarData[radarData.length - 1];
    if (lastPoint) {
      if (azimuthRef.current) azimuthRef.current.innerText = lastPoint.a.toString().padStart(3, '0') + "°";
      physicalAngleRef.current = lastPoint.a;
    }

    radarData.forEach(point => {
      const { a, d } = point;
      if (d > 20 && d < MAX_RANGE) {
        scanBufferRef.current[a] = { total: d, count: 1, timestamp: Date.now() };
      } else if (d >= MAX_RANGE || d < 20) {
         scanBufferRef.current[a] = null;
      }
    });

    generateScanReport();
  }, [radarData]);

  const generateScanReport = () => {
    const report = [];
    for (let i = 0; i <= 180; i++) {
      const slot = scanBufferRef.current[i];
      if (slot && slot.count > 0) {
        report.push({ angle: i, dist: slot.total });
      }
    }
    setScanReport(report.slice(0, 25)); 
  };

  useEffect(() => {
    const manualInterval = setInterval(() => {
      if (isManualRef.current) generateScanReport();
    }, 500);
    return () => clearInterval(manualInterval);
  }, []);

  // --- 360° SONAR ANIMATION LOOP ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false }); 
    const size = canvas.width;
    const r = size / 2;

    const buffer = document.createElement("canvas");
    buffer.width = size;
    buffer.height = size;
    const bctx = buffer.getContext("2d");

    const animate = () => {
      if (isPowerOn) {
         beamAngleRef.current = (beamAngleRef.current + 1) % 360; 
      }

      ctx.fillStyle = "rgba(0, 5, 0, 0.1)"; 
      ctx.fillRect(0, 0, size, size);
      bctx.clearRect(0, 0, size, size);
      
      const beamA = Math.floor(beamAngleRef.current);
      for(let i = 0; i < 5; i++) {
          let checkAngle = beamA - i;
          if(checkAngle < 0) checkAngle += 360;
          
          if(checkAngle >= 15 && checkAngle <= 165) {
              const data = scanBufferRef.current[checkAngle];
              if(data) {
                  targetsRef.current = targetsRef.current.filter(t => t.angle !== checkAngle);
                  targetsRef.current.push({
                      angle: checkAngle,
                      dist: data.total,
                      life: 1.0 
                  });
              }
          }
      }

      bctx.lineWidth = 2;
      bctx.lineCap = "round";
      const targets = targetsRef.current;

      for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        t.life -= 0.01; 
        
        if (t.life <= 0) continue;

        const opacity = t.life;
        const rad = (-t.angle * Math.PI) / 180;
        const px = (t.dist / MAX_RANGE) * r;
        const x = r + px * Math.cos(rad);
        const y = r + px * Math.sin(rad);

        bctx.beginPath();
        bctx.arc(x, y, 3, 0, Math.PI * 2);
        bctx.fillStyle = `rgba(0, 255, 100, ${opacity})`; 
        bctx.fill();
      }
      
      targetsRef.current = targetsRef.current.filter(t => t.life > 0);

      ctx.drawImage(buffer, 0, 0);
      drawStaticGrid(ctx, r, size);
      
      // Only draw beam if power is ON (or you can leave it parked at 0)
      if (isPowerOn) {
        drawBeam360(ctx, r, beamAngleRef.current); 
      }
      
      requestAnimationFrame(animate);
    };

    animate();
  }, [isPowerOn]); 

  // --- UPDATED HANDLERS ---
  const togglePower = (checked) => {
    if (checked) {
        setIsPowerOn(true);
        controlRadar("POWER_ON");
    } else {
        controlRadar("POWER_OFF");
        resetRadarUI(); // <--- Call Reset Helper
    }
  };

  const toggleManualMode = (checked) => {
    setIsManual(checked);
    isManualRef.current = checked; 
    controlRadar(checked ? "MANUAL_ON" : "MANUAL_OFF");
  };

  // ... (Keep drawStaticGrid, drawBeam360, keyboard handlers exactly as they were) ...
  const drawStaticGrid = (ctx, r, size) => {
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(0, 80, 0, 0.5)";
      ctx.fillStyle = "rgba(0, 120, 0, 0.8)";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      [0.25, 0.5, 0.75, 1.0].forEach((m) => {
        ctx.beginPath();
        ctx.arc(r, r, r * m - 1, 0, Math.PI * 2);
        ctx.stroke();
        if (m < 1) ctx.fillText(`${m}m`, r, r - (r * m) + 12);
      });
      ctx.strokeStyle = "rgba(0, 60, 0, 0.3)";
      for(let a = 15; a <= 165; a+=30) {
          const rad = (-a * Math.PI) / 180;
          ctx.beginPath();
          ctx.moveTo(r, r);
          ctx.lineTo(r + r * Math.cos(rad), r + r * Math.sin(rad));
          ctx.stroke();
      }
      ctx.fillStyle = "#00ff41";
      ctx.fillText("N", r, 15); ctx.fillText("E", size - 10, r + 3);
  };
  
  const drawBeam360 = (ctx, r, angle) => {
      const currentRad = (-angle * Math.PI) / 180;
      const grad = ctx.createLinearGradient(r, r, r + r * Math.cos(currentRad), r + r * Math.sin(currentRad));
      grad.addColorStop(0, "rgba(0, 255, 65, 0)");
      grad.addColorStop(1, "rgba(0, 255, 65, 0.8)");
      ctx.beginPath();
      ctx.moveTo(r, r);
      ctx.lineTo(r + r * Math.cos(currentRad), r + r * Math.sin(currentRad));
      ctx.strokeStyle = "#00ff41"; 
      ctx.lineWidth = 2;
      ctx.stroke();
  };

  // Keyboard Control
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isManualRef.current || !isPowerOn) return;
      let newAngle = physicalAngleRef.current;
      if (e.key === "ArrowLeft") newAngle -= 5;
      else if (e.key === "ArrowRight") newAngle += 5;
      else return;
      if (newAngle < 15) newAngle = 15;
      if (newAngle > 165) newAngle = 165;
      const now = Date.now();
      if (now - lastCmdTime.current > 100) {
        controlRadar(`SET:${newAngle}`);
        lastCmdTime.current = now;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPowerOn, controlRadar]);

  return (
    <div className="radar-widget-container">
      <div className="radar-container">
      <div className="crt-overlay"></div>

      <button className="hud-toggle-btn" onClick={() => setShowUI(!showUI)} title="Toggle HUD">
        {showUI ? "✕" : "☰"} 
      </button>

      <div className={`hud-panel hud-top-left ${showUI ? '' : 'ui-hidden'}`}>
        <div className="label">SYSTEM STATUS</div>
        <div ref={statusRef} className="value alert">STANDBY</div>
        <div style={{ marginTop: 10 }}></div>
        <div className="label">AZIMUTH</div>
        <div ref={azimuthRef} className="value">000°</div>
      </div>

      <canvas ref={canvasRef} width={600} height={600} />

      <div className={`controls-panel ${showUI ? '' : 'ui-hidden'}`}>
        <div className="label">CONTROLS</div>
        <label className="switch-container">
          <div className="switch">
            <input type="checkbox" onChange={(e) => togglePower(e.target.checked)} checked={isPowerOn} />
            <span className="slider"></span>
          </div>
          <span>RADAR POWER</span>
        </label>
        <div style={{marginTop: '10px'}}></div>
        <label className="switch-container" style={{opacity: isPowerOn ? 1 : 0.4, pointerEvents: isPowerOn ? 'auto' : 'none'}}>
          <div className="switch">
            <input type="checkbox" onChange={(e) => toggleManualMode(e.target.checked)} checked={isManual} />
            <span className="slider"></span>
          </div>
          <span>MANUAL MODE</span>
        </label>
        {isManual && isPowerOn && <div style={{marginTop: 5, fontSize:10, color:'#008822'}}>[ USE ARROWS ]</div>}
      </div>

      <div className={`hud-panel hud-target-list ${showUI ? '' : 'ui-hidden'}`} style={{top: '60px'}}>
        <div className="label">SCAN REPORT</div>
        <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #004400', paddingBottom:'5px', marginBottom:'5px'}}>
            <span className="label">ANGLE</span>
            <span className="label">AVG DIST</span>
        </div>
        <div className="target-scroll-area">
            {scanReport.length === 0 ? (
                 <div style={{textAlign:'center', color:'#004400', padding:'20px'}}>
                    {!isPowerOn ? "SYSTEM OFFLINE" : "SCANNING..."}
                 </div>
            ) : (
                scanReport.map((t) => (
                    <div key={t.angle} className="target-item">
                        <span>{t.angle}°</span>
                        <span style={{color:'#fff'}}>{t.dist}mm</span>
                    </div>
                ))
            )}
        </div>
      </div>
      </div>
    </div>
  );
}

export default RadarWidget;
import { useEffect, useRef, useState } from "react";
import { useMQTT, TOPICS } from "./useMQTT";

export const useRadarMQTT = () => {
  const [radarStatus, setRadarStatus] = useState("STANDBY");
  const [radarData, setRadarData] = useState([]);
  const [initialScanReport, setInitialScanReport] = useState(null);
  const radarDataRef = useRef([]);
  const updateTimerRef = useRef(null);

  const handleRadarMessage = (topic, message) => {
    switch (topic) {
      case TOPICS.RADAR_STATUS:
        setRadarStatus(message);
        break;
      
      case TOPICS.RADAR_DATA:
        // Single point: "angle,distance"
        const [angle, dist] = message.split(',').map(Number);
        if (!isNaN(angle) && !isNaN(dist)) {
          radarDataRef.current.push({ a: angle, d: dist });
          if (radarDataRef.current.length > 100) {
            radarDataRef.current.shift();
          }
          setRadarData([...radarDataRef.current]);
        }
        break;
      
      case TOPICS.RADAR_BUFFER:
        // Buffered points: [[angle,dist],[angle,dist],...]
        try {
          const buffer = JSON.parse(message);
          if (Array.isArray(buffer)) {
            const newPoints = buffer.map(([a, d]) => ({ a, d }));
            
            // Real-time update: replace entire buffer with new sweep data
            radarDataRef.current = newPoints;
            setRadarData([...newPoints]); // Immediate update, no debounce
          }
        } catch (e) {
          console.error("Error parsing radar buffer:", e);
        }
        break;
      
      case TOPICS.RADAR_REPORT:
        // Initial scan report (JSON format)
        try {
          const report = JSON.parse(message);
          console.log("📡 Initial radar scan received:", report);
          setInitialScanReport(report);
        } catch (e) {
          console.error("Error parsing radar report:", e);
        }
        break;
    }
  };

  const { connectionStatus, publish } = useMQTT(handleRadarMessage);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    };
  }, []);

  const controlRadar = (command) => {
    publish(TOPICS.RADAR_CONTROL, command);
  };

  return {
    radarStatus,
    radarData,
    initialScanReport,
    connectionStatus,
    controlRadar,
  };
};

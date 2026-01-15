import { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";

export const TOPICS = {
  CONTROL: "esp32/led/control",
  STATUS: "esp32/led/status",
  LED2: "esp32/led2/control",
  LED2_STATUS: "esp32/led2/status",
  LED4: "esp32/led4/control",
  LED4_STATUS: "esp32/led4/status",
  VOLTAGE: "esp32/sensor/voltage",
  CURRENT: "esp32/sensor/current",
  POWER: "esp32/sensor/power",
  VOLTAGE2: "esp32/sensor2/voltage",
  CURRENT2: "esp32/sensor2/current",
  POWER2: "esp32/sensor2/power",
  POWERCUT: "esp32/powercut/status",
  COMMAND: "esp32/command/status",
  EMERGENCY: "esp32/emergency/control",
  EMERGENCY_STATUS: "esp32/emergency/status",
  HISTORY: "esp32/history/powercut",
  LIGHT_INTENSITY: "esp32/light/intensity",
  BATTERY_PCT: "esp32/sensor/battery_pct",
  SIGNAL: "chami/esp32/stats/signal",
  // RADAR TOPICS
  RADAR_CONTROL: "esp32/radar/control",
  RADAR_STATUS: "esp32/radar/status",
  RADAR_DATA: "esp32/radar/data",
  RADAR_BUFFER: "esp32/radar/buffer",
  RADAR_REPORT: "esp32/radar/report", // Initial scan report
};

const MQTT_BROKER = "wss://broker.hivemq.com:8884/mqtt";

export const useMQTT = (onMessage) => {
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const clientRef = useRef(null);

  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER, {
      clientId: "Dashboard_" + Math.random().toString(16).substr(2, 8),
      clean: true,
      reconnectPeriod: 1000,
    });

    clientRef.current = client;

    client.on("connect", () => {
      setConnectionStatus("Connected");

      // Subscribe to all topics
      Object.values(TOPICS).forEach((topic) => {
        client.subscribe(topic, (err) => {
          if (err) console.error("Subscribe error:", topic, err);
        });
      });
    });

    client.on("message", (topic, message) => {
      if (onMessage) {
        onMessage(topic, message.toString());
      }
    });

    client.on("reconnect", () => {
      setConnectionStatus("Reconnecting...");
    });

    client.on("error", (error) => {
      console.error("MQTT Error:", error);
      setConnectionStatus("Disconnected");
    });

    client.on("offline", () => {
      setConnectionStatus("Offline");
    });

    return () => {
      if (client && client.connected) {
        // Unsubscribe from all topics before disconnecting
        Object.values(TOPICS).forEach((topic) => {
          client.unsubscribe(topic);
        });
        client.end(false, () => {
          clientRef.current = null;
        });
      }
    };
  }, []);

  const publish = (topic, message) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish(topic, message);
    }
  };

  return { connectionStatus, publish, client: clientRef.current };
};

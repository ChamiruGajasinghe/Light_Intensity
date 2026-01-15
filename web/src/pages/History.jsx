import { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useMQTT, TOPICS } from "../hooks/useMQTT";
import {
  FaPlugCircleXmark,
  FaClock,
  FaBolt,
  FaBatteryHalf,
  FaChartLine,
  FaChartColumn,
  FaBatteryThreeQuarters,
  FaTable,
  FaDownload,
  FaTrashCan,
  FaDatabase,
} from "react-icons/fa6";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const History = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [powerCutHistory, setPowerCutHistory] = useState([]);
  const [totalPowerCuts, setTotalPowerCuts] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [totalEnergy, setTotalEnergy] = useState(0);
  const [avgVoltageDrop, setAvgVoltageDrop] = useState(0);

  useEffect(() => {
    loadHistory();
  }, []);

  const handleMessage = (topic, message) => {
    if (topic === TOPICS.HISTORY) {
      try {
        const data = JSON.parse(message);
        const event = {
          timestamp: new Date().toLocaleString(),
          duration: data.duration,
          startV: data.startV,
          endV: data.endV,
          drop: data.drop,
          energy: data.energy,
        };

        setPowerCutHistory((prev) => {
          const newHistory = [...prev, event];
          localStorage.setItem("powerCutHistory", JSON.stringify(newHistory));
          return newHistory;
        });
      } catch (e) {
        console.error("Error parsing history data:", e);
      }
    }
  };

  useMQTT(handleMessage);

  const loadHistory = () => {
    const saved = localStorage.getItem("powerCutHistory");
    if (saved) {
      setPowerCutHistory(JSON.parse(saved));
    }
  };

  useEffect(() => {
    updateStats();
  }, [powerCutHistory]);

  const updateStats = () => {
    const total = powerCutHistory.length;
    setTotalPowerCuts(total);

    const totalDurationMs = powerCutHistory.reduce(
      (sum, event) => sum + event.duration,
      0
    );
    setTotalDuration(Math.round(totalDurationMs / 60000));

    const totalEnergyVal = powerCutHistory.reduce(
      (sum, event) => sum + (event.energy || 0),
      0
    );
    setTotalEnergy(totalEnergyVal.toFixed(2));

    const avgDrop =
      total > 0
        ? powerCutHistory.reduce((sum, event) => sum + event.drop, 0) / total
        : 0;
    setAvgVoltageDrop(avgDrop.toFixed(2));
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all history data?")) {
      setPowerCutHistory([]);
      localStorage.setItem("powerCutHistory", JSON.stringify([]));
    }
  };

  const exportData = () => {
    if (powerCutHistory.length === 0) {
      alert("No data to export");
      return;
    }

    let csv =
      "Event,Date Time,Duration (ms),Duration (min),Start Voltage (V),End Voltage (V),Voltage Drop (V),Energy (mWh)\n";

    powerCutHistory.forEach((event, index) => {
      csv += `${index + 1},${event.timestamp},${event.duration},${(
        event.duration / 60000
      ).toFixed(2)},${event.startV},${event.endV},${event.drop},${
        event.energy || 0
      }\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "power_cut_history_" + new Date().toISOString().split("T")[0] + ".csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const last10 = powerCutHistory.slice(-10);
  const labels = last10.map(
    (e, i) => `Event ${powerCutHistory.length - 9 + i}`
  );

  const voltageChartData = {
    labels,
    datasets: [
      {
        label: "Voltage Drop (V)",
        data: last10.map((e) => e.drop),
        borderColor: "rgb(255, 107, 107)",
        backgroundColor: "rgba(255, 107, 107, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const durationChartData = {
    labels,
    datasets: [
      {
        label: "Duration (minutes)",
        data: last10.map((e) => (e.duration / 60000).toFixed(2)),
        backgroundColor: "rgba(157, 78, 221, 0.7)",
        borderColor: "rgb(157, 78, 221)",
        borderWidth: 2,
      },
    ],
  };

  const energyChartData = {
    labels,
    datasets: [
      {
        label: "Energy Consumed (mWh)",
        data: last10.map((e) => e.energy || 0),
        borderColor: "rgb(74, 144, 226)",
        backgroundColor: "rgba(74, 144, 226, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "#ECF0F1" },
      },
      x: {
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "#ECF0F1" },
      },
    },
  };

  return (
    <>
      <Header
        title="Power Cut History & Analytics"
        subtitle="Battery Usage & Drainage Analysis"
        onToggleMenu={() => setSidebarOpen(!sidebarOpen)}
        isMenuOpen={sidebarOpen}
      />

      <div className="min-h-[calc(100vh-60px)] sm:min-h-[calc(100vh-80px)]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="p-3 sm:p-4 md:p-6 lg:p-8 lg:ml-[250px] overflow-y-auto">
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-card-dark rounded-2xl p-6 shadow-custom transition-all hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)]">
              <div className="flex justify-between items-center mb-4">
                <div className="text-4xl p-3 rounded-xl bg-primary-red/10 text-primary-red">
                  <FaPlugCircleXmark />
                </div>
              </div>
              <div className="text-4xl font-bold my-2">{totalPowerCuts}</div>
              <div className="text-sm opacity-70">Total Power Cuts</div>
            </div>

            <div className="bg-card-dark rounded-2xl p-6 shadow-custom transition-all hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)]">
              <div className="flex justify-between items-center mb-4">
                <div className="text-4xl p-3 rounded-xl bg-primary-yellow/10 text-primary-yellow">
                  <FaClock />
                </div>
              </div>
              <div className="text-4xl font-bold my-2">{totalDuration}m</div>
              <div className="text-sm opacity-70">Total Downtime</div>
            </div>

            <div className="bg-card-dark rounded-2xl p-6 shadow-custom transition-all hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)]">
              <div className="flex justify-between items-center mb-4">
                <div className="text-4xl p-3 rounded-xl bg-primary-purple/10 text-primary-purple">
                  <FaBolt />
                </div>
              </div>
              <div className="text-4xl font-bold my-2">{totalEnergy} mWh</div>
              <div className="text-sm opacity-70">Total Battery Usage</div>
            </div>

            <div className="bg-card-dark rounded-2xl p-6 shadow-custom transition-all hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)]">
              <div className="flex justify-between items-center mb-4">
                <div className="text-4xl p-3 rounded-xl bg-primary-blue/10 text-primary-blue">
                  <FaBatteryHalf />
                </div>
              </div>
              <div className="text-4xl font-bold my-2">{avgVoltageDrop} V</div>
              <div className="text-sm opacity-70">Avg Voltage Drop</div>
            </div>
          </div>

          {/* Voltage Drainage Chart */}
          <div className="bg-card-dark rounded-2xl p-6 shadow-custom mb-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-primary-blue/20">
              <div className="text-xl font-semibold flex items-center gap-3">
                <FaChartLine className="text-2xl text-primary-red" />
                Battery Voltage Drainage Over Time
              </div>
            </div>
            <div className="h-[400px] relative">
              <Line data={voltageChartData} options={chartOptions} />
            </div>
          </div>

          {/* Power Cuts Timeline Chart */}
          <div className="bg-card-dark rounded-2xl p-6 shadow-custom mb-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-primary-blue/20">
              <div className="text-xl font-semibold flex items-center gap-3">
                <FaChartColumn className="text-2xl text-primary-purple" />
                Power Cut Duration Timeline
              </div>
            </div>
            <div className="h-[400px] relative">
              <Bar data={durationChartData} options={chartOptions} />
            </div>
          </div>

          {/* Energy Consumption Chart */}
          <div className="bg-card-dark rounded-2xl p-6 shadow-custom mb-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-primary-blue/20">
              <div className="text-xl font-semibold flex items-center gap-3">
                <FaBatteryThreeQuarters className="text-2xl text-primary-blue" />
                Battery Energy Consumption
              </div>
            </div>
            <div className="h-[400px] relative">
              <Line data={energyChartData} options={chartOptions} />
            </div>
          </div>

          {/* History Table */}
          <div className="bg-card-dark rounded-2xl p-6 shadow-custom mb-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-primary-blue/20">
              <div className="text-xl font-semibold flex items-center gap-3">
                <FaTable className="text-2xl text-primary-green" />
                Detailed Power Cut Log
              </div>
              <button
                onClick={exportData}
                className="py-2.5 px-6 bg-gradient-to-br from-primary-green to-[#45B849] text-white border-none rounded-lg cursor-pointer font-semibold flex items-center gap-2 transition-all hover:scale-105 hover:shadow-[0_5px_15px_rgba(80,200,120,0.3)]"
              >
                <FaDownload /> Export CSV
              </button>
            </div>

            <div className="flex gap-4 mb-6 flex-wrap">
              <button className="py-2.5 px-5 border-2 border-primary-blue bg-transparent text-primary-blue rounded-lg cursor-pointer font-semibold transition-all hover:bg-primary-blue hover:text-white bg-primary-blue text-white">
                All Events
              </button>
              <button
                onClick={clearHistory}
                className="py-2.5 px-5 border-2 border-primary-red bg-transparent text-primary-red rounded-lg cursor-pointer font-semibold transition-all hover:bg-primary-red hover:text-white"
              >
                <FaTrashCan /> Clear History
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-br from-primary-blue to-[#667eea] text-white">
                  <tr>
                    <th className="p-4 text-left border-b border-white/10">
                      #
                    </th>
                    <th className="p-4 text-left border-b border-white/10">
                      Date & Time
                    </th>
                    <th className="p-4 text-left border-b border-white/10">
                      Duration
                    </th>
                    <th className="p-4 text-left border-b border-white/10">
                      Start Voltage
                    </th>
                    <th className="p-4 text-left border-b border-white/10">
                      End Voltage
                    </th>
                    <th className="p-4 text-left border-b border-white/10">
                      Voltage Drop
                    </th>
                    <th className="p-4 text-left border-b border-white/10">
                      Energy Used
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {powerCutHistory.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 opacity-60">
                        <FaDatabase className="text-6xl mb-4 block mx-auto" />
                        <p>No power cut events recorded yet</p>
                      </td>
                    </tr>
                  ) : (
                    powerCutHistory
                      .slice()
                      .reverse()
                      .map((event, index) => {
                        const durationMin = (event.duration / 60000).toFixed(2);
                        const durationClass =
                          durationMin < 1
                            ? "bg-primary-green/20 text-primary-green"
                            : durationMin < 5
                            ? "bg-[rgba(255,165,0,0.2)] text-[#FFA500]"
                            : "bg-primary-red/20 text-primary-red";

                        return (
                          <tr
                            key={index}
                            className="transition-all hover:bg-primary-blue/10 border-b border-white/10"
                          >
                            <td className="p-4">
                              {powerCutHistory.length - index}
                            </td>
                            <td className="p-4">{event.timestamp}</td>
                            <td className="p-4">
                              <span
                                className={`inline-block py-1.5 px-3 rounded-full text-sm font-semibold ${durationClass}`}
                              >
                                {durationMin} min
                              </span>
                            </td>
                            <td className="p-4">{event.startV.toFixed(2)} V</td>
                            <td className="p-4">{event.endV.toFixed(2)} V</td>
                            <td className="p-4 font-semibold text-primary-red">
                              -{event.drop.toFixed(2)} V
                            </td>
                            <td className="p-4 font-semibold text-primary-purple">
                              {(event.energy || 0).toFixed(2)} mWh
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default History;

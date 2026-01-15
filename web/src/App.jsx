import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Radar from "./pages/Radar";
import History from "./pages/History";

function App() {
  return (
    <div className="min-h-screen bg-bg-dark text-text-dark font-sans">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/radar" element={<Radar />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </div>
  );
}

export default App;

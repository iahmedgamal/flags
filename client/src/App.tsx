import { Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";
import { SoloSetup } from "@/pages/SoloSetup";
import { SoloGame } from "@/pages/SoloGame";
import { SoloResults } from "@/pages/SoloResults";

export function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/solo" element={<SoloSetup />} />
        <Route path="/solo/play" element={<SoloGame />} />
        <Route path="/solo/results" element={<SoloResults />} />
      </Routes>
    </div>
  );
}

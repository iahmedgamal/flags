import { Routes, Route } from "react-router-dom";
import { PlayerProvider, usePlayer } from "@/hooks/usePlayer";
import { Home } from "@/pages/Home";
import { SoloGame } from "@/pages/SoloGame";
import { SoloResults } from "@/pages/SoloResults";
import { PlayerSetup } from "@/pages/PlayerSetup";
import { Profile } from "@/pages/Profile";

function AppRoutes() {
  const { player, loading } = usePlayer();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-2xl text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!player) {
    return <PlayerSetup />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/play" element={<SoloGame />} />
      <Route path="/results" element={<SoloResults />} />
      <Route path="/profile/:id" element={<Profile />} />
    </Routes>
  );
}

export function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <PlayerProvider>
        <AppRoutes />
      </PlayerProvider>
    </div>
  );
}

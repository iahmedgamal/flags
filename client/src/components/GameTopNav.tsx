import { useNavigate } from "react-router-dom";

interface GameTopNavProps {
  onSecondaryAction: () => void;
  secondaryLabel: string;
  secondaryVariant?: "pause" | "leave";
}

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
    <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a.75.75 0 0 1 .091-.086L12 5.432Z" />
  </svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Zm10.5 0a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

export function GameTopNav({ onSecondaryAction, secondaryLabel, secondaryVariant = "pause" }: GameTopNavProps) {
  const navigate = useNavigate();
  const isLeave = secondaryVariant === "leave";

  return (
    <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-white/5 bg-[#1a1614]/80 px-4 py-3 backdrop-blur-md">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#8a8580] transition-colors hover:bg-white/10 hover:text-[#f5f0eb]"
      >
        <HomeIcon />
        Home
      </button>
      <button
        onClick={onSecondaryAction}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isLeave
            ? "text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
            : "text-[#8a8580] hover:bg-white/10 hover:text-[#f5f0eb]"
        }`}
      >
        {isLeave ? <CloseIcon /> : <PauseIcon />}
        {secondaryLabel}
      </button>
    </div>
  );
}

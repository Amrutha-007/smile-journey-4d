import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Columns,
  Sliders,
  Eye,
  Sparkles,
} from "lucide-react";

interface BeforeAfterSliderProps {
  originalImage: string;
  simulationImage: string;
  originalLabel?: string;
  simulationLabel?: string;
  stageName?: string;
  treatmentType?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalImage,
  simulationImage,
  originalLabel = "Baseline Smile (Original)",
  simulationLabel = "AI Potential Simulation",
  stageName = "Target Stage",
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [comparisonMode, setComparisonMode] = useState<"slider" | "side-by-side" | "overlay">("slider");
  const [overlayOpacity, setOverlayOpacity] = useState<number>(100);
  const [zoom, setZoom] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPos(percentage);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleZoomIn = () => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)));
  const handleReset = () => {
    setZoom(1);
    setSliderPos(50);
    setOverlayOpacity(100);
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-slate-950 rounded-2xl overflow-hidden select-none shadow-2xl border border-slate-800 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none w-screen h-screen" : "w-full aspect-[4/3] md:aspect-[16/10]"
      }`}
    >
      {/* Top Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-auto">
        {/* Left: Comparison Mode Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 shadow-lg text-white">
          <button
            onClick={() => setComparisonMode("slider")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              comparisonMode === "slider"
                ? "bg-sky-500 text-white shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split Slider</span>
          </button>
          <button
            onClick={() => setComparisonMode("side-by-side")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              comparisonMode === "side-by-side"
                ? "bg-sky-500 text-white shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Side-by-Side</span>
          </button>
          <button
            onClick={() => setComparisonMode("overlay")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              comparisonMode === "overlay"
                ? "bg-sky-500 text-white shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Overlay Blend</span>
          </button>
        </div>

        {/* Right: Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 shadow-lg text-white">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono font-medium px-1.5 text-slate-300">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 2.5}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-700 mx-1"></div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Comparison Viewports */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {comparisonMode === "slider" && (
          <div
            className="relative w-full h-full flex items-center justify-center cursor-ew-resize"
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
          >
            {/* Background Image: Original Smile (Left) */}
            <div
              className="absolute inset-0 w-full h-full flex items-center justify-center transition-transform"
              style={{ transform: `scale(${zoom})` }}
            >
              <img
                src={originalImage}
                alt={originalLabel}
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>

            {/* Foreground Image: AI Simulation (Right), clipped by sliderPos */}
            <div
              className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden pointer-events-none"
              style={{
                clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`,
              }}
            >
              <div
                className="w-full h-full flex items-center justify-center transition-transform"
                style={{ transform: `scale(${zoom})` }}
              >
                <img
                  src={simulationImage}
                  alt={simulationLabel}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Draggable Divider Line & Knob */}
            <div
              className="absolute top-0 bottom-0 z-20 w-0.5 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.8)] pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center border-2 border-sky-500 pointer-events-auto cursor-ew-resize active:scale-95 transition-transform">
                <div className="flex items-center gap-0.5 text-sky-700 text-xs font-bold font-mono">
                  <span>◀</span>
                  <span>▶</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {comparisonMode === "side-by-side" && (
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-2 p-4 pt-16">
            {/* Left Box */}
            <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center" style={{ transform: `scale(${zoom})` }}>
                <img src={originalImage} alt={originalLabel} className="w-full h-full object-contain" />
              </div>
              <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm text-xs font-semibold text-slate-200 border border-slate-700">
                {originalLabel}
              </div>
            </div>

            {/* Right Box */}
            <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center" style={{ transform: `scale(${zoom})` }}>
                <img src={simulationImage} alt={simulationLabel} className="w-full h-full object-contain" />
              </div>
              <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-sky-950/80 backdrop-blur-sm text-xs font-semibold text-sky-300 border border-sky-600/50 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>{simulationLabel} ({stageName})</span>
              </div>
            </div>
          </div>
        )}

        {comparisonMode === "overlay" && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Base: Original */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `scale(${zoom})` }}>
              <img src={originalImage} alt={originalLabel} className="w-full h-full object-contain" />
            </div>

            {/* Blended Simulation */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity"
              style={{
                opacity: overlayOpacity / 100,
                transform: `scale(${zoom})`,
              }}
            >
              <img src={simulationImage} alt={simulationLabel} className="w-full h-full object-contain" />
            </div>

            {/* Floating Opacity Slider */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-72 bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-700 shadow-xl">
              <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1.5">
                <span>Original (0%)</span>
                <span className="text-sky-400 font-bold">{overlayOpacity}% AI</span>
                <span>Simulation (100%)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Persistent Bottom Badges (In Slider Mode) */}
      {comparisonMode === "slider" && (
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-white text-xs font-semibold shadow-lg">
            {originalLabel}
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-sky-950/85 backdrop-blur-md border border-sky-500/50 text-sky-200 text-xs font-semibold shadow-lg flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>{simulationLabel} • {stageName}</span>
          </div>
        </div>
      )}
    </div>
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useEffect, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, Move } from "lucide-react";
import { Button, Badge } from "@/components/ui";

interface DrawingViewerProps {
  fileA: string;
  fileB: string;
  changes: any[];
  selectedChangeId: string | null;
  onSelectChange: (id: string) => void;
  viewMode: "side-by-side" | "overlay" | "heatmap";
  opacity: number;
}

export default function DrawingViewer({
  changes,
  selectedChangeId,
  onSelectChange,
  viewMode,
  opacity,
}: DrawingViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);

  const [transform, setTransform] = useState({ x: 100, y: 50, scale: 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Draw mock technical drawings on canvas if no real image loaded
  const drawMockDrawing = (
    ctx: CanvasRenderingContext2D,
    revision: "A" | "B",
    width: number,
    height: number,
  ) => {
    ctx.clearRect(0, 0, width, height);

    // Blueprint background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    const gridSpacing = 40;
    for (let x = 0; x < width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Title Block boundary
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Core flange gear circle
    ctx.strokeStyle = "#38bdf8"; // cyan engineering line
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 160, 0, Math.PI * 2);
    ctx.stroke();

    // Inner flange circle
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 90, 0, Math.PI * 2);
    ctx.stroke();

    // Keyway slot
    ctx.beginPath();
    ctx.moveTo(width / 2 - 15, height / 2 - 90);
    ctx.lineTo(width / 2 - 15, height / 2 - 105);
    ctx.lineTo(width / 2 + 15, height / 2 - 105);
    ctx.lineTo(width / 2 + 15, height / 2 - 90);
    ctx.stroke();

    // Mounting bolt holes
    const boltHoles = revision === "A" ? 4 : 3;
    ctx.fillStyle = "#38bdf8";
    for (let i = 0; i < boltHoles; i++) {
      const angle = (i * 2 * Math.PI) / boltHoles;
      const x = width / 2 + Math.cos(angle) * 125;
      const y = height / 2 + Math.sin(angle) * 125;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
      // Center marks
      ctx.strokeStyle = "#0284c7";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 20, y);
      ctx.lineTo(x + 20, y);
      ctx.moveTo(x, y - 20);
      ctx.lineTo(x, y + 20);
      ctx.stroke();
    }

    // Text & Dimensions
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 13px Courier New";
    ctx.fillText("TITLE: FLANGE COLLAR ASSEMBLY", 40, height - 80);
    ctx.fillText("DWG NO: DRW-A3-8402", 40, height - 60);
    ctx.fillText(`REVISION: ${revision === "A" ? "REV A" : "REV B"}`, 40, height - 40);

    // Dimension labels
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#e2e8f0";

    // Main dimension line A vs B
    ctx.beginPath();
    ctx.moveTo(width / 2 - 160, height / 2 - 180);
    ctx.lineTo(width / 2 + 160, height / 2 - 180);
    ctx.stroke();
    // Dimension text
    ctx.fillText(revision === "A" ? "Ø12 ±0.10" : "Ø12 ±0.05", width / 2 - 40, height / 2 - 190);

    // Material spec text
    ctx.fillText(revision === "A" ? "MATL: AL 6061-T6" : "MATL: AL 7075-T6", 40, 120);

    // Plating Note
    ctx.fillText(revision === "A" ? "1. NO PLATING" : "1. ANODIZE MIL-A-8625 TYPE III", 40, 700);
  };

  // Redraw canvases on updates
  useEffect(() => {
    const canvasA = canvasARef.current;
    const canvasB = canvasBRef.current;

    if (!canvasA) return;
    const ctxA = canvasA.getContext("2d");
    if (!ctxA) return;

    const w = 750;
    const h = 800;

    canvasA.width = w;
    canvasA.height = h;
    drawMockDrawing(ctxA, "A", w, h);

    if (canvasB) {
      canvasB.width = w;
      canvasB.height = h;
      const ctxB = canvasB.getContext("2d");
      if (ctxB) {
        drawMockDrawing(ctxB, "B", w, h);
      }
    }
  }, []);

  // Handle zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const nextScale = e.deltaY < 0 ? transform.scale * zoomFactor : transform.scale / zoomFactor;
    const boundedScale = Math.max(0.2, Math.min(5, nextScale));
    setTransform((prev) => ({ ...prev, scale: boundedScale }));
  };

  // Panning drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetZoom = () => {
    setTransform({ x: 100, y: 50, scale: 0.8 });
  };

  const handleBoxClick = (change: any) => {
    onSelectChange(change.id);
  };

  return (
    <div className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-sm select-none">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <div className="flex items-center gap-2">
          <Move className="size-4 text-zinc-500" />
          <span className="text-xs font-medium text-zinc-600">Pan/Zoom Enabled (Drag to Move)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setTransform((p) => ({ ...p, scale: p.scale * 1.2 }))}
          >
            <ZoomIn className="size-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setTransform((p) => ({ ...p, scale: p.scale / 1.2 }))}
          >
            <ZoomOut className="size-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={resetZoom}>
            <Maximize2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* VIEWER AREA */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative h-[580px] w-full cursor-grab overflow-hidden rounded-xl bg-zinc-100 active:cursor-grabbing"
      >
        {/* INNER RENDER WRAPPER */}
        <div
          className="absolute origin-top-left transition-transform duration-75"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          }}
        >
          {viewMode === "side-by-side" && (
            <div className="relative flex gap-8">
              {/* REV A VIEWPORT */}
              <div className="relative">
                <canvas ref={canvasARef} className="rounded-md border border-zinc-700 shadow-md" />
                <Badge className="absolute top-4 left-4 bg-blue-600 text-zinc-900 hover:bg-blue-600">
                  REV A
                </Badge>
              </div>

              {/* REV B VIEWPORT */}
              <div className="relative">
                <canvas ref={canvasBRef} className="rounded-md border border-zinc-700 shadow-md" />
                <Badge className="absolute top-4 left-4 bg-emerald-600 text-zinc-900 hover:bg-emerald-600">
                  REV B
                </Badge>

                {/* BOUNDING BOXES OVERLAY */}
                {changes.map((c) => {
                  if (!c.boundingBox) return null;
                  const box = JSON.parse(c.boundingBox);
                  const isSelected = selectedChangeId === c.id;

                  return (
                    <div
                      key={c.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBoxClick(c);
                      }}
                      className={`absolute cursor-pointer rounded border-2 transition-all duration-150 ${
                        isSelected
                          ? "animate-pulse border-rose-500 bg-rose-500/20 shadow-lg"
                          : "border-amber-500 bg-amber-500/10 hover:border-amber-400 hover:bg-amber-500/20"
                      }`}
                      style={{
                        left: `${box.x}px`,
                        top: `${box.y}px`,
                        width: `${box.w}px`,
                        height: `${box.h}px`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === "overlay" && (
            <div className="relative h-[800px] w-[750px]">
              <canvas
                ref={canvasARef}
                className="absolute inset-0 rounded-md border border-zinc-700"
              />
              <canvas
                ref={canvasBRef}
                className="absolute inset-0 rounded-md border border-zinc-700 mix-blend-screen"
                style={{ opacity }}
              />
              <Badge className="absolute top-4 left-4 bg-indigo-600 text-zinc-900 hover:bg-indigo-600">
                Overlay Blend
              </Badge>
            </div>
          )}

          {viewMode === "heatmap" && (
            <div className="relative h-[800px] w-[750px]">
              <canvas
                ref={canvasARef}
                className="absolute inset-0 rounded-md border border-zinc-700 opacity-30"
              />
              <canvas
                ref={canvasBRef}
                className="absolute inset-0 rounded-md border border-zinc-700 opacity-30"
              />
              {changes.map((c) => {
                if (!c.boundingBox) return null;
                const box = JSON.parse(c.boundingBox);

                return (
                  <div
                    key={c.id}
                    className="pointer-events-none absolute rounded border-2 border-rose-500 bg-rose-600/35 shadow-md"
                    style={{
                      left: `${box.x}px`,
                      top: `${box.y}px`,
                      width: `${box.w}px`,
                      height: `${box.h}px`,
                    }}
                  />
                );
              })}
              <Badge className="absolute top-4 left-4 bg-rose-600 text-zinc-900 hover:bg-rose-600">
                Diff Heatmap
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

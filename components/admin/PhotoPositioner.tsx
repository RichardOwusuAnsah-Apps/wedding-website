"use client";

import { useState } from "react";
import { focalStyle } from "@/lib/image";

type Crop = { focal_x: number; focal_y: number; zoom: number };

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block mb-2">
      <span className="font-util text-[0.56rem] tracking-[0.12em] uppercase text-muted">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-gold)]"
      />
    </label>
  );
}

/** Inline reposition + zoom editor with a live 4:5 (hero-frame) preview. */
export function PhotoPositioner({
  url,
  initial,
  pending,
  onSave,
  onCancel,
}: {
  url: string;
  initial: Crop;
  pending: boolean;
  onSave: (crop: Crop) => void;
  onCancel: () => void;
}) {
  const [fx, setFx] = useState(initial.focal_x);
  const [fy, setFy] = useState(initial.focal_y);
  const [zoom, setZoom] = useState(initial.zoom);

  return (
    <div className="mt-3 border-t border-line pt-3">
      <div
        className="relative w-full overflow-hidden rounded border border-line bg-sand mb-2"
        style={{ aspectRatio: "4 / 5" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={focalStyle({ focal_x: fx, focal_y: fy, zoom })}
        />
        <span className="absolute top-1 left-1 font-util text-[0.5rem] tracking-[0.1em] uppercase bg-white/85 text-muted px-1.5 py-0.5 rounded">
          Hero crop 4:5
        </span>
      </div>

      <Slider label="Move ← →" min={0} max={100} step={1} value={fx} onChange={setFx} />
      <Slider label="Move ↑ ↓" min={0} max={100} step={1} value={fy} onChange={setFy} />
      <Slider label="Zoom" min={1} max={3} step={0.05} value={zoom} onChange={setZoom} />

      <div className="flex gap-3 items-center mt-1">
        <button
          type="button"
          className="btn-gold w-auto px-5"
          style={{ padding: "8px 20px", fontSize: "0.62rem" }}
          disabled={pending}
          onClick={() => onSave({ focal_x: fx, focal_y: fy, zoom })}
        >
          {pending ? "Saving…" : "Save crop"}
        </button>
        <button
          type="button"
          className="font-util text-[0.62rem] tracking-[0.12em] uppercase text-muted"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="font-util text-[0.62rem] tracking-[0.12em] uppercase text-muted ml-auto"
          onClick={() => {
            setFx(50);
            setFy(50);
            setZoom(1);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

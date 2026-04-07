"use client";

import { useState, useEffect } from "react";
import type { ToolControlsProps } from "./types";
import { FileImage, Loader2 } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import UniversalPreview from "../pdf/UniversalPreview";
import ToolLayout from "./ToolLayout";

// Sortable Image Card
function SortableImageCard({ id, file, index, fit }: { id: string; file: File; index: number; fit: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const objectFitClass = fit === "cover" ? "object-cover" : "object-contain";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative w-full max-w-md bg-white shadow-lg flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-300 ${isDragging ? "ring-4 ring-purple-500 shadow-2xl scale-[1.02] z-10" : "hover:shadow-xl scale-95"
        }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={URL.createObjectURL(file)}
        alt={`File ${index}`}
        className={`w-full h-auto bg-transparent shadow-sm pointer-events-none ${objectFitClass}`}
        onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
      />

      <div className="absolute top-4 -left-4 sm:-left-12 shadow-md w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold bg-black/60 text-white pointer-events-none">
        {index + 1}
      </div>
    </div>
  );
}

export default function ImageToPdfControls({
  files, setProcessing, processing, setProgress, setResultBlob, setResultFileName, setError,
}: ToolControlsProps) {
  const [orientation, setOrientation] = useState<"auto" | "portrait" | "landscape">("auto");
  const [fit, setFit] = useState<"contain" | "cover">("contain");
  const [margin, setMargin] = useState<"none" | "small">("none");

  // We map files to generic string IDs for @dnd-kit so identity persists
  // The simplest reliable mapping is by index arrays or wrapping them.
  const [items, setItems] = useState<{ id: string, file: File }[]>([]);

  useEffect(() => {
    // Only re-init if file array structurally changes lengths
    if (files.length !== items.length) {
      setItems(files.map((f, i) => ({ id: `img-${i}-${f.name}`, file: f })));
    }
  }, [files, items.length]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleConvert = async () => {
    if (items.length === 0) return;
    try {
      setProcessing(true); setProgress(10); setError(null);

      const formData = new FormData();
      // Use ordered files
      items.forEach((item) => formData.append("files", item.file));
      formData.append("orientation", orientation);
      formData.append("fit", fit);
      formData.append("margin", margin);

      setProgress(30);

      const resp = await fetch("/api/image-to-pdf", { method: "POST", body: formData });

      setProgress(70);
      if (!resp.ok) throw new Error((await resp.json()).error || "Failed");

      const blob = await resp.blob();
      setResultBlob(blob);
      const baseName = items.length > 0 ? items[0].file.name.replace(/\.[^/.]+$/, "") : "images";
      setResultFileName(`${baseName} - Image to PDF - PDFigo by Murtuja.pdf`);
      setProgress(100);
    } catch (err) {
      setError(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      preview={
        <UniversalPreview
          title="Image Sequence"
          description={`${items.length} image${items.length !== 1 ? "s" : ""} to be converted. Drag and drop to reorder.`}
          mode="vertical"
        >
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-6 w-full items-center pb-4">
                {items.map((item, index) => (
                  <SortableImageCard
                    key={item.id}
                    id={item.id}
                    file={item.file}
                    index={index}
                    fit={orientation === "auto" ? "contain" : fit}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </UniversalPreview>
      }
      options={
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-white mb-1">PDF Layout Configuration</h3>
            <p className="text-xs text-white/40 mb-4">Adjust the layout and fit of your images.</p>

            <div className="space-y-6">
              {/* Orientation */}
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Page Fit & Orientation</label>
                <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                  {(["auto", "portrait", "landscape"] as const).map(o => (
                    <button
                      key={o}
                      onClick={() => setOrientation(o)}
                      className={`flex-1 py-1.5 text-[11px] font-medium rounded-md capitalize transition-all ${orientation === o ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20" : "text-white/40 hover:text-white/70 hover:bg-white/5"
                        }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit */}
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Scaling Logic</label>
                <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                  {(["contain", "cover"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFit(f)}
                      disabled={orientation === "auto"}
                      className={`flex-1 py-1.5 text-[11px] font-medium rounded-md capitalize transition-all ${fit === f && orientation !== "auto" ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20" : "text-white/40 hover:text-white/70 hover:bg-white/5"
                        } disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-transparent`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margin */}
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Margin</label>
                <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                  {(["none", "small"] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setMargin(m)}
                      className={`flex-1 py-1.5 text-[11px] font-medium rounded-md capitalize transition-all ${margin === m ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20" : "text-white/40 hover:text-white/70 hover:bg-white/5"
                        }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <h3 className="text-sm font-medium text-white mb-1">Generate Document</h3>
            <p className="text-xs text-white/40">Compile your images into a single PDF file.</p>
          </div>
        </div>
      }
      action={
        <button
          onClick={handleConvert}
          disabled={items.length === 0 || processing}
          className="btn btn-primary w-full shadow-[0_0_20px_rgba(168,85,247,0.2)]"
        >
          {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileImage className="w-5 h-5" />}
          {processing ? "Converting..." : "Convert to PDF"}
        </button>
      }
    />
  );
}

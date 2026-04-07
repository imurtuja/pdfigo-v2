"use client";

import { useState, useEffect } from "react";
import { reorderPages } from "@/lib/pdf/reorder";
import type { ToolControlsProps } from "./types";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { usePdfLoader } from "@/hooks/usePdfLoader";
import UniversalPreview from "../pdf/UniversalPreview";
import ToolLayout from "./ToolLayout";
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
  rectSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortablePageCard({ pageNum, dataUrl }: { pageNum: number, dataUrl: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: pageNum });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-shadow ${isDragging ? "border-purple-500 shadow-2xl scale-105" : "border-transparent shadow-md hover:shadow-lg bg-white/5"
        }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt={`Page ${pageNum}`} className="w-full h-full object-contain bg-white pointer-events-none" />
      <div className="absolute top-1 left-1 bg-black/60 px-2 py-0.5 rounded text-[10px] font-medium text-white pointer-events-none">
        {pageNum}
      </div>
    </div>
  );
}

export default function ReorderControls({
  files, setProcessing, processing, setProgress, setResultBlob, setResultFileName, setError,
}: ToolControlsProps) {
  const file = files[0] || null;
  const { pages, totalPages, loading, error: loadError } = usePdfLoader(file, true, 100);

  // We keep an ordered list of page numbers
  const [order, setOrder] = useState<number[]>([]);

  useEffect(() => {
    if (pages.length > 0 && order.length !== pages.length) {
      setOrder(pages.map(p => p.pageNum));
    }
  }, [pages, order.length]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrder(prev => {
        const oldIndex = prev.indexOf(active.id as number);
        const newIndex = prev.indexOf(over.id as number);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleApply = async () => {
    if (!file || order.length === 0) return;

    // Check if order actually changed
    const isChanged = order.some((pageNum, index) => pageNum !== index + 1);
    if (!isChanged) {
      setError("No changes made. Drag pages to reorder them.");
      return;
    }

    try {
      setProcessing(true);
      setProgress(20);
      setError(null);

      // Convert to 0-indexed for pdf-lib
      const apiOrder = order.map(p => p - 1);

      const result = await reorderPages(file, apiOrder);
      setProgress(90);

      const blob = new Blob([result as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setResultFileName(`${baseName} - Reorder PDF - PDFigo by Murtuja.pdf`);
      setProgress(100);
    } catch (err) {
      setError(`Failed to reorder: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setProcessing(false);
    }
  };

  if (!file) return null;

  return (
    <ToolLayout
      preview={
        <UniversalPreview
          title="Drag to Reorder"
          description={`${totalPages} pages total. Hold and drag a page to change its position in the document.`}
          mode="grid"
        >
          {loadError && <p className="text-sm text-red-400 w-full col-span-full">{loadError}</p>}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={order} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-4 w-full">
                {order.map((pageNum) => {
                  const pData = pages.find(p => p.pageNum === pageNum);
                  if (!pData) return null;
                  return <SortablePageCard key={pageNum} pageNum={pageNum} dataUrl={pData.dataUrl} />;
                })}

                {loading && (
                  <div className="aspect-[3/4] rounded-xl border border-white/5 bg-white/5 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    <span className="text-xs text-white/40">Rendering...</span>
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </UniversalPreview>
      }
      options={
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <h3 className="text-sm font-medium text-white mb-1">Save Reordered PDF</h3>
          <p className="text-xs text-white/40 leading-relaxed">This will generate a new document with the updated sequence. Drag and drop pages in the preview to form your desired order before finalizing.</p>
        </div>
      }
      action={
        <button
          onClick={handleApply}
          disabled={processing || loading || order.length === 0}
          className="btn btn-primary w-full shadow-[0_0_20px_rgba(168,85,247,0.2)]"
        >
          {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowLeftRight className="w-5 h-5" />}
          {processing ? "Saving..." : "Apply Order"}
        </button>
      }
    />
  );
}

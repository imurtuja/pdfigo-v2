"use client";

import { useMemo } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from "@dnd-kit/sortable";
import { Combine, Loader2 } from "lucide-react";
import type { ToolControlsProps } from "./types";
import { mergePdfs } from "@/lib/pdf/merge";
import DraggableFileCard from "../pdf/DraggableFileCard";
import UniversalPreview from "../pdf/UniversalPreview";
import ToolLayout from "./ToolLayout";

export default function MergeControls({
  files,
  setFiles,
  processing,
  setProcessing,
  setProgress,
  setResultBlob,
  setResultFileName,
  setError,
}: ToolControlsProps) {

  // Setup DND Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Derive an array of unique ids for the files (using their names, assuming no dupes for simplicity)
  // In a real prod environment we'd attach a unique ID to the file object on upload.
  const items = useMemo(() => files.map((f) => f.name), [files]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1 && setFiles) {
        setFiles(arrayMove(files, oldIndex, newIndex));
      }
    }
  };

  const handleRemove = (id: string) => {
    if (setFiles) {
      setFiles(files.filter(f => f.name !== id));
    }
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please upload at least 2 PDF files to merge.");
      return;
    }
    try {
      setProcessing(true);
      setProgress(10);
      setError(null);

      const result = await mergePdfs(files);
      setProgress(90);

      const blob = new Blob([result as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);

      const baseName = files[0].name.replace(/\.pdf$/i, "");
      setResultFileName(`${baseName} - Merge PDFs - PDFigo by Murtuja.pdf`);
      setProgress(100);
    } catch (err) {
      setError(`Failed to merge: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      preview={
        <UniversalPreview
          title="File Sequence"
          description="Drag and drop files to reorder them before merging."
          mode="grid"
        >
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items} strategy={rectSortingStrategy}>
              <div className="flex flex-wrap gap-4 w-full content-start">
                {files.map((file, index) => (
                  <DraggableFileCard
                    key={file.name}
                    id={file.name}
                    file={file}
                    index={index}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </UniversalPreview>
      }
      options={
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white mb-1">Merge Options</h3>
              <p className="text-xs text-white/35">
                {files.length} file{files.length !== 1 ? "s" : ""} selected.
              </p>
            </div>
          </div>
        </div>
      }
      action={
        <button
          onClick={handleMerge}
          disabled={files.length < 2 || processing}
          className="btn btn-primary w-full"
        >
          {processing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Combine className="w-4 h-4" />
          )}
          {processing ? "Merging..." : `Merge ${files.length} PDF${files.length !== 1 ? "s" : ""}`}
        </button>
      }
    />
  );
}

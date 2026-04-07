import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, File as FileIcon, Loader2 } from "lucide-react";
import { usePdfLoader } from "@/hooks/usePdfLoader";

interface DraggableFileCardProps {
  id: string; // usually the file name or a unique id
  file: File;
  onRemove: (id: string) => void;
  index: number;
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function DraggableFileCard({ id, file, onRemove, index }: DraggableFileCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const { pages, totalPages, loading, error } = usePdfLoader(file, false, 5);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex flex-col bg-[#11101e] border ${
        isDragging ? "border-purple-500 shadow-xl" : "border-white/[0.08]"
      } rounded-xl overflow-hidden`}
    >
      {/* File Header Bar */}
      <div className="flex items-center gap-3 p-3 bg-white/[0.02] border-b border-white/[0.04]">
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/[0.06] rounded-md text-white/40 hover:text-white/80 transition-colors"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <FileIcon className="w-4 h-4 text-purple-400 shrink-0" />
          <div className="truncate">
            <h4 className="text-sm font-medium text-white truncate">{file.name}</h4>
            <p className="text-xs text-white/40">{formatBytes(file.size)}</p>
          </div>
        </div>

        {/* Remove */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
          className="p-1.5 hover:bg-red-500/10 text-white/40 hover:text-red-400 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Pages Preview Area */}
      <div className="p-4 bg-black/20">
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {error ? (
            <div className="text-xs text-red-400 p-2">{error}</div>
          ) : (
            pages.map((p) => (
              <div 
                key={p.pageNum} 
                className="relative shrink-0 w-24 rounded shadow-sm border border-white/10 overflow-hidden bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.dataUrl} alt={`Page ${p.pageNum}`} className="w-full object-contain pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 text-center">
                  <span className="text-[9px] text-white font-medium">Page {p.pageNum}</span>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="w-24 shrink-0 aspect-[3/4] rounded border border-white/5 bg-white/5 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              <span className="text-[10px] text-white/40">Loading...</span>
            </div>
          )}

          {!loading && totalPages > 5 && (
            <div className="w-24 shrink-0 aspect-[3/4] rounded border border-dashed border-white/10 flex items-center justify-center bg-white/[0.02]">
              <span className="text-xs text-white/40">+{totalPages - 5} more</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

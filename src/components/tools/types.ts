export interface ToolControlsProps {
  files: File[];
  setFiles: (files: File[]) => void;
  processing: boolean;
  setProcessing: (v: boolean) => void;
  progress: number;
  setProgress: (v: number) => void;
  resultBlob: Blob | null;
  setResultBlob: (b: Blob | null) => void;
  resultFileName: string;
  setResultFileName: (s: string) => void;
  error: string | null;
  setError: (s: string | null) => void;
}

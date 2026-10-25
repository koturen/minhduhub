import { useRef, useState, type DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';

export default function UploadDropzone({ onFiles, disabled }: { onFiles: (files: File[]) => void; disabled?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const drop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    if (!disabled) onFiles([...e.dataTransfer.files]);
  };
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
      className={`flex flex-col items-center gap-3 rounded-md border-2 border-dashed p-8 text-center transition-colors ${over ? 'border-accent bg-card' : 'border-line'}`}
    >
      <UploadCloud size={32} className="text-accent" aria-hidden="true" />
      <p className="text-sm">Drag images or videos here</p>
      <p className="text-xs text-muted">JPG, PNG, WebP, GIF up to 10 MB · MP4, WebM, MOV up to 100 MB</p>
      <button type="button" className="btn" disabled={disabled} onClick={() => input.current?.click()}>Choose files</button>
      <input ref={input} type="file" multiple hidden accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
        onChange={(e) => { onFiles([...(e.target.files ?? [])]); e.target.value = ''; }} />
    </div>
  );
}

import { useRef, useState, type DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import { useI18n } from '../../i18n';

export default function UploadDropzone({ onFiles, disabled }: { onFiles: (files: File[]) => void; disabled?: boolean }) {
  const { t } = useI18n();
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
      <p className="text-sm">{t('upload.drop')}</p>
      <p className="text-xs text-muted">{t('upload.formats')}</p>
      <button type="button" className="btn" disabled={disabled} onClick={() => input.current?.click()}>{t('upload.choose')}</button>
      <input ref={input} type="file" multiple hidden accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
        onChange={(e) => { onFiles([...(e.target.files ?? [])]); e.target.value = ''; }} />
    </div>
  );
}

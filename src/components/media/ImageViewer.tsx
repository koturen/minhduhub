import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Download, Maximize, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import type { Media } from '../../types/media';

interface Props { media: Media; prevId?: string; nextId?: string }

export default function ImageViewer({ media, prevId, nextId }: Props) {
  const nav = useNavigate();
  const wrap = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [failed, setFailed] = useState(false);

  useEffect(() => { setZoom(1); setFailed(false); }, [media.id]);

  const go = (id?: string) => { if (id) nav(`/images/${id}`); };
  const zoomBy = (d: number) => setZoom((z) => Math.min(4, Math.max(1, +(z + d).toFixed(2))));
  const fullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else wrap.current?.requestFullscreen().catch(() => undefined);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, () => void> = {
      ArrowLeft: () => go(prevId), ArrowRight: () => go(nextId),
      '+': () => zoomBy(0.5), '=': () => zoomBy(0.5), '-': () => zoomBy(-0.5), '0': () => setZoom(1), f: fullscreen,
    };
    const a = map[e.key];
    if (a) { e.preventDefault(); a(); }
  };
  const tool = 'btn h-10 w-10 px-0';

  return (
    <div ref={wrap} tabIndex={0} onKeyDown={onKey} aria-label={`Image viewer: ${media.title}`} className="rounded-md bg-black">
      <div className="flex h-[60vh] items-center overflow-auto">
        {failed ? (
          <p role="alert" className="mx-auto p-4 text-sm text-muted">This image could not be loaded.</p>
        ) : (
          <img
            src={media.url}
            alt={media.title}
            onError={() => setFailed(true)}
            draggable={false}
            style={zoom === 1 ? { maxHeight: '100%', maxWidth: '100%' } : { width: `${zoom * 100}%`, maxWidth: 'none' }}
            className="mx-auto object-contain"
          />
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 border-t border-line bg-surface p-2">
        <button className={tool} disabled={!prevId} onClick={() => go(prevId)} aria-label="Previous image"><ChevronLeft size={18} /></button>
        <button className={tool} disabled={!nextId} onClick={() => go(nextId)} aria-label="Next image"><ChevronRight size={18} /></button>
        <button className={tool} disabled={zoom <= 1} onClick={() => zoomBy(-0.5)} aria-label="Zoom out"><ZoomOut size={18} /></button>
        <span className="w-12 text-center text-xs tabular-nums">{Math.round(zoom * 100)}%</span>
        <button className={tool} disabled={zoom >= 4} onClick={() => zoomBy(0.5)} aria-label="Zoom in"><ZoomIn size={18} /></button>
        <button className={tool} disabled={zoom === 1} onClick={() => setZoom(1)} aria-label="Reset zoom (fit to screen)"><RotateCcw size={18} /></button>
        <button className={tool} onClick={fullscreen} aria-label="Fullscreen"><Maximize size={18} /></button>
        {media.allowDownload && <a className={tool} href={media.url} download target="_blank" rel="noopener noreferrer" aria-label="Download image"><Download size={18} /></a>}
      </div>
    </div>
  );
}

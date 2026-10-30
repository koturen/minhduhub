import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AlertTriangle, Loader2, Maximize, Minimize, Pause, PictureInPicture2, Play, Volume2, VolumeX } from 'lucide-react';
import { formatDuration } from '../../lib/format';
import { useI18n } from '../../i18n';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface Props { src: string; poster?: string; captionsSrc?: string; title: string }

export default function VideoPlayer({ src, poster, captionsSrc, title }: Props) {
  const { t } = useI18n();
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const pipSupported = typeof document !== 'undefined' && document.pictureInPictureEnabled;

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const on: Array<[string, () => void]> = [
      ['play', () => setPlaying(true)],
      ['pause', () => setPlaying(false)],
      ['timeupdate', () => setTime(v.currentTime)],
      ['durationchange', () => setDuration(Number.isFinite(v.duration) ? v.duration : 0)],
      ['volumechange', () => { setVolume(v.volume); setMuted(v.muted); }],
      ['ratechange', () => setRate(v.playbackRate)],
      ['waiting', () => setLoading(true)],
      ['canplay', () => { setLoading(false); setError(false); }],
      ['playing', () => setLoading(false)],
      ['error', () => { setLoading(false); setError(true); }],
    ];
    on.forEach(([e, h]) => v.addEventListener(e, h));
    const fs = () => setFullscreen(document.fullscreenElement === wrap.current);
    document.addEventListener('fullscreenchange', fs);
    return () => {
      on.forEach(([e, h]) => v.removeEventListener(e, h));
      document.removeEventListener('fullscreenchange', fs);
    };
  }, [attempt]);

  const toggle = useCallback(() => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => setError(true)); else v.pause();
  }, []);
  const toggleMute = () => { if (video.current) video.current.muted = !video.current.muted; };
  const seekBy = (d: number) => { const v = video.current; if (v) v.currentTime = Math.min(Math.max(0, v.currentTime + d), v.duration || 0); };
  const volBy = (d: number) => { const v = video.current; if (v) { v.muted = false; v.volume = Math.min(1, Math.max(0, v.volume + d)); } };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else wrap.current?.requestFullscreen().catch(() => undefined);
  };
  const togglePip = () => {
    const v = video.current;
    if (!v) return;
    if (document.pictureInPictureElement) void document.exitPictureInPicture();
    else v.requestPictureInPicture().catch(() => undefined);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'SELECT') return;
    const map: Record<string, () => void> = {
      ' ': toggle, ArrowLeft: () => seekBy(-5), ArrowRight: () => seekBy(5),
      ArrowUp: () => volBy(0.1), ArrowDown: () => volBy(-0.1),
      f: toggleFullscreen, F: toggleFullscreen, m: toggleMute, M: toggleMute,
    };
    const action = map[e.key];
    if (action) { e.preventDefault(); action(); }
  };

  return (
    <div ref={wrap} tabIndex={0} onKeyDown={onKey} aria-label={t('player.label', { title })} className="group relative aspect-video w-full overflow-hidden rounded-md bg-black">
      {!error && (
        <video key={attempt} ref={video} src={src} poster={poster} preload="metadata" playsInline onClick={toggle} className="h-full w-full object-contain">
          {captionsSrc && <track kind="captions" src={captionsSrc} srcLang="en" label="English" />}
        </video>
      )}
      {loading && !error && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin text-accent" size={36} aria-label={t('player.loading')} /></div>}
      {error && (
        <div role="alert" className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center text-sm">
          <AlertTriangle className="text-danger" />
          <p>{t('player.error')}</p>
          <button className="btn" onClick={() => { setError(false); setLoading(true); setAttempt((a) => a + 1); }}>{t('common.retry')}</button>
        </div>
      )}
      {!error && (
        <div className="absolute inset-x-0 bottom-0 bg-black/80 px-3 pb-2 pt-1">
          <input type="range" aria-label={t('player.seek')} min={0} max={duration || 0} step={0.1} value={time}
            onChange={(e) => { if (video.current) video.current.currentTime = Number(e.target.value); }}
            className="h-4 w-full cursor-pointer accent-accent" />
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <button className="btn h-10 w-10 border-0 bg-transparent px-0" onClick={toggle} aria-label={playing ? t('player.pause') : t('player.play')}>{playing ? <Pause size={20} /> : <Play size={20} />}</button>
            <button className="btn h-10 w-10 border-0 bg-transparent px-0" onClick={toggleMute} aria-label={muted ? t('player.unmute') : t('player.mute')}>{muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
            <input type="range" aria-label={t('player.volume')} min={0} max={1} step={0.05} value={muted ? 0 : volume}
              onChange={(e) => { if (video.current) { video.current.muted = false; video.current.volume = Number(e.target.value); } }}
              className="hidden w-20 accent-accent sm:block" />
            <span className="ml-1 tabular-nums">{formatDuration(time)} / {formatDuration(duration)}</span>
            <span className="ml-auto" />
            <label className="sr-only" htmlFor="speed">{t('player.speed')}</label>
            <select id="speed" value={rate} onChange={(e) => { if (video.current) video.current.playbackRate = Number(e.target.value); }} className="h-10 rounded-md border border-line bg-card px-2">
              {SPEEDS.map((s) => <option key={s} value={s}>{s}x</option>)}
            </select>
            {pipSupported && <button className="btn h-10 w-10 border-0 bg-transparent px-0" onClick={togglePip} aria-label={t('player.pip')}><PictureInPicture2 size={20} /></button>}
            <button className="btn h-10 w-10 border-0 bg-transparent px-0" onClick={toggleFullscreen} aria-label={fullscreen ? t('player.exitFullscreen') : t('player.fullscreen')}>{fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}</button>
          </div>
        </div>
      )}
    </div>
  );
}

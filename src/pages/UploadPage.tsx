import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import UploadDropzone from '../components/media/UploadDropzone';
import { isCloudinaryConfigured, toMediaRecord, uploadToCloudinary, type UploadHandle } from '../lib/cloudinary';
import { formatBytes } from '../lib/format';
import { parseTags, uploadFormSchema, validateFile, type UploadFormValues } from '../lib/validation';
import { isSupabaseConfigured } from '../lib/supabase';
import { mediaRepository } from '../services/mediaRepository';
import { CATEGORIES } from '../types/media';

type Status = 'ready' | 'uploading' | 'done' | 'error';
interface Item {
  key: string; file: File; title: string; preview: string;
  status: Status; progress: number; error?: string; doneId?: string;
}

const fileKey = (f: File) => `${f.name}:${f.size}:${f.lastModified}`;

export default function UploadPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const handles = useRef(new Map<string, UploadHandle>());
  const { register, handleSubmit, formState: { errors } } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: { category: 'Entertainment', allowDownload: false, description: '', tags: '' },
  });

  // Release preview object URLs on unmount.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.preview)), []);

  const patch = (key: string, p: Partial<Item>) => setItems((list) => list.map((i) => (i.key === key ? { ...i, ...p } : i)));

  const addFiles = (files: File[]) => {
    const problems: string[] = [];
    const fresh: Item[] = [];
    for (const f of files) {
      const key = fileKey(f);
      const err = validateFile(f);
      if (err) problems.push(`${f.name}: ${err}`);
      else if (items.some((i) => i.key === key) || fresh.some((i) => i.key === key)) problems.push(`${f.name}: already added.`);
      else fresh.push({ key, file: f, title: f.name.replace(/\.[^.]+$/, ''), preview: URL.createObjectURL(f), status: 'ready', progress: 0 });
    }
    setRejected(problems);
    setItems((list) => [...list, ...fresh]);
  };

  const remove = (key: string) => {
    handles.current.get(key)?.cancel();
    setItems((list) => {
      const gone = list.find((i) => i.key === key);
      if (gone) URL.revokeObjectURL(gone.preview);
      return list.filter((i) => i.key !== key);
    });
  };

  const onSubmit = async (values: UploadFormValues) => {
    if (busy) return; // blocks duplicate submissions
    const queue = items.filter((i) => i.status === 'ready' || i.status === 'error');
    if (queue.some((i) => !i.title.trim())) {
      setItems((l) => l.map((i) => (!i.title.trim() ? { ...i, status: 'error', error: 'Enter a title.' } : i)));
      return;
    }
    setBusy(true);
    for (const item of queue) {
      patch(item.key, { status: 'uploading', progress: 0, error: undefined });
      try {
        const handle = uploadToCloudinary(item.file, (progress) => patch(item.key, { progress }));
        handles.current.set(item.key, handle);
        const res = await handle.promise;
        const media = toMediaRecord(res, {
          title: item.title.trim(), description: values.description?.trim() || undefined,
          category: values.category, tags: parseTags(values.tags), allowDownload: values.allowDownload,
        });
        await mediaRepository.add(media);
        patch(item.key, { status: 'done', progress: 100, doneId: media.id, error: undefined });
      } catch (e) {
        patch(item.key, { status: 'error', error: e instanceof Error ? e.message : 'Upload failed.' });
      } finally {
        handles.current.delete(item.key);
      }
    }
    setBusy(false);
  };

  const pending = items.filter((i) => i.status === 'ready' || i.status === 'error').length;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-bold">Upload</h1>
      {!isCloudinaryConfigured ? (
        <div role="alert" className="mb-4 flex gap-2 rounded-md border border-accent p-4 text-sm">
          <AlertTriangle className="shrink-0 text-accent" size={18} />
          <p>Uploads are off because Cloudinary isn't configured. Set <code>VITE_CLOUDINARY_CLOUD_NAME</code> and <code>VITE_CLOUDINARY_UPLOAD_PRESET</code> (see README), then restart.</p>
        </div>
      ) : (
        <p className="mb-4 text-sm text-muted">{isSupabaseConfigured ? 'Files upload to Cloudinary and their details are saved to the shared database, so everyone can see them.' : "Files upload to Cloudinary. Their details are saved in this browser only, so other devices won't see them until a backend is connected."}</p>
      )}

      <UploadDropzone onFiles={addFiles} disabled={busy || !isCloudinaryConfigured} />
      {rejected.length > 0 && (
        <ul role="alert" className="mt-3 space-y-1 text-sm text-danger">{rejected.map((r) => <li key={r}>{r}</li>)}</ul>
      )}

      {items.length > 0 && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6" noValidate>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.key} className="flex gap-3 rounded-md border border-line bg-surface p-3">
                {i.file.type.startsWith('video/')
                  ? <video src={i.preview} className="h-20 w-32 shrink-0 rounded object-cover" muted preload="metadata" />
                  : <img src={i.preview} alt="" className="h-20 w-32 shrink-0 rounded object-cover" />}
                <div className="min-w-0 flex-1">
                  <label className="sr-only" htmlFor={`t-${i.key}`}>Title for {i.file.name}</label>
                  <input id={`t-${i.key}`} className="input" value={i.title} disabled={i.status === 'uploading' || i.status === 'done'}
                    onChange={(e) => patch(i.key, { title: e.target.value, error: undefined, status: i.status === 'error' ? 'ready' : i.status })} maxLength={100} />
                  <p className="mt-1 text-xs text-muted">{i.file.name} · {formatBytes(i.file.size)}</p>
                  {i.status === 'uploading' && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded bg-card" role="progressbar" aria-valuenow={i.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Uploading ${i.file.name}`}>
                      <div className="h-full bg-accent transition-[width]" style={{ width: `${i.progress}%` }} />
                    </div>
                  )}
                  {i.status === 'done' && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-ok"><CheckCircle2 size={14} />Uploaded · <Link className="underline" to={`/${i.file.type.startsWith('video/') ? 'videos' : 'images'}/${i.doneId}`}>View</Link></p>
                  )}
                  {i.error && <p role="alert" className="mt-1 text-xs text-danger">{i.error}</p>}
                </div>
                {i.status !== 'done' && (
                  <button type="button" className="btn h-10 w-10 px-0" onClick={() => remove(i.key)} aria-label={i.status === 'uploading' ? `Cancel upload of ${i.file.name}` : `Remove ${i.file.name}`}><X size={16} /></button>
                )}
              </li>
            ))}
          </ul>

          <fieldset className="space-y-4" disabled={busy}>
            <legend className="mb-2 font-semibold">Details for all files</legend>
            <div>
              <label htmlFor="category" className="mb-1 block text-sm">Category</label>
              <select id="category" className="input" {...register('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
              {errors.category && <p role="alert" className="mt-1 text-xs text-danger">{errors.category.message}</p>}
            </div>
            <div>
              <label htmlFor="description" className="mb-1 block text-sm">Description (optional)</label>
              <textarea id="description" rows={3} className="input py-2" {...register('description')} />
              {errors.description && <p role="alert" className="mt-1 text-xs text-danger">{errors.description.message}</p>}
            </div>
            <div>
              <label htmlFor="tags" className="mb-1 block text-sm">Tags, separated by commas</label>
              <input id="tags" className="input" placeholder="landscape, travel" {...register('tags')} />
              {errors.tags && <p role="alert" className="mt-1 text-xs text-danger">{errors.tags.message}</p>}
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-accent" {...register('allowDownload')} />Allow others to download images</label>
          </fieldset>

          <button type="submit" className="btn btn-primary" disabled={busy || pending === 0}>
            {busy ? 'Uploading…' : `Upload ${pending} file${pending === 1 ? '' : 's'}`}
          </button>
        </form>
      )}
    </div>
  );
}

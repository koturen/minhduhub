import { Link } from 'react-router-dom';
export default function NotFoundPage() {
  return (
    <div className="py-16 text-center">
      <h1 className="mb-2 text-2xl font-bold">Page not found</h1>
      <p className="mb-6 text-muted">That address doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Back to home</Link>
    </div>
  );
}

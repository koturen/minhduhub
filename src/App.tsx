import { Component, lazy, Suspense, type ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';

const VideosPage = lazy(() => import('./pages/VideosPage'));
const ImagesPage = lazy(() => import('./pages/ImagesPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const VideoDetailPage = lazy(() => import('./pages/VideoDetailPage'));
const ImageDetailPage = lazy(() => import('./pages/ImageDetailPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="p-8 text-center">
        <p className="mb-4">Something went wrong while showing this page.</p>
        <button className="btn" onClick={() => location.reload()}>Reload</button>
      </div>
    );
  }
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-accent focus:p-2 focus:text-black">Skip to content</a>
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          <ErrorBoundary>
            <Suspense fallback={<div className="skeleton h-64" aria-label="Loading" />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/videos" element={<VideosPage />} />
                <Route path="/videos/:id" element={<VideoDetailPage />} />
                <Route path="/images" element={<ImagesPage />} />
                <Route path="/images/:id" element={<ImageDetailPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <Footer />
    </div>
  );
}

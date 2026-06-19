import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="shell" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
      <Helmet><title>Page Not Found | SwiftDL</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="max-w-sm mx-auto">
        <div className="text-5xl font-bold mb-2" style={{ color: 'var(--brand-600)' }}>404</div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--ink-900)' }}>This page is not available</h1>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--ink-600)' }}>The page you are looking for does not exist or has been moved.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="btn-primary text-xs"><Home className="h-3.5 w-3.5" /> Go home</Link>
          <button onClick={() => window.history.back()} className="btn-outline text-xs"><ArrowLeft className="h-3.5 w-3.5" /> Go back</button>
        </div>
      </div>
    </div>
  );
}
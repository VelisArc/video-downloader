import { Helmet } from 'react-helmet-async';
import { Download, Globe, Clock, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

export default function ShippingDeliveryPolicy() {
    return (
        <div className="section-shell max-w-3xl py-8">
            <Helmet>
                <title>Shipping & Delivery Policy - {siteConfig.name}</title>
                <meta name="description" content="SwiftDL Shipping and Delivery Policy. Learn about our digital delivery service for supported video downloads." />
                <link rel="canonical" href={siteUrl('/shipping-delivery')} />
            </Helmet>

            <div className="text-center mb-6">
                <div className="mx-auto inline-flex rounded-xl p-2.5" style={{ background: 'var(--surface-soft)', color: 'var(--brand-600)' }}>
                    <Download className="h-5 w-5" />
                </div>
                <h1 className="mt-3 text-2xl font-black" style={{ color: 'var(--ink-900)' }}>Shipping & Delivery Policy</h1>
                <p className="mt-1 text-[10px]" style={{ color: 'var(--ink-500)' }}>Last updated: January 22, 2026</p>
            </div>

            <div className="rounded-2xl p-3 mb-6 text-xs" style={{ background: 'var(--surface-soft)', color: 'var(--ink-600)' }}>
                <div className="flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--brand-600)' }} />
                    <div>
                        <p className="font-semibold" style={{ color: 'var(--ink-900)' }}>Digital Service - No Physical Shipping</p>
                        <p className="mt-0.5 text-[11px]">All video downloads are delivered digitally via your web browser.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 text-sm" style={{ color: 'var(--ink-600)' }}>
                <section>
                    <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--ink-900)' }}>1. Nature of Service</h2>
                    <p className="text-xs">SwiftDL is a 100% digital service. There are no physical products, packages, or shipments involved.</p>
                </section>
                <section>
                    <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--ink-900)' }}>2. Digital Delivery</h2>
                    <ul className="list-disc pl-4 space-y-1 text-xs">
                        <li><strong>Instant Download:</strong> Videos are available for immediate download through your browser</li>
                        <li><strong>Direct Browser Download:</strong> Files are downloaded to your device's default download folder</li>
                    </ul>
                </section>
                <section>
                    <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--ink-900)' }}>3. Delivery Time</h2>
                    <div className="grid md:grid-cols-2 gap-2">
                        <div className="card text-xs">
                            <p className="font-semibold" style={{ color: 'var(--ink-900)' }}>Processing Time</p>
                            <p className="mt-0.5">Typically 5-30 seconds</p>
                        </div>
                        <div className="card text-xs">
                            <p className="font-semibold" style={{ color: 'var(--ink-900)' }}>Download Time</p>
                            <p className="mt-0.5">Depends on your internet speed</p>
                        </div>
                    </div>
                </section>
                <section>
                    <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--ink-900)' }}>4. File Formats</h2>
                    <ul className="list-disc pl-4 space-y-1 text-xs">
                        <li><strong>Video:</strong> MP4 format (compatible with all devices)</li>
                        <li><strong>Audio:</strong> MP3 format (when audio-only option is selected)</li>
                    </ul>
                </section>
                <section className="card">
                    <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--ink-900)' }}>Need Help?</h2>
                    <p className="text-xs">Email: <a href="mailto:support@swiftdownlod.online" className="hover:underline" style={{ color: 'var(--brand-700)' }}>support@swiftdownlod.online</a></p>
                </section>
                <section>
                    <div className="flex flex-wrap gap-2">
                        <Link to="/refund-policy" className="pill-soft hover:border-[var(--brand-300)] transition">Refund Policy</Link>
                        <Link to="/terms-of-service" className="pill-soft hover:border-[var(--brand-300)] transition">Terms of Service</Link>
                        <Link to="/contact-us" className="pill-soft hover:border-[var(--brand-300)] transition">Contact Us</Link>
                    </div>
                </section>
            </div>
        </div>
    );
}

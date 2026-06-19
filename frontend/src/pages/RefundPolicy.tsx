import { Helmet } from 'react-helmet-async';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

export default function RefundPolicy() {
    return (
        <div className="section-shell max-w-3xl py-8">
            <Helmet>
                <title>Refund & Cancellation Policy - {siteConfig.name}</title>
                <meta name="description" content="SwiftDL Refund and Cancellation Policy. Learn how we handle plan cancellations, support issues, and payment-related concerns." />
                <link rel="canonical" href={siteUrl('/refund-policy')} />
            </Helmet>

            <div className="text-center mb-6">
                <div className="mx-auto inline-flex rounded-xl p-2.5" style={{ background: 'var(--surface-soft)', color: 'var(--brand-600)' }}>
                    <RefreshCw className="h-5 w-5" />
                </div>
                <h1 className="mt-3 text-2xl font-black" style={{ color: 'var(--ink-900)' }}>Refund & Cancellation Policy</h1>
                <p className="mt-1 text-[10px]" style={{ color: 'var(--ink-500)' }}>Last updated: January 22, 2026</p>
            </div>

            <div className="rounded-2xl p-3 mb-6 text-xs" style={{ background: 'var(--surface-soft)', color: 'var(--ink-600)' }}>
                <div className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--brand-600)' }} />
                    <div>
                        <p className="font-semibold" style={{ color: 'var(--ink-900)' }}>SwiftDL includes free and premium access</p>
                        <p className="mt-0.5 text-[11px]">Some deployments offer optional premium plans. Payment questions are handled here.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 text-sm" style={{ color: 'var(--ink-600)' }}>
                <section>
                    <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--ink-900)' }}>1. Service Overview</h2>
                    <p className="text-xs">SwiftDL provides browser-based video downloading workflows. Some deployments include optional premium plans for higher limits.</p>
                </section>
                <section>
                    <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--ink-900)' }}>2. No Refund Applicable</h2>
                    <p className="text-xs">Free usage does not create any refund obligation. If you purchased a premium plan and encounter a billing issue, contact support.</p>
                </section>
                <section>
                    <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--ink-900)' }}>3. Service Availability</h2>
                    <p className="text-xs">We strive to keep SwiftDL available 24/7. We may modify or discontinue features at any time.</p>
                </section>
                <section>
                    <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--ink-900)' }}>4. Cancellation Policy</h2>
                    <p className="text-xs">As SwiftDL does not require registration or subscription, you can stop using our service at any time without any cancellation process.</p>
                </section>
                <section className="card">
                    <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--ink-900)' }}>Contact Us</h2>
                    <p className="text-xs">For any questions, contact us at{' '}
                        <a href="mailto:support@swiftdownlod.online" className="hover:underline" style={{ color: 'var(--brand-700)' }}>support@swiftdownlod.online</a>
                    </p>
                </section>
                <section>
                    <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--ink-900)' }}>Related Policies</h2>
                    <div className="flex flex-wrap gap-2">
                        <Link to="/terms-of-service" className="pill-soft hover:border-[var(--brand-300)] transition">Terms of Service</Link>
                        <Link to="/privacy-policy" className="pill-soft hover:border-[var(--brand-300)] transition">Privacy Policy</Link>
                        <Link to="/contact-us" className="pill-soft hover:border-[var(--brand-300)] transition">Contact Us</Link>
                    </div>
                </section>
            </div>
        </div>
    );
}

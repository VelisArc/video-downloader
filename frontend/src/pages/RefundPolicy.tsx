import { Helmet } from 'react-helmet-async';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

export default function RefundPolicy() {
  return (
    <div className="section-shell max-w-3xl py-8">
      <Helmet>
        <title>Refund & Cancellation Policy - {siteConfig.name}</title>
        <meta
          name="description"
          content="SwiftDL Refund and Cancellation Policy. Learn how we handle plan cancellations, support issues, and payment-related concerns."
        />
        <link rel="canonical" href={siteUrl('/refund-policy')} />
      </Helmet>

      <div className="text-center mb-6">
        <div className="mx-auto inline-flex rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--brand-600)]">
          <RefreshCw className="h-5 w-5" />
        </div>
        <h1 className="mt-3 text-2xl font-black text-[var(--ink-900)]">
          Refund & Cancellation Policy
        </h1>
        <p className="mt-1 text-[10px] text-[var(--ink-500)]">
          Last updated: January 22, 2026
        </p>
      </div>

      <div className="feature-card bg-[var(--surface-soft)] p-3 mb-6 text-xs">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[var(--brand-600)]" />
          <div>
            <p className="font-semibold text-[var(--ink-900)]">
              SwiftDL includes free and premium access
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--ink-600)]">
              Some deployments offer optional premium plans. Payment questions
              are handled here.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 text-sm text-[var(--ink-600)]">
        <section className="feature-card">
          <h2 className="text-lg font-bold mb-2 text-[var(--ink-900)]">
            1. Service Overview
          </h2>
          <p className="text-xs leading-7">
            SwiftDL provides browser-based video downloading workflows. Some
            deployments include optional premium plans for higher limits.
          </p>
        </section>
        <section className="feature-card">
          <h2 className="text-lg font-bold mb-2 text-[var(--ink-900)]">
            2. No Refund Applicable
          </h2>
          <p className="text-xs leading-7">
            Free usage does not create any refund obligation. If you purchased a
            premium plan and encounter a billing issue, contact support.
          </p>
        </section>
        <section className="feature-card">
          <h2 className="text-lg font-bold mb-2 text-[var(--ink-900)]">
            3. Service Availability
          </h2>
          <p className="text-xs leading-7">
            We strive to keep SwiftDL available 24/7. We may modify or
            discontinue features at any time.
          </p>
        </section>
        <section className="feature-card">
          <h2 className="text-lg font-bold mb-2 text-[var(--ink-900)]">
            4. Cancellation Policy
          </h2>
          <p className="text-xs leading-7">
            As SwiftDL does not require registration or subscription, you can
            stop using our service at any time without any cancellation process.
          </p>
        </section>

        <section className="feature-card">
          <h2 className="text-lg font-bold mb-2 text-[var(--ink-900)]">
            Contact Us
          </h2>
          <p className="text-xs leading-7">
            For any questions, contact us at{' '}
            <a
              href="mailto:support@swiftdownlod.online"
              className="hover:underline text-[var(--brand-700)]"
            >
              support@swiftdownlod.online
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-[var(--ink-900)]">
            Related Policies
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link to="/terms-of-service" className="pill-soft">
              Terms of Service
            </Link>
            <Link to="/privacy-policy" className="pill-soft">
              Privacy Policy
            </Link>
            <Link to="/contact-us" className="pill-soft">
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

import { Helmet } from 'react-helmet-async';
import { Cookie, Database, Eye, Lock, Mail, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

export default function PrivacyPolicy() {
  return (
    <div className="section-shell max-w-5xl py-10">
      <Helmet>
        <title>Privacy Policy | {siteConfig.name}</title>
        <meta
          name="description"
          content="Learn what SwiftDL stores, what stays in your browser, and how account, cookie, and billing data are handled."
        />
        <link rel="canonical" href={siteUrl('/privacy-policy')} />
      </Helmet>

      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto inline-flex rounded-[28px] bg-[var(--surface-soft)] p-4 text-[var(--brand-600)]">
          <Shield className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-4xl font-black text-[var(--ink-900)] md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-base leading-8 text-[var(--ink-600)]">
          This policy explains how SwiftDL handles browser history, account data,
          cookie-related workflows, and payment records.
        </p>
      </div>

      <div className="mt-8 rounded-[32px] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-5 text-sm leading-7 text-[var(--ink-600)]">
        <p className="font-semibold text-[var(--ink-900)]">Quick summary</p>
        <ul className="mt-3 space-y-2">
          <li>Basic public-link use can happen without creating an account.</li>
          <li>Recent downloads are stored in your browser for convenience.</li>
          <li>Account, cookie, and billing data may be processed only when you choose related features.</li>
          <li>Advertising and analytics behavior can depend on how a deployment is configured.</li>
        </ul>
      </div>

      <div className="mt-10 space-y-8 text-sm text-[var(--ink-600)]">
        <section className="feature-card">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-[var(--brand-600)]" />
            <h2 className="text-2xl font-black text-[var(--ink-900)]">
              1. Information we collect
            </h2>
          </div>
          <div className="mt-4 space-y-4 leading-7">
            <p>
              You can use SwiftDL without creating an account for the basic
              public-link workflow. If you choose to login, save cookies to your
              account, or purchase a plan, additional information may be
              processed for those features.
            </p>
            <ul className="list-disc pl-5">
              <li>Browser and device information such as IP, user agent, and referring pages</li>
              <li>Local browser storage for recent downloads and product preferences</li>
              <li>Authentication data such as email and account identifiers when you login</li>
              <li>Cookie-related records if you intentionally save Cookies Mode data to your account</li>
              <li>Billing and payment metadata through our payment providers when you purchase a plan</li>
            </ul>
          </div>
        </section>

        <section className="feature-card">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-[var(--brand-600)]" />
            <h2 className="text-2xl font-black text-[var(--ink-900)]">
              2. How we use information
            </h2>
          </div>
          <ul className="mt-4 list-disc pl-5 leading-7">
            <li>To operate the downloader and return metadata or media links</li>
            <li>To provide account-based features such as entitlements and saved cookies</li>
            <li>To process billing, purchases, refunds, and abuse prevention</li>
            <li>To understand product health, traffic, and deployment-level performance</li>
          </ul>
        </section>

        <section className="feature-card">
          <div className="flex items-center gap-3">
            <Cookie className="h-5 w-5 text-[var(--brand-600)]" />
            <h2 className="text-2xl font-black text-[var(--ink-900)]">
              3. Cookies and local storage
            </h2>
          </div>
          <div className="mt-4 space-y-4 leading-7">
            <p>
              SwiftDL may use browser storage and cookies for session state,
              install prompts, history convenience, advertising, analytics, and
              product preferences depending on the deployment configuration.
            </p>
            <p>
              Cookies Mode is different from site cookies. It is an optional
              workflow where you deliberately provide your own cookies.txt export
              for a link that already belongs to your authorized session.
            </p>
            <p>
              For more detail, read the{' '}
              <Link to="/cookie-policy" className="text-[var(--brand-700)] hover:underline">
                Cookie Policy
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="feature-card">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-[var(--brand-600)]" />
            <h2 className="text-2xl font-black text-[var(--ink-900)]">
              4. Retention and security
            </h2>
          </div>
          <div className="mt-4 space-y-4 leading-7">
            <p>
              Recent downloads shown inside the product are stored locally in
              the browser. Account and billing records may be retained as needed
              for authentication, support, security, and legal compliance.
            </p>
            <p>
              We aim to minimize unnecessary retention, but no online service
              can promise absolute security. Users should protect their own
              accounts, exported cookies, and devices.
            </p>
          </div>
        </section>

        <section className="feature-card">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-[var(--brand-600)]" />
            <h2 className="text-2xl font-black text-[var(--ink-900)]">
              5. Contact
            </h2>
          </div>
          <p className="mt-4 leading-7">
            Questions about this policy can be sent to{' '}
            <a href={siteConfig.supportMailto} className="text-[var(--brand-700)] hover:underline">
              {siteConfig.supportEmail}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

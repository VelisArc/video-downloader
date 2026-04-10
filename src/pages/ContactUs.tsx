import { Helmet } from 'react-helmet-async';
import { Clock3, Globe2, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

const helpTopics = [
  'Broken or unsupported links',
  'Billing or plan questions',
  'Cookies Mode guidance',
  'Copyright or DMCA notices',
  'Feature requests and product feedback',
];

export default function ContactUs() {
  return (
    <div className="section-shell max-w-4xl py-10">
      <Helmet>
        <title>Contact | {siteConfig.name}</title>
        <meta
          name="description"
          content="Reach SwiftDL support for technical issues, billing, copyright notices, or product feedback."
        />
        <link rel="canonical" href={siteUrl('/contact-us')} />
      </Helmet>

      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto inline-flex rounded-[28px] bg-[var(--surface-soft)] p-4 text-[var(--brand-600)]">
          <MessageCircle className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-4xl font-black text-[var(--ink-900)] md:text-5xl">
          Contact support
        </h1>
        <p className="mt-4 text-base leading-8 text-[var(--ink-600)]">
          Share the platform, the type of link, and the exact error message if
          you want the fastest troubleshooting response.
        </p>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="feature-card">
          <h2 className="text-2xl font-black text-[var(--ink-900)]">Reach us</h2>
          <div className="mt-5 space-y-5 text-sm leading-7 text-[var(--ink-600)]">
            <div className="flex gap-3">
              <Mail className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />
              <div>
                <p className="font-semibold text-[var(--ink-900)]">Email</p>
                <a href={siteConfig.supportMailto} className="text-[var(--brand-700)] hover:underline">
                  {siteConfig.supportEmail}
                </a>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock3 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />
              <div>
                <p className="font-semibold text-[var(--ink-900)]">Support hours</p>
                <p>{siteConfig.supportHours}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Globe2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />
              <div>
                <p className="font-semibold text-[var(--ink-900)]">Website</p>
                <a href={siteConfig.baseUrl} className="text-[var(--brand-700)] hover:underline">
                  {siteConfig.domain}
                </a>
              </div>
            </div>
          </div>
        </article>

        <article className="feature-card">
          <h2 className="text-2xl font-black text-[var(--ink-900)]">
            Helpful context to include
          </h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--ink-600)]">
            {helpTopics.map((topic) => (
              <li key={topic}>• {topic}</li>
            ))}
          </ul>
          <p className="mt-5 text-sm leading-7 text-[var(--ink-600)]">
            If your issue is technical, include the exact platform, whether the
            media was public or session-protected, and what you already tried.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/faq"
              className="rounded-full bg-[var(--ink-900)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--ink-700)]"
            >
              Read FAQ
            </Link>
            <Link
              to="/dmca"
              className="rounded-full border border-[var(--border-soft)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink-700)] transition hover:border-[var(--brand-300)] hover:text-[var(--brand-700)]"
            >
              Copyright / DMCA
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}

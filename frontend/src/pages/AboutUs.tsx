import { Helmet } from 'react-helmet-async';
import { CheckCircle2, Globe, Shield, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

const principles = [
  {
    title: 'Broader but honest scope',
    description:
      'SwiftDL now supports a broader set of yt-dlp-compatible platforms without pretending every link on the internet will always work.',
    icon: Sparkles,
  },
  {
    title: 'Privacy-minded handling',
    description:
      'The product is designed around direct lookup and browser-side history. It is not trying to become a hosted library of user downloads.',
    icon: Shield,
  },
  {
    title: 'Accessible UX',
    description:
      'The workflow is meant to be understandable on desktop and mobile without extensions, installers, or complicated setup.',
    icon: Globe,
  },
  {
    title: 'Permission-aware use',
    description:
      'Advanced options are positioned for links you already have permission to access, not as a rights bypass.',
    icon: Target,
  },
];

export default function AboutUs() {
  return (
    <div className="section-shell max-w-5xl py-8">
      <Helmet>
        <title>About | {siteConfig.name}</title>
        <meta
          name="description"
          content="Learn how SwiftDL approaches supported downloads, privacy-minded handling, and permission-aware workflows."
        />
        <link rel="canonical" href={siteUrl('/about-us')} />
      </Helmet>

      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto inline-flex rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--brand-600)]">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-3xl font-black text-[var(--ink-900)] md:text-4xl">
          A cleaner download workflow with broader coverage and honest limits
        </h1>
        <p className="mt-4 text-base leading-8 text-[var(--ink-600)]">
          SwiftDL exists to make supported video downloads feel simpler, more
          trustworthy, and less cluttered than the typical downloader experience.
        </p>
      </div>

      <section className="feature-card mt-8 p-6 md:p-8">
        <h2 className="text-3xl font-black text-[var(--ink-900)]">
          What we optimize for
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--ink-600)]">
          <p>
            The project focuses on the workflows that matter to real users:
            public link downloads, creator self-archiving, internal review, and
            authorized session-based downloads.
          </p>
          <p>
            That more balanced scope keeps the app easier to explain and
            maintain. It also reduces the temptation to promise unrealistic
            features that do not hold up when platform behavior changes.
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {principles.map(({ title, description, icon: Icon }) => (
          <article key={title} className="feature-card">
            <div className="mb-4 inline-flex rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--brand-600)]">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-black text-[var(--ink-900)]">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
              {description}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 feature-card bg-[var(--surface-soft)] p-5 md:p-6">
        <h2 className="text-3xl font-black text-[var(--ink-900)]">
          Responsible use
        </h2>
        <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--ink-600)]">
          <li className="flex gap-3">
            <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />
            Use SwiftDL for media you own, media you are allowed to access, or
            approved offline/internal reference workflows.
          </li>
          <li className="flex gap-3">
            <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />
            Respect copyright, creator rights, and the platform rules that apply
            to the source content.
          </li>
          <li className="flex gap-3">
            <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />
            Only access content you are already authorized to view.
          </li>
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/contact-us" className="btn-dark">
          Contact support
        </Link>
        <Link to="/privacy-policy" className="btn-outline">
          Read privacy policy
        </Link>
      </div>
    </div>
  );
}

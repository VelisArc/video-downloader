import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ChevronDown,
  Download,
  HelpCircle,
  Instagram,
  Search,
  Shield,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className || 'h-4 w-4'} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
  </svg>
);

const categories = [
  { id: 'all', name: 'All', icon: HelpCircle },
  { id: 'general', name: 'General', icon: Sparkles },
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'facebook', name: 'Facebook', icon: FacebookIcon },
  { id: 'technical', name: 'Technical', icon: Download },
  { id: 'policy', name: 'Privacy & Policy', icon: Shield },
];

const faqs = [
  {
    id: 1,
    category: 'general',
    question: 'What does SwiftDL support right now?',
    answer:
      'SwiftDL supports a wider set of yt-dlp-compatible media workflows now. Public links across major social and video platforms work best, and coverage still varies depending on the exact source link.',
  },
  {
    id: 2,
    category: 'general',
    question: 'Do I need to create an account?',
    answer:
      'No. You can use the downloader as a guest. Logging in is mainly useful for higher limits on some deployments, purchases, or saving premium features to your account.',
  },
  {
    id: 3,
    category: 'general',
    question: 'Is SwiftDL free?',
    answer:
      'Yes, there is a free tier. Some deployments also offer optional ad-free plans with higher or unlimited limits.',
  },
  {
    id: 4,
    category: 'general',
    question: 'Does SwiftDL work on phones and tablets?',
    answer:
      'Yes. The app is browser-based and works on iPhone, Android, tablets, and desktop browsers. You can also install it as a lightweight web app.',
  },
  {
    id: 5,
    category: 'instagram',
    question: 'How do I download an Instagram reel?',
    answer:
      'Copy the reel link from Instagram, paste it into SwiftDL, choose video or audio, and review the preview card before saving the file.',
  },
  {
    id: 6,
    category: 'instagram',
    question: 'Can SwiftDL help with private Instagram links?',
    answer:
      'Public links are the default path. For login-required links, you would need to be already authorized to view the content.',
  },
  {
    id: 7,
    category: 'instagram',
    question: 'Can I save photos or carousel posts?',
    answer:
      'Many supported Instagram post links work, including several post and carousel formats. Results still depend on what the platform exposes for that specific link.',
  },
  {
    id: 8,
    category: 'facebook',
    question: 'How do I download a Facebook video?',
    answer:
      'Copy the direct Facebook or fb.watch link, paste it into SwiftDL, then save the result after the preview is generated.',
  },
  {
    id: 9,
    category: 'facebook',
    question: 'Do Facebook reels and Watch videos work?',
    answer:
      'Yes, many public reels and Watch-style links are supported. Reliability still depends on the exact URL and current platform behavior.',
  },
  {
    id: 10,
    category: 'facebook',
    question: 'What about private groups or friends-only posts?',
    answer:
      'Those links usually require an authenticated session. They may help only if you are already authorized to view the content.',
  },
  {
    id: 11,
    category: 'technical',
    question: 'Why does a link fail even though it looks correct?',
    answer:
      'The post may be deleted, rate-limited, region-restricted, session-protected, or delivered in a format the platform is not exposing cleanly at that moment.',
  },
  {
    id: 12,
    category: 'technical',
    question: 'Can I extract audio only?',
    answer:
      'Yes. Use the audio option before submitting the link. SwiftDL will request the best available audio stream when the source provides one.',
  },
  {
    id: 13,
    category: 'technical',
    question: 'Why does the browser sometimes open the media instead of saving it?',
    answer:
      'That is normal browser behavior for some file types. If it previews instead of downloading immediately, use Save video as or the share/save actions on mobile.',
  },
  {
    id: 14,
    category: 'technical',
    question: 'Why does a copied direct media link stop working later?',
    answer:
      'Social platforms commonly issue temporary media URLs. They expire, so it is best to download the file locally rather than rely on a temporary direct link.',
  },
  {
    id: 15,
    category: 'technical',
    question: 'Where is my history stored?',
    answer:
      'The Recent Downloads section is stored locally in your browser. It is not intended as a permanent cloud history.',
  },
  {
    id: 16,
    category: 'policy',
    question: 'Does SwiftDL host copies of downloaded media?',
    answer:
      'The public workflow is designed to fetch metadata and a downloadable media URL, not to run a permanent hosted media library for user downloads.',
  },
  {
    id: 17,
    category: 'policy',
    question: 'What about advanced authentication workflows?',
    answer:
      'It is an advanced workflow for links that require authentication. You should only use it with your own session and only when you are already allowed to view that media.',
  },
  {
    id: 18,
    category: 'policy',
    question: 'Is it okay to re-upload what I download?',
    answer:
      'Not by default. You should respect copyright, platform terms, and the rights of the creator. Downloading for personal or authorized internal use is different from redistributing content.',
  },
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItem, setOpenItem] = useState<number | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="section-shell max-w-5xl py-8">
      <Helmet>
        <title>FAQ | {siteConfig.name}</title>
        <meta
          name="description"
          content="Find answers about supported links, download limits, audio extraction, and responsible use."
        />
        <link rel="canonical" href={siteUrl('/faq')} />
      </Helmet>

      <div className="mx-auto max-w-3xl text-center">
        <span className="section-eyebrow">Help center</span>
        <h1 className="mt-4 text-3xl font-black text-[var(--ink-900)] md:text-4xl">
          Frequently asked questions
        </h1>
        <p className="mt-4 text-base leading-8 text-[var(--ink-600)]">
          Practical answers about supported links, permissions, limitations, and
          the safest ways to use SwiftDL.
        </p>
      </div>

      <div className="mx-auto mt-6 max-w-3xl">
        <div className="relative mb-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-500)]" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="input-field w-full pl-11"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`pill-soft transition ${
                  isActive
                    ? 'bg-[var(--brand-600)] text-white border-[var(--brand-600)]'
                    : ''
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-3xl space-y-3">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isOpen = openItem === faq.id;
            return (
              <article
                key={faq.id}
                className={`feature-card overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'border-[var(--brand-300)] shadow-xl shadow-[var(--brand-500)]/5'
                    : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenItem(isOpen ? null : faq.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold leading-6 text-[var(--ink-900)] md:text-base">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`mt-1 h-5 w-5 flex-none text-[var(--brand-600)] transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-[var(--border-soft)] px-5 py-4">
                      <p className="text-sm leading-7 text-[var(--ink-600)]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="feature-card px-6 py-10 text-center text-sm text-[var(--ink-500)]">
            No questions matched your search. Try a broader keyword.
          </div>
        )}
      </div>

      <div className="mx-auto mt-8 max-w-3xl feature-card p-6 text-center">
        <h2 className="text-xl font-black text-[var(--ink-900)]">
          Still need help?
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
          If your issue is link-specific, include the platform, what you tried,
          and whether the media was public or session-protected.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link to="/contact-us" className="btn-dark">
            Contact support
          </Link>
          <Link to="/how-to-download-instagram-reels" className="btn-outline">
            Read guides
          </Link>
        </div>
      </div>
    </div>
  );
}

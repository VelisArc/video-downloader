export const siteConfig = {
  name: 'ShareHub',
  shortName: 'ShareHub',
  domain: 'sharehub.online',
  baseUrl: 'https://sharehub.online',
  supportEmail: 'support@sharehub.online',
  supportMailto: 'mailto:support@sharehub.online',
  supportHours: 'Monday to Friday, 9:00 AM to 6:00 PM IST',
  defaultTitle: 'ShareHub | Multi-Platform Video Downloader',
  defaultDescription:
    'Download video and audio from many major platforms with a fast browser workflow.',
};

export const primaryNav = [
  { label: 'Home', to: '/' },
  { label: 'Platforms', to: '/supported-platforms' },
  { label: 'Premium', to: '/pricing' },
  { label: 'FAQ', to: '/faq' },
  { label: 'About', to: '/about-us' },
  { label: 'Contact', to: '/contact-us' },
];

export const footerGroups = [
  {
    title: 'Product',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Supported Platforms', to: '/supported-platforms' },
      { label: 'Premium', to: '/pricing' },
      { label: 'FAQ', to: '/faq' },
    ],
  },
  {
    title: 'Guides',
    links: [
      { label: 'Instagram Guide', to: '/how-to-download-instagram-reels' },
      { label: 'Facebook Guide', to: '/how-to-download-facebook-videos' },
      { label: 'About Us', to: '/about-us' },
      { label: 'Contact Us', to: '/contact-us' },
    ],
  },
  {
    title: 'Policies',
    links: [
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms of Service', to: '/terms-of-service' },
      { label: 'Refund Policy', to: '/refund-policy' },
      { label: 'Shipping & Delivery', to: '/shipping-delivery' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'DMCA', to: '/dmca' },
    ],
  },
];

export const platformHighlights = [
  'Broad yt-dlp-powered coverage across major social and video platforms',
  'Video and audio extraction when the source exposes a compatible stream',
  'Direct downloads in your browser without app installations',
];

export function siteUrl(path = '/') {
  if (!path || path === '/') return siteConfig.baseUrl;
  return `${siteConfig.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

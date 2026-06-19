import { Helmet } from 'react-helmet-async';
import { siteConfig, siteUrl } from '../lib/site';

const DMCA = () => {
  return (
    <div className="section-shell max-w-3xl py-8">
      <Helmet>
        <title>DMCA Policy - SwiftDL</title>
        <meta name="description" content="DMCA Copyright Policy for SwiftDL. Report copyright infringements." />
        <link rel="canonical" href={siteUrl('/dmca')} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteConfig.name} />
        <meta property="og:url" content={siteUrl('/dmca')} />
        <meta property="og:title" content="DMCA Policy - SwiftDL" />
        <meta property="og:description" content="DMCA Copyright Policy for SwiftDL. Report copyright infringements." />
        <meta property="og:image" content={siteUrl('/logo.png')} />
      </Helmet>
      <h1 className="text-2xl font-black mb-4" style={{ color: 'var(--ink-900)' }}>DMCA / Copyright Policy</h1>
      <div className="space-y-4 text-sm" style={{ color: 'var(--ink-600)' }}>
        <p>
          SwiftDL respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998, SwiftDL will respond expeditiously to claims of copyright infringement committed using the SwiftDL service and/or website if reported to SwiftDL's Designated Copyright Agent.
        </p>
        <p>
          If you are a copyright owner, authorized to act on behalf of one, or authorized to act under any exclusive right under copyright, please report alleged copyright infringements taking place on or through the Site by completing the following DMCA Notice and delivering it to SwiftDL's Designated Copyright Agent.
        </p>
        <h2 className="text-lg font-bold mt-4" style={{ color: 'var(--ink-900)' }}>DMCA Notice of Alleged Infringement</h2>
        <ol className="list-decimal pl-5 space-y-2 text-xs">
          <li>Identify the copyrighted work that you claim has been infringed.</li>
          <li>Identify the material or link you claim is infringing and to which access is to be disabled, including the URL or exact location.</li>
          <li>Provide your company affiliation (if applicable), mailing address, telephone number, and email address.</li>
          <li>Include both: "I have a good faith belief that the disputed use is not authorized" and "I state that the information in this Notice is accurate" under penalty of perjury.</li>
          <li>Provide your full legal name and electronic or physical signature.</li>
        </ol>
        <p>Deliver this Notice to SwiftDL's Designated Copyright Agent:</p>
        <p className="font-semibold" style={{ color: 'var(--ink-900)' }}>
          Email: <a href="mailto:support@swiftdownlod.online" className="hover:underline" style={{ color: 'var(--brand-700)' }}>support@swiftdownlod.online</a>
        </p>
      </div>
    </div>
  );
};

export default DMCA;

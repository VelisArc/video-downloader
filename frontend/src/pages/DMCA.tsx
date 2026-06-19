import React from 'react';
import { Helmet } from 'react-helmet-async';

const DMCA = () => {
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Helmet>
        <title>DMCA Policy - SwiftDL</title>
        <meta name="description" content="DMCA Copyright Policy for SwiftDL. Report copyright infringements." />
        <link rel="canonical" href="https://swiftdownlod.online/dmca" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="SwiftDL" />
        <meta property="og:url" content="https://swiftdownlod.online/dmca" />
        <meta property="og:title" content="DMCA Policy - SwiftDL" />
        <meta property="og:description" content="DMCA Copyright Policy for SwiftDL. Report copyright infringements." />
        <meta property="og:image" content="https://swiftdownlod.online/logo.png" />
      </Helmet>
      <h1 className="text-2xl font-bold mb-6 text-gray-900">DMCA / Copyright Policy</h1>
      <div className="text-gray-600 text-sm space-y-4">
        <p>
          SwiftDL respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998, the text of which may be found on the U.S. Copyright Office website at <a href="http://www.copyright.gov/legislation/dmca.pdf" className="text-pink-500 hover:underline">http://www.copyright.gov/legislation/dmca.pdf</a>, SwiftDL will respond expeditiously to claims of copyright infringement committed using the SwiftDL service and/or the SwiftDL website if such claims are reported to SwiftDL's Designated Copyright Agent identified below.
        </p>

        <p>
          If you are a copyright owner, authorized to act on behalf of one, or authorized to act under any exclusive right under copyright, please report alleged copyright infringements taking place on or through the Site by completing the following DMCA Notice of Alleged Infringement and delivering it to SwiftDL's Designated Copyright Agent.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2 text-gray-900">DMCA Notice of Alleged Infringement ("Notice")</h2>
        <ol className="list-decimal pl-5 space-y-2 text-xs text-gray-500">
          <li>Identify the copyrighted work that you claim has been infringed, or - if multiple copyrighted works are covered by this Notice - you may provide a representative list of the copyrighted works that you claim have been infringed.</li>
          <li>Identify the material or link you claim is infringing (or the subject of infringing activity) and to which access is to be disabled, including at a minimum, if applicable, the URL of the link shown on the Site or the exact location where such material may be found.</li>
          <li>Provide your company affiliation (if applicable), mailing address, telephone number, and, if available, email address.</li>
          <li>Include both of the following statements in the body of the Notice:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>"I hereby state that I have a good faith belief that the disputed use of the copyrighted material is not authorized by the copyright owner, its agent, or the law (e.g., as a fair use)."</li>
              <li>"I hereby state that the information in this Notice is accurate and, under penalty of perjury, that I am the owner, or authorized to act on behalf of, the owner, of the copyright or of an exclusive right under the copyright that is allegedly infringed."</li>
            </ul>
          </li>
          <li>Provide your full legal name and your electronic or physical signature.</li>
        </ol>

        <p className="mt-4">
          Deliver this Notice, with all items completed, to SwiftDL's Designated Copyright Agent:
        </p>
        <p className="font-medium text-gray-900">
          Email: <a href="mailto:support@swiftdownlod.online" className="text-pink-500 hover:underline">support@swiftdownlod.online</a>
        </p>
      </div>
    </div>
  );
};

export default DMCA;

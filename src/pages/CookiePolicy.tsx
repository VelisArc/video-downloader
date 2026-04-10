import React from 'react';
import { Helmet } from 'react-helmet-async';

const CookiePolicy: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-10 max-w-3xl">
            <Helmet>
                <title>Cookie Policy - SwiftDL</title>
                <meta name="description" content="Cookie Policy for SwiftDL. Learn how we use cookies." />
                <link rel="canonical" href="https://swiftdownlod.online/cookie-policy" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="SwiftDL" />
                <meta property="og:url" content="https://swiftdownlod.online/cookie-policy" />
                <meta property="og:title" content="Cookie Policy - SwiftDL" />
                <meta property="og:description" content="Cookie Policy for SwiftDL. Learn how we use cookies." />
                <meta property="og:image" content="https://swiftdownlod.online/logo.png" />
            </Helmet>

            <h1 className="text-2xl font-bold mb-6 text-gray-900">Cookie Policy</h1>
            <div className="text-gray-600 text-sm space-y-4">
                <p className="text-xs text-gray-400">Last updated: January 22, 2026</p>

                <h2 className="text-lg font-semibold mt-4 mb-2 text-gray-900">1. What Are Cookies</h2>
                <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.</p>

                <h2 className="text-lg font-semibold mt-4 mb-2 text-gray-900">2. How We Use Cookies</h2>
                <p>We use cookies for the following purposes:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-500">
                    <li><strong className="text-gray-700">Essential Cookies:</strong> These are necessary for the website to function properly.</li>
                    <li><strong className="text-gray-700">Analytics Cookies:</strong> We use Google Analytics to understand how visitors interact with our website.</li>
                    <li><strong className="text-gray-700">Advertising Cookies:</strong> We use Google AdSense to display personalized advertisements.</li>
                </ul>

                <h2 className="text-lg font-semibold mt-4 mb-2 text-gray-900">3. Managing Cookies</h2>
                <p>You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. If you do this, however, you may have to manually adjust some preferences every time you visit a site and some services and functionalities may not work.</p>

                <h2 className="text-lg font-semibold mt-4 mb-2 text-gray-900">4. Third-Party Cookies</h2>
                <p>In addition to our own cookies, we may also use various third-parties cookies to report usage statistics of the Service, deliver advertisements on and through the Service, and so on.</p>

                <h2 className="text-lg font-semibold mt-4 mb-2 text-gray-900">5. Changes to This Policy</h2>
                <p>We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page.</p>

                <h2 className="text-lg font-semibold mt-4 mb-2 text-gray-900">6. Contact Us</h2>
                <p>If you have any questions about this Cookie Policy, please contact us at <a href="mailto:support@swiftdownlod.online" className="text-pink-500 hover:underline">support@swiftdownlod.online</a>.</p>
            </div>
        </div>
    );
};

export default CookiePolicy;

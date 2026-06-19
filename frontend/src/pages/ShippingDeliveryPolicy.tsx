import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Truck, Globe, Clock, Download, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const ShippingDeliveryPolicy = () => {
    return (
        <div className="container mx-auto px-4 py-10 max-w-3xl">
            <Helmet>
                <title>Shipping & Delivery Policy - SwiftDL</title>
                <meta name="description" content="SwiftDL Shipping and Delivery Policy. Learn about our digital delivery service for supported video downloads." />
                <link rel="canonical" href="https://swiftdownlod.online/shipping-delivery" />
            </Helmet>

            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-50 rounded-xl mb-4">
                    <Download className="w-6 h-6 text-pink-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Shipping & Delivery Policy</h1>
                <p className="text-xs text-gray-400">Last updated: January 22, 2026</p>
            </div>

            {/* Digital Service Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
                <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-blue-800">Digital Service - No Physical Shipping</p>
                        <p className="text-xs text-blue-700 mt-1">
                            SwiftDL is a digital service. We do not ship any physical products. All video downloads are delivered digitally via your web browser.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-8 text-sm text-gray-600">

                {/* Section 1 */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Nature of Service</h2>
                    <p>
                        SwiftDL is a <strong>100% digital service</strong> that provides online video downloading across supported platforms. There are no physical products, packages, or shipments involved.
                    </p>
                </section>

                {/* Section 2 */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <Download className="w-4 h-4 text-pink-500" />
                        <h2 className="text-lg font-semibold text-gray-900">2. Digital Delivery</h2>
                    </div>
                    <p>All content is delivered digitally through:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-gray-500">
                        <li><strong>Instant Download:</strong> Videos are available for immediate download through your web browser</li>
                        <li><strong>No Download Links Sent:</strong> We do not email download links; all downloads happen directly on our website</li>
                        <li><strong>Direct Browser Download:</strong> Files are downloaded directly to your device's default download folder</li>
                    </ul>
                </section>

                {/* Section 3 */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-pink-500" />
                        <h2 className="text-lg font-semibold text-gray-900">3. Delivery Time</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="font-medium text-gray-900 text-sm mb-1">Processing Time</h3>
                            <p className="text-xs text-gray-500">Typically 5-30 seconds depending on video length and server load</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="font-medium text-gray-900 text-sm mb-1">Download Time</h3>
                            <p className="text-xs text-gray-500">Depends on your internet speed and file size</p>
                        </div>
                    </div>
                </section>

                {/* Section 4 */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <Globe className="w-4 h-4 text-pink-500" />
                        <h2 className="text-lg font-semibold text-gray-900">4. Service Availability</h2>
                    </div>
                    <p>SwiftDL is available worldwide. You can access our service from any country with an internet connection.</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-gray-500">
                        <li><strong>No Geographic Restrictions:</strong> Service available globally</li>
                        <li><strong>24/7 Availability:</strong> Service runs round the clock</li>
                        <li><strong>Device Compatibility:</strong> Works on all devices with a modern web browser</li>
                    </ul>
                </section>

                {/* Section 5 */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Delivery Issues</h2>
                    <p>If you experience issues with downloading:</p>
                    <ol className="list-decimal pl-5 mt-2 space-y-1 text-xs text-gray-500">
                        <li>Ensure the video URL is correct and from a public account</li>
                        <li>Check your internet connection</li>
                        <li>Try clearing your browser cache</li>
                        <li>Try using a different browser</li>
                        <li>Contact our support if issues persist</li>
                    </ol>
                </section>

                {/* Section 6 */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">6. No Shipping Charges</h2>
                    <p>
                        Since we do not ship any physical products, there are <strong>no shipping charges, handling fees, or delivery costs</strong> associated with our service.
                    </p>
                </section>

                {/* Section 7 */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">7. File Formats</h2>
                    <p>Downloaded content is delivered in standard formats:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-gray-500">
                        <li><strong>Video:</strong> MP4 format (compatible with all devices)</li>
                        <li><strong>Audio:</strong> MP3 format (when audio-only option is selected)</li>
                    </ul>
                </section>

                {/* Contact */}
                <section className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h2>
                    <p>
                        If you have any questions about our digital delivery or experience any issues:
                    </p>
                    <p className="mt-2">
                        Email: <a href="mailto:support@swiftdownlod.online" className="text-pink-500 hover:underline">support@swiftdownlod.online</a>
                    </p>
                </section>

                {/* Related */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Related Policies</h2>
                    <div className="flex flex-wrap gap-2">
                        <Link to="/refund-policy" className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs hover:border-pink-300 hover:text-pink-500 transition">
                            Refund Policy
                        </Link>
                        <Link to="/terms-of-service" className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs hover:border-pink-300 hover:text-pink-500 transition">
                            Terms of Service
                        </Link>
                        <Link to="/contact-us" className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs hover:border-pink-300 hover:text-pink-500 transition">
                            Contact Us
                        </Link>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default ShippingDeliveryPolicy;

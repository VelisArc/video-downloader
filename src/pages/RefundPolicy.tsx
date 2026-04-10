import React from 'react';
import { Helmet } from 'react-helmet-async';
import { RefreshCw, AlertCircle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const RefundPolicy = () => {
    return (
        <div className="container mx-auto px-4 py-10 max-w-3xl">
            <Helmet>
                <title>Refund & Cancellation Policy - SwiftDL</title>
                <meta name="description" content="SwiftDL Refund and Cancellation Policy. Learn how we handle plan cancellations, support issues, and payment-related concerns." />
                <link rel="canonical" href="https://swiftdownlod.online/refund-policy" />
            </Helmet>

            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-50 rounded-xl mb-4">
                    <RefreshCw className="w-6 h-6 text-pink-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Refund & Cancellation Policy</h1>
                <p className="text-xs text-gray-400">Last updated: January 22, 2026</p>
            </div>

            {/* Important Notice */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
                <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-green-800">SwiftDL includes free and premium access</p>
                        <p className="text-xs text-green-700 mt-1">
                            SwiftDL offers a free tier in many deployments, and some deployments also offer optional premium plans. Payment questions are handled here.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-8 text-sm text-gray-600">

                {/* Section 1 */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Service Overview</h2>
                    <p>
                        SwiftDL provides browser-based video downloading workflows across many supported platforms. Some deployments include optional premium plans for higher limits and cookie-vault features.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-gray-500">
                        <li>No subscription fees</li>
                        <li>No per-download charges</li>
                        <li>Optional premium plans may exist on some deployments</li>
                        <li>No hidden costs</li>
                    </ul>
                </section>

                {/* Section 2 */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">2. No Refund Applicable</h2>
                    <p>
                        Free usage does not create any refund obligation. If you purchased a premium plan and encounter a billing issue, duplicate charge, or accidental payment problem, contact support so the case can be reviewed.
                    </p>
                </section>

                {/* Section 3 */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Service Availability</h2>
                    <p>
                        We strive to keep SwiftDL available 24/7. However, we reserve the right to:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-gray-500">
                        <li>Perform maintenance without prior notice</li>
                        <li>Modify or discontinue features</li>
                        <li>Suspend access for policy violations</li>
                    </ul>
                    <p className="mt-2">
                        We do not guarantee uninterrupted uptime or compensate for downtime unless required by law or an explicit written offer.
                    </p>
                </section>

                {/* Section 4 */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Future Paid Services</h2>
                    <p>
                        If SwiftDL introduces any paid features or services in the future, this policy will be updated with detailed refund terms including:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-gray-500">
                        <li>Refund eligibility criteria</li>
                        <li>Timeframe for refund requests</li>
                        <li>Refund processing time</li>
                        <li>Cancellation procedures</li>
                    </ul>
                </section>

                {/* Section 5 */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Cancellation Policy</h2>
                    <p>
                        As SwiftDL does not require registration or subscription:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-gray-500">
                        <li><strong>No account to cancel:</strong> You can stop using our service at any time without any cancellation process</li>
                        <li><strong>No commitments:</strong> There are no contracts or binding agreements</li>
                        <li><strong>Optional account:</strong> If you create a login account, you can request deletion by contacting support</li>
                    </ul>
                </section>

                {/* Section 6 */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Disputes & Grievances</h2>
                    <p>
                        If you have any concerns or disputes related to our service, please contact our Grievance Officer:
                    </p>
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500">
                            <strong>Grievance Officer:</strong> SwiftDL Support Team<br />
                            <strong>Email:</strong> <a href="mailto:support@swiftdownlod.online" className="text-pink-500 hover:underline">support@swiftdownlod.online</a><br />
                            <strong>Response Time:</strong> Within 48 hours
                        </p>
                    </div>
                </section>

                {/* Contact */}
                <section className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact Us</h2>
                    <p>
                        For any questions about this Refund & Cancellation Policy, please contact us:
                    </p>
                    <p className="mt-2">
                        Email: <a href="mailto:support@swiftdownlod.online" className="text-pink-500 hover:underline">support@swiftdownlod.online</a>
                    </p>
                </section>

                {/* Related */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Related Policies</h2>
                    <div className="flex flex-wrap gap-2">
                        <Link to="/terms-of-service" className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs hover:border-pink-300 hover:text-pink-500 transition">
                            Terms of Service
                        </Link>
                        <Link to="/privacy-policy" className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs hover:border-pink-300 hover:text-pink-500 transition">
                            Privacy Policy
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

export default RefundPolicy;

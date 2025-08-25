// app/privacy/page.tsx (Next.js App Router)
// or pages/privacy.tsx (Next.js Pages Router)

export default function PrivacyPolicy() {
  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="mb-4 text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              1. Introduction
            </h2>
            <p>
              Sky-Realty ("we,"ours," or "us") respects your privacy and is
              committed to protecting your personal information. This Privacy
              Policy explains how we collect, use, and safeguard your data when
              you use our platform.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              2. Information We Collect
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Personal details (name, email, phone number) when signing up.
              </li>
              <li>Property and lease details uploaded by realtors.</li>
              <li>
                Tenant activity such as rent payments and maintenance requests.
              </li>
              <li>
                Payment information (handled securely via Stripe — we do not
                store your credit card details).
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              3. How We Use Your Information
            </h2>
            <p>
              We use your data to provide and improve our services, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Managing properties, tenants, and leases.</li>
              <li>Processing payments and subscriptions.</li>
              <li>Sending notifications and reminders.</li>
              <li>Improving platform security and performance.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              4. Data Security
            </h2>
            <p>
              We use industry-standard security practices. Authentication is
              handled through Supabase, and payments are processed by Stripe.
              While we take strong measures, no system is 100% secure.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              5. Sharing of Information
            </h2>
            <p>
              We do not sell your personal data. We may share information only
              with trusted third-party providers (e.g., Supabase, Stripe) to
              operate our services effectively.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              6. Your Rights
            </h2>
            <p>
              You have the right to access, update, or delete your information.
              Contact us if you'd like to exercise any of these rights.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              7. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy, please contact us
              at:{" "}
              <a
                href="mailto:support@skyrealtyae.com"
                className="text-[#302cfc] hover:underline"
              >
                support@skyrealtyae.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
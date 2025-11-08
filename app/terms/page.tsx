// app/terms/page.tsx (Next.js App Router)
// or pages/terms.tsx (Next.js Pages Router)

import Footer from "@/components/Footer";

export default function TermsAndConditions() {
  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Terms & Conditions</h1>
        <p className="mb-4 text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">1. Agreement</h2>
            <p>
              By accessing or using Sky-Realty, you agree to comply with these Terms & Conditions. 
              If you do not agree, please do not use our services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">2. Eligibility</h2>
            <p>
              You must be at least 18 years old and legally able to enter into contracts to use Sky-Realty. 
              By using the platform, you confirm that you meet these requirements.
            </p>
          </div>

          <div>
            <h2 className="text-2xl  font-semibold text-white mb-2">3. Use of Services</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You agree to use Sky-Realty for lawful purposes only.</li>
              <li>You may not misuse or attempt to disrupt the platform.</li>
              <li>Realtors are responsible for the accuracy of property and tenant information uploaded.</li>
              <li>Tenants must provide accurate details when submitting maintenance requests or rent payments.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl  font-semibold text-white mb-2">4. Subscriptions & Payments</h2>
            <p>
              Sky-Realty offers subscription plans (Basic, Pro, Premium) with property limits. 
              Payments are securely processed through Stripe. 
              By subscribing, you agree to recurring billing unless cancelled.
            </p>
          </div>

          <div>
            <h2 className="text-2xl  font-semibold text-white mb-2">5. Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms or 
              misuse the platform. You may also cancel your account at any time.
            </p>
          </div>

          <div>
            <h2 className="text-2xl  font-semibold text-white mb-2">6. Limitation of Liability</h2>
            <p>
              Sky-Realty is provided “as is” without warranties of any kind. 
              We are not liable for any indirect, incidental, or consequential damages 
              arising from the use of our services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl  font-semibold text-white mb-2">7. Changes to Terms</h2>
            <p>
              We may update these Terms & Conditions from time to time. 
              Continued use of the platform after changes means you accept the new terms.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">8. Contact Us</h2>
            <p>
              If you have any questions about these Terms & Conditions, please contact us at:{" "}
              <a
                href="mailto:support@sky-realtyae.com"
                className="text-[#302cfc] hover:underline"
              >
                support@sky-realty.com
              </a>
        
            </p>
          </div>
        </section>

        <section>
          <Footer />
        </section>
      </div>
    </div>
  );
}
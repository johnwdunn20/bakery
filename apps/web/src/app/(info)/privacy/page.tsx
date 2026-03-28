import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Bakery. Learn how we collect, use, and protect your personal information and recipe data.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | Bakery",
    description:
      "Privacy Policy for Bakery. Learn how we collect, use, and protect your personal information and recipe data.",
    url: "https://www.thebakery.app/privacy",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Privacy Policy",
  url: "https://www.thebakery.app/privacy",
  description:
    "Privacy Policy for Bakery. Learn how we collect, use, and protect your personal information and recipe data.",
  isPartOf: {
    "@type": "WebSite",
    name: "Bakery",
    url: "https://www.thebakery.app",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: March 28, 2026</p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you create an account, we collect your name, email address, and profile image
              through our authentication provider, Clerk. When you use Bakery, we store the recipes,
              iterations, notes, and other content you create. We also collect basic usage data such
              as which features you use and how often you visit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">We use your information to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>Provide and maintain the Service, including storing your recipes securely</li>
              <li>
                Display your shared recipes in the Community section when you choose to share them
              </li>
              <li>
                Enable features like baker&apos;s math calculations and ingredient substitutions
              </li>
              <li>Improve the Service based on usage patterns</li>
              <li>Communicate important updates about the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Data Storage and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your recipe data is stored on Convex, a secure cloud database platform. Authentication
              is handled by Clerk, an industry-standard identity provider. Both services employ
              encryption in transit and at rest. While we take reasonable measures to protect your
              data, no method of electronic storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Bakery integrates with the following third-party services that may collect data
              according to their own privacy policies:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>
                <strong>Clerk</strong> — authentication and user management
              </li>
              <li>
                <strong>Convex</strong> — database and backend infrastructure
              </li>
              <li>
                <strong>Vercel</strong> — hosting and content delivery
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We encourage you to review the privacy policies of these services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Cookies and Local Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              Bakery uses essential cookies for authentication and session management. We use local
              storage to remember your preferences such as theme settings (light/dark mode) and
              sidebar state. We do not use advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">You have the right to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>Access and view all personal data we store about you</li>
              <li>Export your recipes and data</li>
              <li>Delete your account and all associated data</li>
              <li>Withdraw consent for data processing at any time</li>
              <li>Control which recipes are shared publicly versus kept private</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your data for as long as your account is active. If you delete your account,
              we will remove your personal data and private recipes within 30 days. Recipes that
              were forked by other users before deletion will remain but will be attributed to
              &quot;Deleted User.&quot;
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Bakery is not intended for children under 13. We do not knowingly collect personal
              information from children under 13. If you believe we have collected such information,
              please contact us so we can promptly remove it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify users of material
              changes by posting the updated policy on this page and updating the &quot;Last
              updated&quot; date. We encourage you to review this page periodically.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}

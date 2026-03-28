import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Bakery, the professional-grade recipe management toolkit for home bakers. Read about our usage policies, intellectual property, and user responsibilities.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service | Bakery",
    description:
      "Terms of Service for Bakery, the professional-grade recipe management toolkit for home bakers.",
    url: "https://www.thebakery.app/terms",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Terms of Service",
  url: "https://www.thebakery.app/terms",
  description:
    "Terms of Service for Bakery, the professional-grade recipe management toolkit for home bakers.",
  isPartOf: {
    "@type": "WebSite",
    name: "Bakery",
    url: "https://www.thebakery.app",
  },
};

export default function TermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: March 28, 2026</p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Bakery (&quot;the Service&quot;), you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use the Service.
              Bakery is a recipe management platform designed for home bakers to store, organize,
              and refine their recipes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Bakery provides tools for storing and managing baking recipes, tracking recipe
              variations and iterations, calculating baker&apos;s percentages, finding ingredient
              substitutions, and sharing recipes with the community. We reserve the right to modify,
              suspend, or discontinue any part of the Service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              To use certain features of the Service, you must create an account. You are
              responsible for maintaining the confidentiality of your account credentials and for
              all activities that occur under your account. You agree to provide accurate and
              complete information when creating your account and to update it as necessary.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. User Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of the recipes, notes, and other content you create on Bakery
              (&quot;User Content&quot;). By sharing recipes publicly or with the community, you
              grant Bakery a non-exclusive, royalty-free license to display that content within the
              Service. You may remove your shared content at any time, which will revoke this
              license. You are solely responsible for ensuring your User Content does not infringe
              on the intellectual property rights of others.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">You agree not to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>
                Upload content that is harmful, offensive, or infringes on others&apos; rights
              </li>
              <li>
                Attempt to gain unauthorized access to the Service or other users&apos; accounts
              </li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>
                Scrape, crawl, or use automated means to access the Service without permission
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service, including its design, features, and code, is owned by Bakery and
              protected by intellectual property laws. The baker&apos;s math calculator,
              substitution search, and other tools are proprietary features of the Service. Nothing
              in these Terms grants you rights to the Bakery brand, logos, or other proprietary
              assets.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without
              warranties of any kind. We do not guarantee that ingredient substitution suggestions
              or baker&apos;s percentage calculations will produce specific baking results. Always
              use your own judgment when following recipes and substitution advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, Bakery shall not be liable for any indirect,
              incidental, special, or consequential damages arising from your use of the Service,
              including but not limited to loss of data, recipes, or baking results.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms from time to time. We will notify users of material changes
              by posting the updated terms on this page and updating the &quot;Last updated&quot;
              date. Continued use of the Service after changes constitutes acceptance of the revised
              terms.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}

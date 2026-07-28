export default function PrivacyPolicyPage(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-gradient text-4xl font-bold">Privacy Policy</h1>

      <p className="mt-4 text-faint">
        Last updated: July 17, 2026
      </p>

      <div className="mt-10 space-y-10">

        <section>
          <h2 className="border-l-2 border-brand pl-3 text-2xl font-semibold">Introduction</h2>

          <p className="mt-3 text-dim leading-7">
            Welcome to Code Battle (&quot;the Platform&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;).
            Your privacy is important to us. This Privacy Policy explains what
            information we collect, how we use it, and the choices you have
            regarding your information when using our platform.
          </p>
        </section>

        <section>
          <h2 className="border-l-2 border-brand pl-3 text-2xl font-semibold">
            Information We Collect
          </h2>

          <ul className="mt-3 list-disc space-y-2 pl-6 text-dim">
            <li>Name or username.</li>
            <li>Email address.</li>
            <li>Profile picture (when provided by an OAuth provider).</li>
            <li>Authentication provider information (Google, GitHub, 42, X, etc.).</li>
            <li>Your programming submissions and challenge history.</li>
            <li>Experience points (EXP), rankings, and achievements.</li>
            <li>IP address, browser type, and device information for security purposes.</li>
            <li>Session and authentication information.</li>
          </ul>
        </section>

        <section>
          <h2 className="border-l-2 border-brand pl-3 text-2xl font-semibold">
            Authentication
          </h2>

          <p className="mt-3 text-dim leading-7">
            You may authenticate using email and password or supported third-party
            providers such as Google, GitHub, 42, and X. When using an external
            provider, we only receive the information that you authorize the
            provider to share with us.
          </p>
        </section>

        <section>
          <h2 className="border-l-2 border-brand pl-3 text-2xl font-semibold">
            How We Use Your Information
          </h2>

          <ul className="mt-3 list-disc space-y-2 pl-6 text-dim">
            <li>Create and manage your account.</li>
            <li>Authenticate your identity.</li>
            <li>Match you with coding challenges.</li>
            <li>Calculate rankings and experience points.</li>
            <li>Detect abuse, cheating, and fraudulent activity.</li>
            <li>Improve the platform and user experience.</li>
            <li>Provide customer support.</li>
          </ul>
        </section>

        <section>
          <h2 className="border-l-2 border-brand pl-3 text-2xl font-semibold">
            Challenge Data
          </h2>

          <p className="mt-3 text-dim leading-7">
            Code submitted during challenges may be stored for evaluation,
            leaderboards, anti-cheat analysis, debugging, and future improvements
            of the platform.
          </p>
        </section>

        <section>
          <h2 className="border-l-2 border-brand pl-3 text-2xl font-semibold">
            Cookies & Sessions
          </h2>

          <p className="mt-3 text-dim leading-7">
            We use cookies and secure authentication sessions to keep you signed
            in, protect your account, and improve security. Some cookies are
            essential for the platform to function properly.
          </p>
        </section>

        <section>
          <h2 className="border-l-2 border-brand pl-3 text-2xl font-semibold">
            Data Sharing
          </h2>

          <p className="mt-3 text-dim leading-7">
            We do not sell your personal information. We may share limited data
            with trusted service providers required to operate the platform,
            including authentication providers, hosting providers, analytics, and
            infrastructure services.
          </p>
        </section>

        <section>
          <h2 className="border-l-2 border-brand pl-3 text-2xl font-semibold">
            Data Retention
          </h2>

          <p className="mt-3 text-dim leading-7">
            We retain your account information for as long as your account remains
            active or as required by applicable law. You may request deletion of
            your account at any time.
          </p>
        </section>

        <section>
          <h2 className="border-l-2 border-brand pl-3 text-2xl font-semibold">
            Security
          </h2>

          <p className="mt-3 text-dim leading-7">
            We take reasonable technical and organizational measures to protect
            your information against unauthorized access, alteration, disclosure,
            or destruction. However, no internet service can guarantee absolute
            security.
          </p>
        </section>

        <section>
          <h2 className="border-l-2 border-brand pl-3 text-2xl font-semibold">
            Your Rights
          </h2>

          <ul className="mt-3 list-disc space-y-2 pl-6 text-dim">
            <li>Access your personal information.</li>
            <li>Update your account information.</li>
            <li>Request deletion of your account.</li>
            <li>Request a copy of your stored data where applicable.</li>
          </ul>
        </section>

        <section>
          <h2 className="border-l-2 border-brand pl-3 text-2xl font-semibold">
            Children&quot;s Privacy
          </h2>

          <p className="mt-3 text-dim leading-7">
            The platform is not intended for children under the age required by
            applicable law in their jurisdiction. We do not knowingly collect
            personal information from children without appropriate consent.
          </p>
        </section>

        <section>
          <h2 className="border-l-2 border-brand pl-3 text-2xl font-semibold">
            Changes to This Policy
          </h2>

          <p className="mt-3 text-dim leading-7">
            We may update this Privacy Policy from time to time. Any changes will
            be posted on this page with an updated revision date.
          </p>
        </section>

        <section>
          <h2 className="border-l-2 border-brand pl-3 text-2xl font-semibold">
            Contact
          </h2>

          <p className="mt-3 text-dim leading-7">
            If you have questions about this Privacy Policy, please contact us
            through the contact information provided on the platform.
          </p>
        </section>

      </div>
    </main>
  )
}
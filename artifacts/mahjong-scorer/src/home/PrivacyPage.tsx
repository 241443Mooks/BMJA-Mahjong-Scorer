import { SiteHeader } from '../components/SiteHeader';

export function PrivacyPage() {
  return (
    <div className="mahjong-shell">
      <SiteHeader />
      <main className="mx-auto max-w-[860px] px-5 py-10 lg:px-8 lg:py-14">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="fine-rule w-10" />
            <span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">Privacy</span>
          </div>
          <h1 className="font-serif text-[clamp(38px,6vw,62px)] leading-none text-[#284d45]">
            Privacy & analytics.
          </h1>
          <p className="mt-4 max-w-[720px] text-[16px] leading-7 text-[#66746e]">
            Mahjong Reference is designed to collect as little information as practical while still learning which parts of the site are useful.
          </p>
        </div>

        <div className="space-y-6 text-[14px] leading-7 text-[#40544d]">
          <section className="rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 sm:p-6">
            <h2 className="font-serif text-[26px] text-[#284d45]">Analytics</h2>
            <p className="mt-3">
              The site uses PostHog Cloud EU for privacy-conscious web and product analytics. It helps answer questions such as which pages are visited, how people move between pages, and which supported rules profiles people choose.
            </p>
            <p className="mt-3">
              PostHog is configured in cookieless mode. Mahjong Reference does not ask PostHog to write analytics cookies, local storage or session storage. Person profiles and session replay are disabled, interaction autocapture is disabled, and the PostHog project is configured to discard client IP addresses.
            </p>
            <p className="mt-3">
              Analytics can still include technical context needed to understand aggregate use, such as the page path, referrer, browser or device information, and a privacy-preserving server-generated identifier. The site does not send player names, entered hand contents or free-text game data to PostHog.
            </p>
          </section>

          <section className="rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 sm:p-6">
            <h2 className="font-serif text-[26px] text-[#284d45]">Game recovery</h2>
            <p className="mt-3">
              The Table Companion can keep an in-progress game in your browser so a refresh does not lose the table. That browser-side recovery data is separate from analytics and is not used to identify you in PostHog.
            </p>
          </section>

          <section className="rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 sm:p-6">
            <h2 className="font-serif text-[26px] text-[#284d45]">Further information</h2>
            <p className="mt-3">
              PostHog publishes information about its privacy controls and EU hosting at{' '}
              <a className="font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4" href="https://posthog.com/docs/product-analytics/privacy" target="_blank" rel="noreferrer">
                posthog.com/docs/product-analytics/privacy
              </a>.
            </p>
            <p className="mt-3">
              The analytics configuration and measurement plan are also documented in the public Mahjong Reference source repository so the implementation can be inspected.
            </p>
            <p className="mt-4 text-[12px] text-[#7a7769]">Last updated 17 September 2026.</p>
          </section>
        </div>
      </main>
    </div>
  );
}

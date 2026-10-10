import type { Advisor, Screen } from "../data"

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button
      className="logo"
      onClick={
        onClick || (() => window.scrollTo({ top: 0, behavior: "smooth" }))
      }
      aria-label="Co-Connect home"
    >
      <span className="logo-mark">
        <i />
        <i />
      </span>
      <span>Co-Connect</span>
    </button>
  )
}

export function Icon({
  name,
}: {
  name: "arrow" | "heart" | "compare" | "check" | "back" | "spark"
}) {
  const paths = {
    arrow: (
      <>
        <path d="M5 12h13M14 7l5 5-5 5" />
      </>
    ),

    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5a5.5 5.5 0 0 0 1-8.9Z" />
    ),

    compare: (
      <>
        <rect x="4" y="5" width="6" height="14" rx="1" />
        <rect x="14" y="5" width="6" height="14" rx="1" />
      </>
    ),

    check: <path d="m5 12 4 4L19 6" />,

    back: (
      <>
        <path d="M19 12H5M10 17l-5-5 5-5" />
      </>
    ),

    spark: (
      <>
        <path d="m12 3 1.2 4.3L17 9l-3.8 1.7L12 15l-1.2-4.3L7 9l3.8-1.7L12 3Z" />
        <path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" />
      </>
    ),
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  )
}

export function Header({
  screen,

  navigate,
}: {
  screen: Screen

  navigate: (s: Screen) => void
}) {
  return (
    <header className="global-header">
      <div className="utility-nav">
        <span>Personal</span>
        <button onClick={() => navigate("support")}>Support info</button>
        <button onClick={() => navigate("accessibility")}>Accessibility</button>
        <button className="account-button" onClick={() => navigate("finances")}>
          <span className="account-dot">D</span> Demo profile
        </button>
      </div>
      <div className="nav-wrap">
        <Logo onClick={() => navigate("dashboard")} />
        <nav className="global-nav" aria-label="Primary navigation">
          {[
            ["dashboard", "Home"],

            ["finances", "My Finances"],

            ["products", "Products & Services"],

            ["advice", "Advice"],

            ["home", "Co-Connect"],

            ["referrals", "Referrals"],

            ["future", "Future You"],

            ["support", "Support"],
          ].map(([destination, label]) => (
            <button
              key={destination}
              className={
                screen === destination ||
                (destination === "home" &&
                  [
                    "quiz",

                    "loading",

                    "results",

                    "profile",

                    "compare",

                    "referral",

                    "success",
                  ].includes(screen))
                  ? "active"
                  : ""
              }
              aria-current={screen === destination ? "page" : undefined}
              onClick={() => navigate(destination as Screen)}
            >
              {label}
            </button>
          ))}
        </nav>
        <button
          className="mobile-account"
          aria-label="Open demo finance overview"
          onClick={() => navigate("finances")}
        >
          D
        </button>
      </div>
      <div className="service-strip">
        <span>Guidance for every stage</span>
        <button onClick={() => navigate("home")}>Find with Co-Connect</button>
        <button onClick={() => navigate("future")}>Explore your goals</button>
        <button onClick={() => navigate("referrals")}>Refer someone</button>
      </div>
    </header>
  )
}

export function Footer({ navigate }: { navigate: (screen: Screen) => void }) {
  return (
    <footer>
      <div>
        <Logo onClick={() => navigate("dashboard")} />
        <p>Advice, products, and guidance for the life you’re building.</p>
      </div>
      <div>
        <strong>Your planning</strong>
        <button onClick={() => navigate("finances")}>My Finances</button>
        <button onClick={() => navigate("future")}>Future You goals</button>
        <button onClick={() => navigate("advice")}>Co-Connect advice</button>
        <button onClick={() => navigate("home")}>Co-Connect</button>
      </div>
      <div>
        <strong>Connect</strong>
        <button onClick={() => navigate("referrals")}>Referrals</button>
        <button onClick={() => navigate("accessibility")}>Accessibility</button>
        <button onClick={() => navigate("privacy")}>Privacy</button>
        <button onClick={() => navigate("support")}>Support info</button>
      </div>
      <p className="fine-print">
        Co-Connect is a fictional front-end experience. Advisor and referral
        details are fictional; no financial services are provided.
      </p>
    </footer>
  )
}

export function Avatar({
  advisor,

  large = false,
}: {
  advisor: Advisor

  large?: boolean
}) {
  return (
    <div
      className={`avatar ${large ? "avatar-large" : ""}`}
      style={{ background: advisor.color }}
    >
      {advisor.image ? (
        <img
          src={advisor.image}
          alt={`Portrait of ${advisor.name}`}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span>
          {advisor.name

            .split(" ")

            .map((n) => n[0])

            .join("")}
        </span>
      )}
    </div>
  )
}

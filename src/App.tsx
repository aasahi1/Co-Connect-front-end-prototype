import { useEffect, useMemo, useRef, useState } from "react"

import {
  advisors,
  answerSummary,
  futureGoals,
  formats,
  priorities,
  situations,
  styles,
  frequencies,
  type Advisor,
  type Answers,
  type ReferralRecord,
  type Screen,
} from "./data"

import { Avatar, Footer, Header, Icon } from "./components/chrome"

import { getMatches, type Match } from "./matching"

type PersistedState = {
  quizStep: number

  answers: Answers

  saved: number[]

  compare: number[]

  selectedAdvisorId: number

  selectedGoalTitle: string

  savedGoals: string[]

  referralRecords: ReferralRecord[]

  introductionAdvisorIds: number[]
}

const storageKey = "co-connect-prototype-v1"

function readPersistedState(): Partial<PersistedState> {
  try {
    const value = localStorage.getItem(storageKey)

    return value ? JSON.parse(value) as Partial<PersistedState> : {}
  } catch {
    return {}
  }
}

function screenFromHash(): Screen | null {
  const route = window.location.hash.replace(/^#\/?/, "") as Screen

  const screens: Screen[] = [
    "dashboard",

    "home",

    "future",

    "goal",

    "referrals",

    "advice",

    "finances",

    "products",

    "support",

    "privacy",

    "accessibility",

    "quiz",

    "loading",

    "results",

    "profile",

    "compare",

    "referral",

    "success",
  ]

  return screens.includes(route) ? route : null
}

function App() {
  const [persisted] = useState(readPersistedState)

  const [screen, setScreen] = useState<Screen>(
    () => screenFromHash() || "dashboard",
  )

  const [step, setStep] = useState(persisted.quizStep || 0)

  const [answers, setAnswers] = useState<Answers>(
    persisted.answers || {
      situation: "",

      priorities: [],

      style: "",

      format: "",

      frequency: "",
    },
  )

  const [error, setError] = useState("")

  const [selected, setSelected] = useState<Advisor>(
    advisors.find((advisor) => advisor.id === persisted.selectedAdvisorId) ||
      advisors[0],
  )

  const [saved, setSaved] = useState<number[]>(persisted.saved || [])

  const [compare, setCompare] = useState<number[]>(persisted.compare || [])

  const [expanded, setExpanded] = useState<number | null>(null)

  const [compareNotice, setCompareNotice] = useState("")

  const [selectedGoal, setSelectedGoal] = useState(
    futureGoals.find((goal) => goal.title === persisted.selectedGoalTitle) ||
      futureGoals[0],
  )

  const [savedGoals, setSavedGoals] = useState<string[]>(
    persisted.savedGoals || [],
  )

  const [introductionAdvisorIds, setIntroductionAdvisorIds] =
    useState<number[]>(persisted.introductionAdvisorIds || [])

  const [referralRecords, setReferralRecords] = useState<ReferralRecord[]>(
    persisted.referralRecords || [],
  )

  const mainRef = useRef<HTMLElement>(null)

  const loadingTimer = useRef<number | null>(null)

  useEffect(() => {
    const titles: Partial<Record<Screen, string>> = {
      dashboard: "Home",

      home: "Co-Connect",

      future: "Future You",

      goal: selectedGoal.title,

      referrals: "Co-Connect Referrals",

      advice: "Co-Connect Advice",

      privacy: "Privacy | Co-Connect",

      accessibility: "Accessibility | Co-Connect",

      quiz: "Find your Co-Connect match",

      results: "Your Co-Connect matches",

      profile: selected.name,

      compare: "Compare Co-Connect advisors",

      referral: `Introduction to ${selected.name}`,

      success: "Demo request saved",
    }

    document.title = `${titles[screen] || "Co-Connect"} | Co-Connect`

    mainRef.current?.focus({ preventScroll: true })
  }, [screen, selected, selectedGoal])

  useEffect(() => {
    const onPopState = () => {
      if (loadingTimer.current !== null) {
        window.clearTimeout(loadingTimer.current)

        loadingTimer.current = null
      }

      const route = screenFromHash()

      if (route) setScreen(route)
    }

    window.addEventListener("popstate", onPopState)

    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  useEffect(() => {
    const value: PersistedState = {
      quizStep: step,

      answers,

      saved,

      compare,

      selectedAdvisorId: selected.id,

      selectedGoalTitle: selectedGoal.title,

      savedGoals,

      referralRecords,

      introductionAdvisorIds,
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(value))
    } catch {
      // The app remains usable when browser storage is unavailable or full.
    }
  }, [
    step,

    answers,

    saved,

    compare,

    selected,

    selectedGoal,

    savedGoals,

    referralRecords,

    introductionAdvisorIds,
  ])

  const matches = useMemo(() => getMatches(answers), [answers])

  const navigate = (next: Screen) => {
    if (loadingTimer.current !== null) {
      window.clearTimeout(loadingTimer.current)

      loadingTimer.current = null
    }

    if (window.location.hash !== `#/${next}`) {
      window.history.pushState({}, "", `#/${next}`)
    }

    setScreen(next)

    setError("")

    window.scrollTo({ top: 0, behavior: "auto" })
  }

  const clearDemoData = () => {
    try {
      localStorage.removeItem(storageKey)
    } catch {
      // Reset the in-memory demo even when browser storage is unavailable.
    }

    setStep(0)

    setAnswers({
      situation: "",

      priorities: [],

      style: "",

      format: "",

      frequency: "",
    })

    setSaved([])

    setCompare([])

    setExpanded(null)

    setSelected(advisors[0])

    setSelectedGoal(futureGoals[0])

    setSavedGoals([])

    setReferralRecords([])

    setIntroductionAdvisorIds([])

    navigate("dashboard")
  }

  const toggleSaved = (id: number) =>
    setSaved((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    )

  const toggleCompare = (id: number) => {
    setError("")

    setCompare((current) => {
      if (current.includes(id)) {
        setCompareNotice("")

        return current.filter((x) => x !== id)
      }

      if (current.length >= 3) {
        setCompareNotice(
          "You can compare up to three advisors. Remove one to add another.",
        )

        return current
      }

      setCompareNotice("")

      return [...current, id]
    })
  }

  const continueQuiz = () => {
    const valid =
      step === 0
        ? answers.situation
        : step === 1
          ? answers.priorities.length
          : true

    if (!valid) {
      setError("Choose an option to continue.")

      return
    }

    setError("")

    if (step < 4) setStep(step + 1)
    else {
      setScreen("loading")

      loadingTimer.current = window.setTimeout(() => navigate("results"), 650)
    }
  }

  const openProfile = (advisor: Advisor) => {
    setSelected(advisor)

    navigate("profile")
  }

  const exploreGoal = (goal: typeof futureGoals[number]) => {
    setSelectedGoal(goal)

    navigate("goal")
  }

  const matchFromGoal = () => {
    const situationMap: Record<string, string> = {
      "Saving for school": "Starting a family",

      "Building an emergency fund": "Building savings",

      "Starting a business": "Starting a new job",

      "Paying down debt": "Managing debt",

      "Unsure where to start": "I'm not sure yet",
    }

    setAnswers((current) => ({
      ...current,

      situation: situationMap[selectedGoal.title] || selectedGoal.title,

      priorities: current.priorities.includes(selectedGoal.priority)
        ? current.priorities
        : [selectedGoal.priority],
    }))

    setStep(1)

    navigate("quiz")
  }

  return (
    <div className="app">
      <Header screen={screen} navigate={navigate} />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <main id="main-content" ref={mainRef} tabIndex={-1}>
        {screen === "dashboard" && (
          <Dashboard
            saved={saved}
            savedGoals={savedGoals}
            requestedAdvisorIds={introductionAdvisorIds}
            referrals={referralRecords}
            hasReturningState={Boolean(
              saved.length || savedGoals.length || referralRecords.length ||
              introductionAdvisorIds.length || answers.situation ||
              answers.priorities.length
            )}
            navigate={navigate}
            openProfile={openProfile}
            exploreGoal={exploreGoal}
          />
        )}
        {screen === "home" && <Landing navigate={navigate} />}
        {screen === "future" && (
          <FutureYou
            goals={futureGoals}
            savedGoals={savedGoals}
            navigate={navigate}
            explore={exploreGoal}
            toggleGoal={(title) =>
              setSavedGoals((current) =>
                current.includes(title)
                  ? current.filter((item) => item !== title)
                  : [...current, title],
              )
            }
          />
        )}
        {screen === "goal" && (
          <GoalDetail
            goal={selectedGoal}
            saved={savedGoals.includes(selectedGoal.title)}
            back={() => navigate("future")}
            toggle={() =>
              setSavedGoals((current) =>
                current.includes(selectedGoal.title)
                  ? current.filter((item) => item !== selectedGoal.title)
                  : [...current, selectedGoal.title],
              )
            }
            findAdvisor={matchFromGoal}
            advice={() => navigate("advice")}
          />
        )}
        {screen === "referrals" && (
          <ReferralsHub
            records={referralRecords}
            introductionAdvisorIds={introductionAdvisorIds}
            setRecords={setReferralRecords}
            navigate={navigate}
            defaultAdvisor={selected.name}
          />
        )}
        {screen === "advice" && (
          <AdviceHub exploreGoal={exploreGoal} navigate={navigate} />
        )}
        {(screen === "finances" ||
          screen === "products" ||
          screen === "support" ||
          screen === "privacy" ||
          screen === "accessibility") && (
          <PlatformSection
            screen={screen}
            navigate={navigate}
            onClearDemoData={clearDemoData}
          />
        )}
        {screen === "quiz" && (
          <Quiz
            step={step}
            answers={answers}
            error={error}
            setAnswers={setAnswers}
            back={() => (step ? setStep(step - 1) : navigate("home"))}
            next={continueQuiz}
            editStep={setStep}
          />
        )}
        {screen === "loading" && <Loading />}
        {screen === "results" && (
          <Results
            matches={matches}
            answers={answers}
            saved={saved}
            compare={compare}
            expanded={expanded}
            setExpanded={setExpanded}
            toggleSaved={toggleSaved}
            toggleCompare={toggleCompare}
            openProfile={openProfile}
            edit={() => {
              setStep(0)

              navigate("quiz")
            }}
            goCompare={() => navigate("compare")}
            compareNotice={compareNotice}
          />
        )}
        {screen === "profile" && (
          <Profile
            advisor={selected}
            reasons={
              matches.find((m) => m.advisor.id === selected.id)?.reasons || []
            }
            considerations={
              matches.find((m) => m.advisor.id === selected.id)
                ?.considerations || []
            }
            answers={answers}
            saved={saved.includes(selected.id)}
            comparing={compare.includes(selected.id)}
            back={() => navigate("results")}
            toggleSaved={() => toggleSaved(selected.id)}
            toggleCompare={() => toggleCompare(selected.id)}
            refer={() => navigate("referral")}
            referSomeone={() => navigate("referrals")}
            futureYou={() => navigate("future")}
          />
        )}
        {screen === "compare" && (
          <Compare
            ids={compare}
            matches={matches}
            remove={toggleCompare}
            open={openProfile}
            browse={() => navigate("results")}
            choose={(advisor) => {
              setSelected(advisor)

              navigate("referral")
            }}
          />
        )}
        {screen === "referral" && (
          <Referral
            advisor={selected}
            answers={answers}
            back={() => navigate("profile")}
            submit={() => {
              setIntroductionAdvisorIds((current) =>
                current.includes(selected.id)
                  ? current
                  : [...current, selected.id],
              )

              navigate("success")
            }}
          />
        )}
        {screen === "success" && (
          <Success advisor={selected} done={() => navigate("results")} />
        )}
      </main>
      {screen !== "quiz" && screen !== "loading" && (
        <Footer navigate={navigate} />
      )}
    </div>
  )
}

function Breadcrumbs({
  items,

  navigate,
}: {
  items: Array<{ label: string; screen?: Screen }>

  navigate?: (screen: Screen) => void
}) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={item.label}>
          {index > 0 && <i>/</i>}
          {item.screen && navigate ? (
            <button onClick={() => navigate(item.screen!)}>{item.label}</button>
          ) : (
            <strong aria-current="page">{item.label}</strong>
          )}
        </span>
      ))}
    </nav>
  )
}

function Dashboard({
  saved,

  savedGoals,

  requestedAdvisorIds,

  referrals,

  hasReturningState,

  navigate,

  openProfile,

  exploreGoal,
}: {
  saved: number[]

  savedGoals: string[]

  requestedAdvisorIds: number[]

  referrals: ReferralRecord[]

  hasReturningState: boolean

  navigate: (screen: Screen) => void

  openProfile: (advisor: Advisor) => void

  exploreGoal: (goal: typeof futureGoals[number]) => void
}) {
  const revisitingAdvisors = advisors.filter(
    (advisor) =>
      saved.includes(advisor.id) || requestedAdvisorIds.includes(advisor.id),
  )

  return (
    <div className="platform-page dashboard">
      <section className="welcome-band">
        <div>
          <span className="eyebrow">Your Co-Connect financial home</span>
          <h1>{hasReturningState ? "Welcome back" : "Your financial home"}</h1>
          <p>
            {hasReturningState
              ? "Pick up where you left off. Your saved goals and sample matches are here."
              : "Keep your goals, guidance, and trusted connections moving in one place."}
          </p>
        </div>
        <button className="primary" onClick={() => navigate("future")}>
          Continue planning <Icon name="arrow" />
        </button>
      </section>
      <section className="journey-strip">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Your financial journey</span>
            <h2>Where are you headed?</h2>
          </div>
          <button onClick={() => navigate("future")}>View all goals</button>
        </div>
        {savedGoals.length ? (
          <div className="journey-line">
            {savedGoals.slice(0, 4).map((title, index) => (
              <button
                key={title}
                onClick={() => {
                  const goal = futureGoals.find((item) => item.title === title)
                  if (goal) exploreGoal(goal)
                }}
              >
                <span>{index + 1}</span>
                <strong>{title}</strong>
                <small>Saved goal</small>
              </button>
            ))}
          </div>
        ) : (
          <p className="empty-referrals">
            Your journey will take shape as you explore and save goals.
          </p>
        )}
      </section>
      <section className="returning-grid">
        <article>
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Your goals</span>
              <h2>Life you’re planning for</h2>
            </div>
            <button onClick={() => navigate("future")}>Explore</button>
          </div>
          <div className="returning-list">
            {savedGoals.length ? savedGoals.slice(0, 3).map((goal) => (
                <button key={goal} onClick={() => {
                  const item = futureGoals.find((entry) => entry.title === goal)
                  if (item) exploreGoal(item)
                }}>
                  <span className="list-symbol">{goal[0]}</span>
                  <span>
                    <strong>{goal}</strong>
            <small>Saved in this browser</small>
                  </span>
                  <i aria-hidden="true">?</i>
                </button>
              )) : <p className="empty-referrals">
                No goals saved yet. Explore goals to add one here.
              </p>}
          </div>
        </article>
        <article>
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Your advisors</span>
              <h2>People worth revisiting</h2>
            </div>
            <button onClick={() => navigate("results")}>View matches</button>
          </div>
          <div className="returning-list">
            {revisitingAdvisors.length ? (
              revisitingAdvisors.slice(0, 3).map((advisor) => (
                <button key={advisor.id} onClick={() => openProfile(advisor)}>
                  <Avatar advisor={advisor} />
                  <span>
                    <strong>{advisor.name}</strong>
                    <small>
                      {requestedAdvisorIds.includes(advisor.id)
                        ? "Demo request saved"
                        : "Saved"}
                    </small>
                  </span>
                  <i aria-hidden="true">?</i>
                </button>
              ))
            ) : (
              <p className="empty-referrals">
                No advisors saved yet. Explore sample matches to find one to
                revisit.
              </p>
            )}
          </div>
        </article>
        <article>
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Your referrals</span>
              <h2>Introductions you’ve shared</h2>
            </div>
            <button onClick={() => navigate("referrals")}>Manage</button>
          </div>
          <div className="returning-list">
            {referrals.length ? referrals.slice(0, 2).map((record) => (
                <button key={record.name} onClick={() => navigate("referrals")}>
                  <span className="list-symbol">
                    {record.name

                      .split(" ")

                      .map((part) => part[0])

                      .join("")}
                  </span>
                  <span>
                    <strong>{record.name}</strong>
                    <small>{record.status}</small>
                  </span>
                  <i>→</i>
                </button>
              )) : <p className="empty-referrals">
                No demo referrals saved yet.
              </p>}
          </div>
        </article>
      </section>
      <section className="next-step">
        <div>
          <span className="eyebrow">Recommended next step</span>
          <h2>{hasReturningState ? "Choose a useful next step." : "Start with what matters to you."}</h2>
          <p>
            {hasReturningState
              ? "Continue with your goals, revisit an advisor, or update your preferences."
              : "Explore a goal or answer a few questions to see sample recommendations."}
          </p>
        </div>
        <button className="primary" onClick={() => navigate(hasReturningState && saved.length ? "results" : "quiz")}>
          {hasReturningState && saved.length ? "Return to matches" : "Find sample advisors"} <Icon name="arrow" />
        </button>
      </section>
    </div>
  )
}

function FutureYou({
  goals,

  savedGoals,

  navigate,

  explore,

  toggleGoal,
}: {
  goals: typeof futureGoals

  savedGoals: string[]

  navigate: (screen: Screen) => void

  explore: (goal: typeof futureGoals[number]) => void

  toggleGoal: (title: string) => void
}) {
  return (
    <div className="platform-page">
      <Breadcrumbs
        items={[
          { label: "Home", screen: "dashboard" },

          { label: "Future You" },
        ]}
        navigate={navigate}
      />
      <section className="platform-intro">
        <span className="eyebrow">Future You</span>
        <h1>Plan for the life you’re building.</h1>
        <p>
          Explore a goal, understand what to prepare, and connect with guidance
          when you’re ready. You don’t need to have everything figured out.
        </p>
      </section>
      <section className="future-editorial">
        <img
          src={`${import.meta.env.BASE_URL}assets/future-you.jpg`}
          alt="A couple talking together at home"
          loading="lazy"
          decoding="async"
        />
        <div>
          <span className="eyebrow">Life first, finances second</span>
          <h2>Your goals give financial guidance a purpose.</h2>
          <p>
            Future You turns the life you’re imagining into useful questions,
            practical preparation, and a direct path into Co-Connect when
            personal advice would help.
          </p>
        </div>
      </section>
      <section className="saved-goals-summary">
        <div>
          <strong>{savedGoals.length} goals saved</strong>
          <span>Your goals help shape future advice and advisor matches.</span>
        </div>
        <span>Saved in this browser</span>
      </section>
      <div className="goal-grid">
        {goals.map((goal, index) => (
          <article key={goal.title}>
            <span className="goal-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <button
              className={`goal-save ${
                savedGoals.includes(goal.title) ? "active" : ""
              }`}
              onClick={() => toggleGoal(goal.title)}
            >
              <Icon name="heart" />{" "}
              {savedGoals.includes(goal.title) ? "Saved" : "Save"}
            </button>
            <h2>{goal.title}</h2>
            <p>{goal.description}</p>
            <button className="goal-link" onClick={() => explore(goal)}>
              Explore this goal <Icon name="arrow" />
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}

function GoalDetail({
  goal,

  saved,

  back,

  toggle,

  findAdvisor,

  advice,
}: {
  goal: typeof futureGoals[number]

  saved: boolean

  back: () => void

  toggle: () => void

  findAdvisor: () => void

  advice: () => void
}) {
  const preparations =
    goal.title === "Buying a home"
      ? [
          "Understand your down payment and closing costs",

          "Review monthly cash flow before choosing a mortgage",

          "Plan for repairs, insurance, and ongoing ownership costs",
        ]
      : [
          "Clarify what this goal means for your timeline",

          "Understand the costs and trade-offs involved",

          "Choose a first step that fits your current finances",
        ]

  return (
    <div className="platform-page goal-detail">
      <button className="back-link" onClick={back}>
        <Icon name="back" /> All Future You goals
      </button>
      <section className="goal-hero">
        <div>
          <span className="eyebrow">Future You goal</span>
          <h1>{goal.title}</h1>
          <p>
            {goal.description} Explore the decisions ahead without pressure to
            act all at once.
          </p>
          <div className="button-row">
            <button className="primary" onClick={findAdvisor}>
              Find a specialist <Icon name="arrow" />
            </button>
            <button className="secondary" onClick={toggle}>
              <Icon name="heart" />
              {saved ? "Goal saved" : "Save this goal"}
            </button>
          </div>
        </div>
        <div className="goal-visual">
          <img
            src={`${import.meta.env.BASE_URL}assets/co-connect-home.jpg`}
            alt="A couple planning together in their kitchen"
            loading="lazy"
            decoding="async"
          />
          <div className="goal-path">
            <span>Explore your options</span>
            <i>→</i>
            <span>See what to prepare</span>
            <i>→</i>
            <span>Find Co-Connect guidance</span>
          </div>
        </div>
      </section>
      <section className="goal-content">
        <div>
          <span className="eyebrow">Prepare with confidence</span>
          <h2>What to think about now</h2>
          <ul>
            {preparations.map((item) => (
              <li key={item}>
                <Icon name="check" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <aside>
          <h2>How guidance can help</h2>
          <p>
            An advisor can help connect this goal with the rest of your
            finances, explain trade-offs, and build a plan at your pace.
          </p>
          <button onClick={advice}>Explore related advice</button>
        </aside>
      </section>
      <section className="goal-advisor-cta">
        <div>
          <span className="eyebrow">Co-Connect</span>
          <h2>
            Find a Co-Connect advisor who understands {goal.title.toLowerCase()}
            .
          </h2>
          <p>
            We’ll carry this goal into your matching questionnaire, so you won’t
            need to start over.
          </p>
        </div>
        <button className="primary" onClick={findAdvisor}>
          Start with this goal <Icon name="arrow" />
        </button>
      </section>
    </div>
  )
}

function ReferralsHub({
  records,

  introductionAdvisorIds,

  setRecords,

  navigate,

  defaultAdvisor,
}: {
  records: ReferralRecord[]

  introductionAdvisorIds: number[]

  setRecords: (updater: (records: ReferralRecord[]) => ReferralRecord[]) => void

  navigate: (screen: Screen) => void

  defaultAdvisor: string
}) {
  const [copyFeedback, setCopyFeedback] = useState("")

  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    name: "",

    email: "",

    advisor: defaultAdvisor,
  })

  const [error, setError] = useState("")

  const submit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      setError(
        "Enter a sample name and valid email to save this demo referral.",
      )

      return
    }

    setRecords((current) => [
      {
        name: form.name,

        advisor: form.advisor,

        status: "Saved on this device (demo)",

        date: "Today",
      },

      ...current,
    ])

    setForm({ name: "", email: "", advisor: defaultAdvisor })

    setError("")

    setShowForm(false)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${window.location.pathname}#/home`,
      )
    } catch {
      setCopyFeedback(
        "Clipboard access is unavailable. You can still open the demo from the main navigation.",
      )

      return
    }

    setCopyFeedback("Demo link copied.")

    window.setTimeout(() => setCopyFeedback(""), 2600)
  }

  return (
    <div className="platform-page referrals-hub">
      <Breadcrumbs
        items={[{ label: "Home", screen: "dashboard" }, { label: "Referrals" }]}
        navigate={navigate}
      />
      <section className="referrals-hero">
        <div>
          <span className="eyebrow">Co-Connect referrals</span>
          <h1>Share a thoughtful introduction.</h1>
          <p>
            Share a demo link or save a sample referral. This prototype does not
            send invitations or contact anyone.
          </p>
          <div className="button-row">
            <button className="primary" onClick={() => setShowForm(true)}>
              Add a demo referral <Icon name="arrow" />
            </button>
            <button className="secondary" onClick={copyLink}>
              Copy demo link
            </button>
          </div>
          {copyFeedback && (
            <p className="form-note" role="status">
              {copyFeedback}
            </p>
          )}
        </div>
        <img
          src={`${import.meta.env.BASE_URL}assets/referrals.jpg`}
          alt="Friends talking together around a table"
          loading="lazy"
          decoding="async"
        />
      </section>
      {showForm && (
        <form className="refer-form" onSubmit={submit} noValidate>
          <div>
            <span className="eyebrow">New referral</span>
            <h2>Who would you like to help?</h2>
            <p>
              This sample stays in this browser. No email is sent. Use sample
              details rather than real contact information.
            </p>
          </div>
          <label>
            Sample friend name
            <input
              value={form.name}
              autoComplete="off"
              required
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
          </label>
          <label>
            Sample email
            <input
              type="email"
              autoComplete="off"
              required
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />
          </label>
          <label>
            Suggested advisor
            <select
              value={form.advisor}
              onChange={(event) =>
                setForm({ ...form, advisor: event.target.value })
              }
            >
              {advisors.slice(0, 4).map((advisor) => (
                <option key={advisor.id}>{advisor.name}</option>
              ))}
            </select>
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="form-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button className="primary" type="submit">
              Save demo referral
            </button>
          </div>
        </form>
      )}
      <section className="referral-status-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Your referrals</span>
            <h2>Introductions you’ve shared</h2>
          </div>
          <span>{records.length} total</span>
        </div>
        <div
          className="referral-table"
          role="table"
          aria-label="Demo referrals saved in this browser"
        >
          <div className="referral-row header" role="row">
            <span role="columnheader">Person</span>
            <span role="columnheader">Suggested advisor</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Updated</span>
          </div>
          {!records.length ? (
            <p className="empty-referrals">
              No referrals saved in this browser yet.
            </p>
          ) : (
            records.map((record) => (
              <div
                className="referral-row"
                role="row"
                key={`${record.name}-${record.date}`}
              >
                <strong
                  role="cell"
                  data-label="Person"
                  aria-label={`Person: ${record.name}`}
                >
                  {record.name}
                </strong>
                <span
                  role="cell"
                  data-label="Suggested advisor"
                  aria-label={`Suggested advisor: ${record.advisor}`}
                >
                  {record.advisor}
                </span>
                <span
                  role="cell"
                  data-label="Status"
                  aria-label={`Status: ${record.status}`}
                  className="status-pill"
                >
                  {record.status}
                </span>
                <span
                  role="cell"
                  data-label="Updated"
                  aria-label={`Updated: ${record.date}`}
                >
                  {record.date}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
      {introductionAdvisorIds.length > 0 && (
        <section className="referral-status-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Co-Connect</span>
              <h2>Advisor introduction requests</h2>
            </div>
            <span>{introductionAdvisorIds.length} saved</span>
          </div>
          <div className="introduction-list">
            {introductionAdvisorIds.map((id) => {
              const advisor = advisors.find((item) => item.id === id)
              if (!advisor) return null
              return (
                <article key={id}>
                  <Avatar advisor={advisor} />
                  <div>
                    <strong>{advisor.name}</strong>
                    <span>{advisor.location}</span>
                  </div>
                  <span className="status-pill">Demo request saved</span>
                </article>
              )
            })}
          </div>
          <p className="form-note">
            These requests are recorded only in this browser. No advisor was
            contacted and no response is expected.
          </p>
        </section>
      )}
      <section className="referral-explainer">
        <div>
          <span>1</span>
          <strong>Preview a referral</strong>
          <p>
            This prototype saves a sample referral locally; it does not send a
            link.
          </p>
        </div>
        <div>
          <span>2</span>
          <strong>They choose what to share</strong>
          <p>
            A connected service would require their clear request before sharing
            information.
          </p>
        </div>
        <div>
          <span>3</span>
          <strong>Demo data stays local</strong>
          <p>No friend or advisor is contacted from this prototype.</p>
        </div>
      </section>
    </div>
  )
}

function AdviceHub({
  exploreGoal,

  navigate,
}: {
  exploreGoal: (goal: typeof futureGoals[number]) => void

  navigate: (screen: Screen) => void
}) {
  return (
    <div className="platform-page">
      <Breadcrumbs
        items={[{ label: "Home", screen: "dashboard" }, { label: "Advice" }]}
        navigate={navigate}
      />
      <section className="platform-intro">
        <span className="eyebrow">Co-Connect advice</span>
        <h1>Clear next steps for real life.</h1>
        <p>
          Explore practical topics, connect them to your goals, and find
          personal guidance when an article isn’t enough.
        </p>
      </section>
      <div className="advice-layout">
        <article className="featured-advice">
          <span>Featured guide</span>
          <h2>Preparing to buy your first home</h2>
          <p>
            A practical look at down payments, closing costs, monthly
            affordability, and questions to ask before you begin.
          </p>
          <button onClick={() => exploreGoal(futureGoals[0])}>
            Explore the home goal <Icon name="arrow" />
          </button>
        </article>
        <div className="advice-list">
          {[
            ["Building an emergency fund that fits your life", "Saving", "Building an emergency fund"],
            ["What changes when you start a family", "Life planning", "Starting a family"],
            ["How to prepare for an advisor conversation", "Getting advice", "Unsure where to start"],
            ["Balancing debt repayment and long-term goals", "Debt", "Paying down debt"],
          ].map(([title, category, goalTitle]) => (
            <button key={title} onClick={() => {
              const goal = futureGoals.find((item) => item.title === goalTitle)
              if (goal) exploreGoal(goal)
            }}>
              <span>{category}</span>
              <strong>{title}</strong>
              <i>→</i>
            </button>
          ))}
        </div>
      </div>
      <section className="advice-cta">
        <div>
          <h2>Need guidance that reflects your situation?</h2>
          <p>
            Co-Connect uses your goals and preferences to recommend advisors who
            may fit.
          </p>
        </div>
        <button className="primary" onClick={() => navigate("home")}>
          Explore Co-Connect <Icon name="arrow" />
        </button>
      </section>
    </div>
  )
}

function PlatformSection({
  screen,

  navigate,

  onClearDemoData,
}: {
  screen: "finances" | "products" | "support" | "privacy" | "accessibility"

  navigate: (screen: Screen) => void

  onClearDemoData: () => void
}) {
  const content = {
    finances: {
      eyebrow: "My Finances",

      title: "See the pieces of your plan together.",

      body: "Keep your goals, saved guidance, and advisor connections organized without turning your life into a dashboard.",

      links: ["Your goals", "Saved advisors", "Planning checklist"],
    },

    products: {
      eyebrow: "Products & Services",

      title: "Solutions for today and what comes next.",

      body: "Explore everyday financial services, protection, borrowing, saving, and investing—then get guidance when choices connect.",

      links: ["Saving & investing", "Home financing", "Family protection"],
    },

    support: {
      eyebrow: "Support",

      title: "How can we help?",

      body: "This prototype has no live support channel. Use the links below to review its accessibility and privacy information.",

      links: ["Accessibility", "Privacy"],
    },

    privacy: {
      eyebrow: "Privacy for this prototype",

      title: "Your information stays in this browser.",

      body: "This front-end prototype has no connected account or backend. Preferences, saved items, and demo records are stored in this browser only. Contact form fields are not sent or saved.",

      links: ["Browser storage", "Demo referrals", "Contact details"],
    },

    accessibility: {
      eyebrow: "Accessibility",

      title: "Explore Co-Connect with your preferred settings.",

      body: "This prototype includes visible keyboard focus styles, reduced-motion support, and responsive layouts. Some interactions are still being refined, and a full accessibility review has not been completed.",

      links: ["Keyboard focus", "Reduced motion", "Responsive layout"],
    },
  }[screen]

  return (
    <div className="platform-page">
      <Breadcrumbs
        items={[
          { label: "Home", screen: "dashboard" },

          { label: content.eyebrow },
        ]}
        navigate={navigate}
      />
      <section className="platform-intro">
        <span className="eyebrow">{content.eyebrow}</span>
        <h1>{content.title}</h1>
        <p>{content.body}</p>
      </section>
      {screen === "privacy" ? (
        <section className="policy-panel">
          <h2>What this prototype stores</h2>
          <p>
            Saved goals, advisors, preferences, and sample referral names are
            kept in this browser’s local storage. Introduction form details are
            not sent or persisted. Avoid entering real personal or financial
            information.
          </p>
          <p>Clear these saved demo details whenever you like.</p>
          <button className="secondary" onClick={onClearDemoData}>
            Clear local demo data
          </button>
        </section>
      ) : screen === "accessibility" ? (
        <section className="policy-panel">
          <h2>Current accessibility support</h2>
          <p>
            Use Tab to move between controls. Focus indicators and
            reduced-motion preferences are supported. Quiz and comparison
            interactions are being refined, so this page does not claim full
            accessibility conformance.
          </p>
        </section>
      ) : (
        <div className="resource-links">
          {content.links.map((link, index) => (
            <button
              key={link}
              onClick={() =>
                navigate(
                  screen === "finances"
                    ? index === 0
                      ? "future"
                      : index === 1
                        ? "results"
                        : "future"
                    : screen === "products"
                      ? "advice"
                      : screen === "support"
                        ? index === 0
                          ? "accessibility"
                          : "privacy"
                        : screen,
                )
              }
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{link}</strong>
              <i>→</i>
            </button>
          ))}
        </div>
      )}
      {!(["privacy", "accessibility"] as Screen[]).includes(screen) && (
        <section className="advice-cta">
          <div>
            <h2>Looking for personal Co-Connect guidance?</h2>
            <p>
              Explore a life goal or use Co-Connect to find an advisor whose
              approach fits.
            </p>
          </div>
          <button className="primary" onClick={() => navigate("home")}>
            Explore Co-Connect <Icon name="arrow" />
          </button>
        </section>
      )}
    </div>
  )
}

function Landing({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <>
      <div className="co-connect-breadcrumb">
        <Breadcrumbs
          items={[
            { label: "Home", screen: "dashboard" },

            { label: "Advice", screen: "advice" },

            { label: "Co-Connect" },
          ]}
          navigate={navigate}
        />
      </div>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <Icon name="spark" /> Co-Connect
          </span>
          <h1>
            Find Co-Connect guidance that fits <em>your life.</em>
          </h1>
          <p>
            Tell us what matters right now. This prototype uses sample advisor
            profiles to show how experience and preferences could be compared.
          </p>
          <div className="button-row">
            <button className="primary" onClick={() => navigate("quiz")}>
              Find my Co-Connect match <Icon name="arrow" />
            </button>
            <a className="text-link" href="#how">
              How it works <span>↓</span>
            </a>
          </div>
          <p className="reassurance">
            Explore the sample experience at your own pace.
          </p>
        </div>
        <div
          className="hero-visual"
          aria-label="A diverse group of financial advisors"
        >
          <img
            className="hero-photo"
            src={`${import.meta.env.BASE_URL}assets/co-connect-home.jpg`}
            alt="A couple talking together at home"
            fetchPriority="high"
            decoding="async"
          />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="portrait p1">
            <img
              src={`${import.meta.env.BASE_URL}assets/8bf22.png`}
              alt="Financial advisor"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="portrait p2">
            <img
              src={`${import.meta.env.BASE_URL}assets/480ae.png`}
              alt="Financial advisor"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="portrait p3">
            <img
              src={`${import.meta.env.BASE_URL}assets/c2bde.png`}
              alt="Financial advisor"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="match-note">
            <strong>A match is more than credentials.</strong>
            <span>
              It’s how someone listens, explains, and understands your
              priorities.
            </span>
          </div>
        </div>
      </section>
      <section className="connect-pathways">
        <div className="section-heading">
          <div>
            <span className="eyebrow">More than a match</span>
            <h2>Use Co-Connect in the way that helps today.</h2>
          </div>
        </div>
        <div>
          {[
            [
              "Find with Co-Connect",

              "Get matched based on your needs, preferences, and stage of life.",

              "quiz",
            ],

            [
              "Explore your goals",

              "Start with the future you’re planning for, then find relevant guidance.",

              "future",
            ],

            [
              "Return to your matches",

              "Review, save, and compare advisors you’ve already explored.",

              "results",
            ],

            [
              "Refer someone",

              "Share a private, low-pressure path to financial guidance.",

              "referrals",
            ],
          ].map(([title, description, destination]) => (
            <button key={title} onClick={() => navigate(destination as Screen)}>
              <strong>{title}</strong>
              <span>{description}</span>
              <i>Explore →</i>
            </button>
          ))}
        </div>
      </section>
      <section className="how" id="how">
        <span className="eyebrow">A simpler way to find guidance</span>
        <h2>Start with what matters to you.</h2>
        <div className="steps">
          <article>
            <span>01</span>
            <h3>Share your priorities</h3>
            <p>
              Answer a few thoughtful questions about where you are and what
              support would feel useful.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Meet your matches</h3>
            <p>
              See clearly why each advisor was recommended. No mysterious
              algorithm or ranked ads.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Take your time</h3>
            <p>
              Save, compare, or request a low-pressure introduction when you
              feel ready.
            </p>
          </article>
        </div>
      </section>
      <section className="connect-journey">
        <div>
          <span className="eyebrow">Your financial journey</span>
          <h2>Guidance changes as life changes.</h2>
          <p>
            Explore what’s ahead in Future You, then bring those goals into your
            advisor match whenever you’re ready.
          </p>
          <button className="secondary" onClick={() => navigate("future")}>
            Explore Future You
          </button>
        </div>
        <ol aria-label="Ways to use Co-Connect">
          {[
            ["Explore a goal", "Future You", "future"],
            ["Find guidance", "Co-Connect", "home"],
            ["Save your next steps", "Your financial home", "dashboard"],
            ["Share a referral", "Co-Connect referrals", "referrals"],
          ].map(([title, label, destination], index) => (
            <li key={title}>
              <button onClick={() => navigate(destination as Screen)}>
                <span>{index + 1}</span>
                <strong>{title}</strong>
                <small>{label}</small>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}

function Quiz({
  step,

  answers,

  error,

  setAnswers,

  back,

  next,

  editStep,
}: {
  step: number

  answers: Answers

  error: string

  setAnswers: (a: Answers) => void

  back: () => void

  next: () => void

  editStep: (step: number) => void
}) {
  if (step === 4)
    return (
      <section className="quiz-shell">
        <div className="progress-head">
          <span>Review your answers</span>
          <strong>5 of 5</strong>
        </div>
        <div className="progress">
          <i style={{ width: "100%" }} />
        </div>
        <button className="back-link" onClick={back}>
          <Icon name="back" /> Back
        </button>
        <div className="quiz-card review-card">
          <span className="eyebrow">What we learned</span>
          <h1>Does this sound like you?</h1>
          <p className="summary-sentence">{answerSummary(answers)}</p>
          <p className="trust-note">
            <Icon name="spark" /> We use this summary only to prioritize
            advisors whose experience and approach fit what you shared.
          </p>
          <div className="answer-review">
            {[
              ["Current situation", answers.situation, 0],

              ["Priorities", answers.priorities.join(", "), 1],

              [
                "Working style",

                [answers.style, answers.format].filter(Boolean).join(" · ") ||
                  "No preference",

                2,
              ],

              ["Check-in frequency", answers.frequency || "No preference", 3],
            ].map(([label, value, target]) => (
              <div key={label}>
                <span>
                  <small>{label}</small>
                  <strong>{value}</strong>
                </span>
                <button onClick={() => editStep(target as number)}>
                  Edit <span className="sr-only">{label}</span>
                </button>
              </div>
            ))}
          </div>
          <div className="quiz-actions">
            <span>You can return and update these choices at any time.</span>
            <button className="primary" onClick={next}>
              Find my Co-Connect matches <Icon name="arrow" />
            </button>
          </div>
        </div>
      </section>
    )

  const data = [
    {
      kicker: "Your situation",

      title: "What’s bringing you here?",

      help: "Life changes can shape the kind of advice that’s useful. Choose the one that feels most relevant today.",

      options: situations,
    },

    {
      kicker: "Your priorities",

      title: "What matters most to you?",

      help: `Because you’re here for ${answers.situation.toLowerCase()}, choose up to three areas where advice would feel most useful. We’ll prioritize relevant specialties.`,

      options: priorities,
    },

    {
      kicker: "How you like to connect",

      title: "What would make advice feel comfortable?",

      help: "Now that we understand your goals, tell us how you prefer to work. This optional detail helps us match the advisor’s approach—not just their credentials.",

      options: styles,
    },

    {
      kicker: "Staying in touch",

      title: "How often would you like to check in?",

      help: "Finally, a rough cadence helps us consider availability. This is optional and can always change later.",

      options: frequencies,
    },
  ][step]

  const selected =
    step === 0
      ? [answers.situation]
      : step === 1
        ? answers.priorities
        : step === 2
          ? [answers.style]
          : [answers.frequency]

  const select = (value: string) => {
    if (step === 0) setAnswers({ ...answers, situation: value })

    if (step === 1) {
      const next = answers.priorities.includes(value)
        ? answers.priorities.filter((p) => p !== value)
        : answers.priorities.length < 3
          ? [...answers.priorities, value]
          : answers.priorities

      setAnswers({ ...answers, priorities: next })
    }

    if (step === 2) setAnswers({ ...answers, style: value })

    if (step === 3) setAnswers({ ...answers, frequency: value })
  }

  return (
    <section className="quiz-shell">
      <div className="progress-head">
        <span>Matching questionnaire</span>
        <strong>{step + 1} of 5</strong>
      </div>
      <div className="progress">
        <i style={{ width: `${(step + 1) * 20}%` }} />
      </div>
      <button className="back-link" onClick={back}>
        <Icon name="back" /> Back
      </button>
      <div className="quiz-card">
        <span className="eyebrow">{data.kicker}</span>
        <h1>{data.title}</h1>
        <p>{data.help}</p>
        <p className="question-why">
          <strong>Why we ask:</strong>{" "}
          {step === 0
            ? "Advisors often focus on particular life stages and decisions."
            : step === 1
              ? "Relevant experience makes the first conversation more useful."
              : step === 2
                ? "A good fit includes how advice is explained and delivered."
                : "Availability matters when building a relationship that works for you."}
        </p>
        <div className="options" role="group" aria-label={data.title}>
          {data.options.map((option) => (
            <button
              key={option}
              className={selected.includes(option) ? "selected" : ""}
              onClick={() => select(option)}
              type="button"
              aria-pressed={selected.includes(option)}
            >
              <span className="choice-indicator">
                <Icon name="check" />
              </span>
              {option}
            </button>
          ))}
        </div>
        {step === 2 && (
          <fieldset className="format-field">
            <legend>Meeting preference</legend>
            <div>
              {formats.map((format) => (
                <button
                  key={format}
                  type="button"
                  className={answers.format === format ? "selected" : ""}
                  aria-pressed={answers.format === format}
                  onClick={() => setAnswers({ ...answers, format })}
                >
                  {format}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="quiz-actions">
          <span>{step === 1 && `${answers.priorities.length}/3 selected`}</span>
          <div>
            {step >= 2 && (
              <button className="skip-button" onClick={next}>
                Skip for now
              </button>
            )}
            <button className="primary" onClick={next}>
              {step === 3 ? "Review answers" : "Continue"} <Icon name="arrow" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Loading() {
  return (
    <section className="loading">
      <div className="loader">
        <span />
        <span />
        <span />
      </div>
      <h1>Finding advisors who fit you</h1>
      <p>
        We’re looking at your priorities, preferences, and current situation.
      </p>
    </section>
  )
}

function Results({
  matches,

  answers,

  saved,

  compare,

  expanded,

  setExpanded,

  toggleSaved,

  toggleCompare,

  openProfile,

  edit,

  goCompare,

  compareNotice,
}: {
  matches: Match[]

  answers: Answers

  saved: number[]

  compare: number[]

  expanded: number | null

  setExpanded: (id: number | null) => void

  toggleSaved: (id: number) => void

  toggleCompare: (id: number) => void

  openProfile: (a: Advisor) => void

  edit: () => void

  goCompare: () => void

  compareNotice: string
}) {
  const [view, setView] = useState<"recommended" | "all" | "saved">(
    "recommended",
  )

  const [filtersOpen, setFiltersOpen] = useState(false)

  const [filters, setFilters] = useState({
    specialty: "",

    location: "",

    format: "",

    language: "",

    experience: "",

    style: "",

    availability: "",
  })

  const options = {
    specialty: Array.from(new Set(advisors.flatMap((a) => a.specialties))),

    location: Array.from(
      new Set(advisors.map((a) => a.location.split(", ")[1])),
    ),

    language: Array.from(new Set(advisors.flatMap((a) => a.languages))),

    style: Array.from(new Set(advisors.map((a) => a.style))),

    availability: Array.from(new Set(advisors.map((a) => a.frequency))),
  }

  const baseMatches =
    view === "recommended"
      ? matches.slice(0, 4)
      : view === "saved"
        ? matches.filter(({ advisor }) => saved.includes(advisor.id))
        : matches

  const displayed = baseMatches.filter(({ advisor }) => {
    const province = advisor.location.split(", ")[1]

    const experienceMatches =
      !filters.experience ||
      (filters.experience === "0–10 years"
        ? advisor.years <= 10
        : filters.experience === "11–15 years"
          ? advisor.years >= 11 && advisor.years <= 15
          : advisor.years >= 16)

    return (
      (!filters.specialty || advisor.specialties.includes(filters.specialty)) &&
      (!filters.location || province === filters.location) &&
      (!filters.format || advisor.format.includes(filters.format)) &&
      (!filters.language || advisor.languages.includes(filters.language)) &&
      (!filters.style || advisor.style === filters.style) &&
      (!filters.availability || advisor.frequency === filters.availability) &&
      experienceMatches
    )
  })

  const activeFilters = Object.values(filters).filter(Boolean).length

  const resetFilters = () =>
    setFilters({
      specialty: "",

      location: "",

      format: "",

      language: "",

      experience: "",

      style: "",

      availability: "",
    })

  return (
    <section className="results">
      <div className="results-head">
        <div>
          <span className="eyebrow">Sample advisor recommendations</span>
          <h1>Meet your matches</h1>
          <p>
            {answerSummary(answers)} These matches are based only on the
            priorities and preferences you selected.
          </p>
        </div>
        <button className="secondary" onClick={edit}>
          Edit my answers
        </button>
      </div>
      <p className="prototype-note" role="note">
        Advisor profiles are sample content. Recommendations use simple
        prototype rules and are not a validated measure of financial fit.
      </p>
      <div className="discovery-editorial">
        <img
          src={`${import.meta.env.BASE_URL}assets/advisor-conversation.jpg`}
          alt="Two people reviewing information together"
          loading="lazy"
          decoding="async"
        />
        <div>
          <strong>A match is about more than a specialty.</strong>
          <span>
            Co-Connect considers how an advisor communicates, meets, and
            supports the goals you shared.
          </span>
        </div>
      </div>
      <div className="results-tools">
        <div className="view-tabs" role="group" aria-label="Advisor results">
          <button
            aria-pressed={view === "recommended"}
            className={view === "recommended" ? "active" : ""}
            onClick={() => setView("recommended")}
          >
            Recommended for you <span>4</span>
          </button>
          <button
            aria-pressed={view === "all"}
            className={view === "all" ? "active" : ""}
            onClick={() => setView("all")}
          >
            All advisors <span>{matches.length}</span>
          </button>
          <button
            aria-pressed={view === "saved"}
            className={view === "saved" ? "active" : ""}
            onClick={() => setView("saved")}
          >
            Saved <span>{saved.length}</span>
          </button>
        </div>
        <button
          className="filter-toggle"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          Refine results {activeFilters > 0 && <span>{activeFilters}</span>}
        </button>
      </div>
      {filtersOpen && (
        <div className="filter-panel">
          <div className="filter-heading">
            <div>
              <strong>Refine what matters</strong>
              <span>
                Filters help you explore; they don’t change the recommendation
                order.
              </span>
            </div>
            {activeFilters > 0 && (
              <button onClick={resetFilters}>Clear all</button>
            )}
          </div>
          <div className="filter-grid">
            {[
              ["specialty", "Specialty", options.specialty],

              ["location", "Province", options.location],

              ["format", "Meeting format", ["Virtual", "In person"]],

              ["language", "Language", options.language],

              [
                "experience",

                "Experience",

                ["0–10 years", "11–15 years", "16+ years"],
              ],

              ["style", "Communication style", options.style],

              ["availability", "Availability", options.availability],
            ].map(([key, label, values]) => (
              <label key={key as string}>
                {label as string}
                <select
                  value={filters[(key as keyof typeof filters)]}
                  onChange={(event) =>
                    setFilters({
                      ...filters,

                      [key as string]: event.target.value,
                    })
                  }
                >
                  <option value="">Any</option>
                  {(values as string[]).map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
      )}
      {view === "recommended" &&
        !activeFilters &&
        matches[0]?.considerations.length > 0 && (
          <div className="closest-match-note">
            <strong>
              We couldn’t find an advisor who matches every preference exactly.
            </strong>
            <span>
              These are the closest matches. Review each advisor’s “Things to
              consider,” or edit an optional preference to broaden the list.
            </span>
            <button onClick={edit}>Edit preferences</button>
          </div>
        )}
      {displayed.length > 5 && (
        <div className="results-notice">
          <Icon name="spark" />
          <span>
            <strong>You have several good options.</strong> Start with the match
            reasons, then save two or three that feel worth a closer look.
          </span>
        </div>
      )}
      {!displayed.length && view === "saved" && !activeFilters && (
        <div className="no-matches">
          <h2>No saved advisors yet</h2>
          <p>
            Save an advisor to keep them here while you review and compare your
            options. Saving doesn’t contact the advisor.
          </p>
          <button className="primary" onClick={() => setView("recommended")}>
            Explore recommendations
          </button>
        </div>
      )}
      {!displayed.length && (view !== "saved" || !!activeFilters) && (
        <div className="no-matches">
          <h2>We couldn’t find an advisor who matches everything selected.</h2>
          <p>
            Try broadening location, allowing virtual meetings, or removing an
            optional preference. Your original recommendations are still
            available.
          </p>
          <div>
            <button className="secondary" onClick={resetFilters}>
              Clear optional filters
            </button>
            <button
              className="primary"
              onClick={() => {
                resetFilters()

                setView("recommended")
              }}
            >
              View closest matches
            </button>
          </div>
        </div>
      )}
      <div className="results-grid">
        {displayed.map(({ advisor, reasons, considerations }, index) => (
          <article
            className={`advisor-card ${index === 0 ? "featured" : ""}`}
            key={advisor.id}
          >
            <div className="card-top">
              <span className="match-pill">
                {index === 0 && view === "recommended"
                  ? "Top suggestion"
                  : "Based on your preferences"}
                {index === 0 && view === "recommended" && "· Best fit"}
              </span>
              <button
                className={`save-button ${
                  saved.includes(advisor.id) ? "active" : ""
                }`}
                onClick={() => toggleSaved(advisor.id)}
                aria-label={`${
                  saved.includes(advisor.id) ? "Unsave" : "Save"
                } ${advisor.name}`}
              >
                <Icon name="heart" />
                {saved.includes(advisor.id) ? "Saved" : "Save"}
              </button>
            </div>
            <Avatar advisor={advisor} />
            <h2>{advisor.name}</h2>
            <p className="card-reason">
              {reasons[0] || "A close fit based on the priorities you shared"}
            </p>
            <div className="tags">
              {advisor.specialties.slice(0, 3).map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
            <dl className="card-details">
              <div>
                <dt>Communication</dt>
                <dd>{advisor.style}</dd>
              </div>
              <div>
                <dt>Meetings</dt>
                <dd>{advisor.format.join(" + ")}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{advisor.location}</dd>
              </div>
              <div>
                <dt>Availability</dt>
                <dd>
                  {advisor.acceptingIntroductions === false
                    ? "Not accepting introductions"
                    : advisor.frequency}
                </dd>
              </div>
            </dl>
            <button
              className="why"
              onClick={() =>
                setExpanded(expanded === advisor.id ? null : advisor.id)
              }
              aria-expanded={expanded === advisor.id}
            >
              Why this match? <span>{expanded === advisor.id ? "−" : "+"}</span>
            </button>
            {expanded === advisor.id && (
              <div className="why-panel">
                <strong>Strong matches</strong>
                <ul>
                  {reasons.map((reason) => (
                    <li key={reason}>
                      <Icon name="check" />
                      {reason}
                    </li>
                  ))}
                </ul>
                <strong>Things to consider</strong>
                <ul className="consider-list">
                  {(considerations.length
                    ? considerations
                    : ["No meaningful preference gaps found"]
                  )

                    .map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                </ul>
                <small>
                  Suggestions use simple prototype rules based on your answers.
                  This ordering has not been validated as a measure of fit.
                </small>
              </div>
            )}
            <div className="card-actions">
              <button className="primary" onClick={() => openProfile(advisor)}>
                View profile <Icon name="arrow" />
              </button>
              <button
                className={`secondary compare-card-button ${
                  compare.includes(advisor.id) ? "active" : ""
                }`}
                onClick={() => toggleCompare(advisor.id)}
                aria-label={`Compare ${advisor.name}`}
              >
                <Icon name="compare" />
                {compare.includes(advisor.id) ? "Added" : "Compare"}
              </button>
            </div>
          </article>
        ))}
      </div>
      {compareNotice && (
        <p className="compare-notice" role="status">
          {compareNotice}
        </p>
      )}
      <div className="compare-bar">
        <div>
          <Icon name="compare" />
          <span>
            <strong>{compare.length} selected</strong> for comparison
          </span>
        </div>
        <button onClick={goCompare} disabled={compare.length < 2}>
          Compare advisors <Icon name="arrow" />
        </button>
      </div>
    </section>
  )
}

function Profile({
  advisor,

  reasons,

  considerations,

  answers,

  saved,

  comparing,

  back,

  toggleSaved,

  toggleCompare,

  refer,

  referSomeone,

  futureYou,
}: {
  advisor: Advisor

  reasons: string[]

  considerations: string[]

  answers: Answers

  saved: boolean

  comparing: boolean

  back: () => void

  toggleSaved: () => void

  toggleCompare: () => void

  refer: () => void

  referSomeone: () => void

  futureYou: () => void
}) {
  return (
    <section className="profile">
      <button className="back-link" onClick={back}>
        <Icon name="back" /> Back to matches
      </button>
      <div className="profile-hero">
        <Avatar advisor={advisor} large />
        <div>
          <span className="eyebrow">Sample advisor profile</span>
          <h1>{advisor.name}</h1>
          <p>{advisor.intro}</p>
          <div className="profile-meta">
            <span>{advisor.location}</span>
            <span>{advisor.years} years experience</span>
            <span>{advisor.format.join(" + ")}</span>
          </div>
        </div>
        <div className="profile-actions">
          <button
            className="secondary"
            onClick={refer}
            disabled={advisor.acceptingIntroductions === false}
          >
            {advisor.acceptingIntroductions === false
              ? "Introductions paused"
              : "Request an introduction"}{" "}
            <Icon name="arrow" />
          </button>
          <button className="secondary" onClick={toggleSaved}>
            <Icon name="heart" />
            {saved ? "Saved" : "Save advisor"}
          </button>
          <button className="secondary" onClick={toggleCompare}>
            <Icon name="compare" />
            {comparing ? "Added to compare" : "Compare"}
          </button>
          <button className="profile-text-action" onClick={referSomeone}>
            Refer someone to {advisor.name.split(" ")[0]}
          </button>
        </div>
      </div>
      <div className="profile-content">
        <div>
          <article>
            <span className="section-kicker">Who is this advisor?</span>
            <h2>Meet {advisor.name.split(" ")[0]}</h2>
            <p>{advisor.intro}</p>
          </article>
          <article>
            <span className="section-kicker">
              How do they work with clients?
            </span>
            <h2>{advisor.style} guidance</h2>
            <p>{advisor.approach}</p>
          </article>
          <article>
            <span className="section-kicker">What do they specialize in?</span>
            <h2>Areas of focus</h2>
            <div className="specialty-list">
              {advisor.specialties.map((x) => (
                <span key={x}>
                  <Icon name="check" />
                  {x}
                </span>
              ))}
            </div>
          </article>
          <article>
            <span className="section-kicker">What should I know first?</span>
            <h2>Before requesting an introduction</h2>
            <p>
              A first conversation is a chance to ask about approach, services,
              and fit. Co-Connect facilitates the introduction; you decide
              whether to continue, and there is no commitment.
            </p>
            {advisor.acceptingIntroductions === false && (
              <p className="availability-alert" role="status">
                {advisor.name} is not accepting new introductions right now. You
                can save this profile or compare similar advisors.
              </p>
            )}
          </article>
        </div>
        <aside>
          <h2>Why recommended to me?</h2>
          <p className="match-context">{answerSummary(answers)}</p>
          {reasons.map((r) => (
            <p key={r}>
              <Icon name="check" />
              {r}
            </p>
          ))}
          {!!considerations.length && (
            <>
              <h3>Things to consider</h3>
              {considerations.map((item) => (
                <p className="consideration" key={item}>
                  {item}
                </p>
              ))}
            </>
          )}
          <hr />
          <h3>At a glance</h3>
          <dl>
            <div>
              <dt>Communication</dt>
              <dd>{advisor.style}</dd>
            </div>
            <div>
              <dt>Availability</dt>
              <dd>{advisor.frequency}</dd>
            </div>
            <div>
              <dt>Credentials</dt>
              <dd>{advisor.credentials.join(", ")}</dd>
            </div>
            <div>
              <dt>Languages</dt>
              <dd>{advisor.languages.join(", ")}</dd>
            </div>
            <div>
              <dt>Meeting format</dt>
              <dd>{advisor.format.join(" + ")}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{advisor.location}</dd>
            </div>
          </dl>
        </aside>
      </div>
      <div className="profile-crosslinks">
        <div>
          <span className="eyebrow">Continue your planning</span>
          <h2>Connect this advisor to your Future You goals.</h2>
          <p>
            Return to your goals to review what to prepare, or share this
            advisor with someone who may benefit from an introduction.
          </p>
        </div>
        <div>
          <button className="secondary" onClick={futureYou}>
            View Future You goals
          </button>
          <button className="secondary" onClick={referSomeone}>
            Refer someone
          </button>
        </div>
      </div>
      <div className="gentle-cta">
        <div>
          <h2>Curious if it’s a fit?</h2>
          <p>
            Request a short introduction. It’s a conversation, not a commitment.
          </p>
        </div>
        <button
          className="secondary"
          onClick={refer}
          disabled={advisor.acceptingIntroductions === false}
        >
          {advisor.acceptingIntroductions === false
            ? "Introductions paused"
            : "Request an introduction"}{" "}
          <Icon name="arrow" />
        </button>
      </div>
    </section>
  )
}

function Compare({
  ids,

  matches,

  remove,

  open,

  browse,

  choose,
}: {
  ids: number[]

  matches: Match[]

  remove: (id: number) => void

  open: (a: Advisor) => void

  browse: () => void

  choose: (a: Advisor) => void
}) {
  const items = ids

    .map((id) => matches.find((m) => m.advisor.id === id))

    .filter(Boolean) as Match[]

  const rows: Array<[string, (match: Match) => string]> = [
    ["Specialties", (match) => match.advisor.specialties.join(" · ")],

    ["Communication", (match) => match.advisor.style],

    ["Experience", (match) => `${match.advisor.years} years`],

    ["Location", (match) => match.advisor.location],

    [
      "Availability",

      (match) =>
        `${match.advisor.format.join(" + ")} · ${match.advisor.frequency}`,
    ],

    ["Why matched", (match) => match.reasons.join(" · ")],

    ["Credentials", (match) => match.advisor.credentials.join(", ")],
  ]

  if (!items.length)
    return (
      <section className="empty">
        <div className="empty-icon">
          <Icon name="compare" />
        </div>
        <h1>No advisors to compare yet</h1>
        <p>
          Add advisors from your matches to see their experience, approach, and
          availability side by side.
        </p>
        <button className="primary" onClick={browse}>
          Browse my matches <Icon name="arrow" />
        </button>
      </section>
    )

  return (
    <section className="compare-page">
      <span className="eyebrow">Sample profile comparison</span>
      <h1>Compare advisors</h1>
      <p>
        Compare sample profiles using the details shown. Availability and
        credentials are not verified.
      </p>
      {items.length === 1 && (
        <div className="comparison-guidance" role="status">
          <Icon name="compare" />
          <span>
            <strong>Add one more advisor for a useful comparison.</strong> You
            can compare up to three sample profiles. Nothing is sent to an
            advisor.
          </span>
          <button onClick={browse}>Add another</button>
        </div>
      )}
      <div className="compare-scroll">
        <div
          className="compare-table"
          style={{
            gridTemplateColumns: `160px repeat(${items.length}, minmax(230px, 1fr))`,
          }}
        >
          <div className="table-label" />
          {items.map(({ advisor }) => (
            <div className="compare-person" key={advisor.id}>
              <button
                className="remove"
                onClick={() => remove(advisor.id)}
                aria-label={`Remove ${advisor.name}`}
              >
                ×
              </button>
              <Avatar advisor={advisor} />
              <h2>{advisor.name}</h2>
              <span>Suggested from your preferences</span>
            </div>
          ))}
          {rows.flatMap(([label, value]) => [
            <div className="table-label" key={`${label}-label`}>
              {label}
              {new Set(items.map(value)).size > 1 && (
                <small>Key difference</small>
              )}
            </div>,

            ...items.map((m) => (
              <div
                className={`table-cell ${
                  new Set(items.map(value)).size > 1 ? "is-different" : ""
                }`}
                key={`${label}-${m.advisor.id}`}
              >
                {value(m)}
              </div>
            )),
          ])}
          <div className="table-label" />
          {items.map(({ advisor }) => (
            <div
              className="table-cell compare-actions"
              key={`action-${advisor.id}`}
            >
              <button className="secondary" onClick={() => open(advisor)}>
                View profile
              </button>
              <button
                className="choose-link"
                onClick={() => choose(advisor)}
                disabled={advisor.acceptingIntroductions === false}
              >
                {advisor.acceptingIntroductions === false
                  ? "Currently unavailable"
                  : "Choose this advisor"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Referral({
  advisor,

  answers,

  back,

  submit,
}: {
  advisor: Advisor

  answers: Answers

  back: () => void

  submit: () => void
}) {
  const [form, setForm] = useState({
    name: "",

    email: "",

    note: "",

    consent: false,
  })

  const [error, setError] = useState("")

  const [reviewing, setReviewing] = useState(false)

  const send = (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !form.name.trim() ||
      !/^\S+@\S+\.\S+$/.test(form.email) ||
      !form.consent
    ) {
      setError(
        "Enter sample contact details and confirm this prototype will not send them.",
      )

      return
    }

    if (!reviewing) {
      setError("")

      setReviewing(true)

      return
    }

    submit()
  }

  return (
    <section className="referral">
      <button className="back-link" onClick={back}>
        <Icon name="back" /> Back to profile
      </button>
      <div className="referral-grid">
        <div>
          <span className="eyebrow">Demo introduction request</span>
          <h1>Connect with {advisor.name.split(" ")[0]}</h1>
          <p>
            Preview an introduction request to {advisor.name}. This prototype
            does not contact the advisor or send your details.
          </p>
          <div className="next-steps">
            <h2>Prototype preview</h2>
            <ol>
              <li>
                <span>1</span>
                <div>
                  <strong>Your request stays in this browser</strong>
                  <p>
                    No contact details are sent to {advisor.name} in this
                    prototype.
                  </p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>The finished service would follow up</strong>
                  <p>
                    A connected service would need to confirm advisor
                    availability and arrange a conversation.
                  </p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>You decide what feels right</strong>
                  <p>
                    Ask questions, take your time, or choose not to continue.
                    There’s no commitment.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
        <form onSubmit={send} noValidate>
          <div className="advisor-mini">
            <Avatar advisor={advisor} />
            <div>
              <strong>{advisor.name}</strong>
              <span>{advisor.location}</span>
            </div>
          </div>
          {reviewing ? (
            <div className="request-review">
              <div className="review-title">
                <h2>Review your request</h2>
                <button type="button" onClick={() => setReviewing(false)}>
                  Edit details
                </button>
              </div>
              <dl>
                <div>
                  <dt>Shared with</dt>
                  <dd>{advisor.name}</dd>
                </div>
                <div>
                  <dt>Your contact</dt>
                  <dd>
                    {form.name} · {form.email}
                  </dd>
                </div>
                <div>
                  <dt>Matching context</dt>
                  <dd>{answerSummary(answers)}</dd>
                </div>
                <div>
                  <dt>Your note</dt>
                  <dd>{form.note || "No note added"}</dd>
                </div>
              </dl>
              <p>
                This review is for the prototype only. Your contact details are
                not sent or saved.
              </p>
            </div>
          ) : (
            <>
              <label>
                Full name
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Sample name"
                  autoComplete="off"
                  required
                />
              </label>
              <label>
                Email address
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="sample@example.test"
                  autoComplete="off"
                  required
                />
              </label>
              <label>
                Anything you’d like {advisor.name.split(" ")[0]} to know?{" "}
                <span>Optional</span>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder={`For example: I’m exploring ${answers.situation.toLowerCase()} and would like to understand...`}
                />
              </label>
              <label className="consent">
                <input
                  type="checkbox"
                  required
                  checked={form.consent}
                  onChange={(e) =>
                    setForm({ ...form, consent: e.target.checked })
                  }
                />
                <span>
                  I understand this prototype does not send my details to an
                  advisor.
                </span>
              </label>
            </>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="primary" type="submit">
            {reviewing ? "Save demo request" : "Preview demo request"}{" "}
            <Icon name="arrow" />
          </button>
          <p className="form-note">
            This is not a commitment to work with an advisor.
          </p>
        </form>
      </div>
    </section>
  )
}

function Success({ advisor, done }: {
  advisor: Advisor
  done: () => void
}) {
  return (
    <section className="success">
      <div className="success-mark">
        <Icon name="check" />
      </div>
      <span className="eyebrow">Demo request saved</span>
      <h1>Your request is saved in this browser.</h1>
      <p>
        No request was sent to {advisor.name}. You can continue exploring this
        sample experience.
      </p>
      <div className="success-box">
        <strong>What happens next</strong>
        <ol>
          <li>This prototype records that you completed the demo flow.</li>
          <li>No advisor is contacted and no reply will arrive.</li>
          <li>You can continue exploring sample profiles.</li>
        </ol>
        <span>
          Advisor availability and profile details are sample content and are
          not verified.
        </span>
      </div>
      <button className="primary" onClick={done}>
        Back to my matches <Icon name="arrow" />
      </button>
    </section>
  )
}

export default App

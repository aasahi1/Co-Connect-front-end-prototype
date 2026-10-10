export type Screen = "dashboard" | "home" | "future" | "goal" | "referrals" | "advice" | "finances" | "products" | "support" | "privacy" | "accessibility" | "quiz" | "loading" | "results" | "profile" | "compare" | "referral" | "success"

export type Answers = {
  situation: string

  priorities: string[]

  style: string

  format: string

  frequency: string
}

export type ReferralRecord = {
  name: string

  advisor: string

  status: string

  date: string
}

export type Advisor = {
  id: number

  name: string

  location: string

  specialties: string[]

  situations: string[]

  style: string

  format: string[]

  frequency: string

  years: number

  credentials: string[]

  languages: string[]

  intro: string

  approach: string

  image?: string

  color: string

  acceptingIntroductions?: boolean
}

export const advisors: Advisor[] = [
  {
    id: 1,

    name: "Devon Lane",

    location: "Toronto, ON",

    specialties: [
      "Buying a home",

      "Building savings",

      "Understanding my finances",
    ],

    situations: ["Buying a home", "Starting a family", "Moving"],

    style: "Visual and practical",

    format: ["Virtual", "In person"],

    frequency: "Monthly check-ins",

    years: 12,

    credentials: ["CFP®", "FMA"],

    languages: ["English", "French"],

    intro:
      "Devon helps people turn big life changes into clear, manageable financial decisions.",

    approach:
      "Her planning style starts with listening. She uses plain language and visual roadmaps, then builds a flexible plan you can revisit as life changes.",

    image: `${import.meta.env.BASE_URL}assets/8bf22.png`,

    color: "#48b69a",
  },

  {
    id: 2,

    name: "Jacob Jones",

    location: "Hamilton, ON",

    specialties: ["Managing debt", "Buying a home", "Long-term planning"],

    situations: ["Buying a home", "Managing debt", "Starting a new job"],

    style: "Simple explanations",

    format: ["Virtual", "In person"],

    frequency: "As needed",

    years: 15,

    credentials: ["CFP®", "PFP"],

    languages: ["English"],

    intro:
      "Jacob makes complex choices feel less intimidating, especially for first-time home buyers.",

    approach:
      "He breaks each goal into practical next steps and gives you time to make decisions without pressure.",

    image: `${import.meta.env.BASE_URL}assets/480ae.png`,

    color: "#4ab0d2",
  },

  {
    id: 3,

    name: "Evelyn Chao",

    location: "Vancouver, BC",

    specialties: ["Investing", "Long-term planning", "Planning for retirement"],

    situations: [
      "Planning for retirement",

      "Starting a new job",

      "I'm not sure yet",
    ],

    style: "Thoughtful listener",

    format: ["Virtual"],

    frequency: "Quarterly reviews",

    years: 18,

    credentials: ["CFP®", "CIM®"],

    languages: ["English", "Mandarin"],

    intro:
      "Evelyn supports thoughtful investors who want a long-term plan grounded in their values.",

    approach:
      "She begins with your questions, explains trade-offs clearly, and creates an investment plan at a pace that feels comfortable.",

    image: `${import.meta.env.BASE_URL}assets/c2bde.png`,

    color: "#3e94c6",
  },

  {
    id: 4,

    name: "Amara Okafor",

    location: "Calgary, AB",

    specialties: [
      "Starting a family",

      "Protecting my family",

      "Building savings",
    ],

    situations: ["Starting a family", "Moving", "Starting a new job"],

    style: "Warm and collaborative",

    format: ["Virtual", "In person"],

    frequency: "Monthly check-ins",

    years: 9,

    credentials: ["CFP®", "CLU®"],

    languages: ["English", "Igbo"],

    intro:
      "Amara helps growing families build confidence around everyday finances and future goals.",

    approach:
      "Her sessions are conversational and collaborative, with practical actions between each meeting.",

    color: "#e0a65b",
  },

  {
    id: 5,

    name: "Marc Beaulieu",

    location: "Montréal, QC",

    specialties: [
      "Planning for retirement",

      "Investing",

      "Protecting my family",
    ],

    situations: ["Planning for retirement", "I'm not sure yet"],

    style: "Detailed and analytical",

    format: ["Virtual", "In person"],

    frequency: "Quarterly reviews",

    years: 22,

    credentials: ["F.Pl.", "CIM®"],

    languages: ["French", "English"],

    intro:
      "Marc works with people approaching retirement who want to understand every part of their plan.",

    approach:
      "He combines detailed analysis with patient explanations so you can make informed choices.",

    color: "#8775b8",

    acceptingIntroductions: false,
  },

  {
    id: 6,

    name: "Priya Raman",

    location: "Ottawa, ON",

    specialties: [
      "Managing debt",

      "Building savings",

      "Understanding my finances",
    ],

    situations: ["Managing debt", "Starting a new job", "Moving"],

    style: "Encouraging coach",

    format: ["Virtual"],

    frequency: "Every two weeks",

    years: 7,

    credentials: ["QAFP™"],

    languages: ["English", "Tamil", "Hindi"],

    intro:
      "Priya helps people build steady financial habits without judgment or confusing jargon.",

    approach:
      "She focuses on small, realistic changes that create momentum and make progress visible.",

    color: "#d4747c",
  },

  {
    id: 7,

    name: "Noah Williams",

    location: "Halifax, NS",

    specialties: ["Buying a home", "Managing debt", "Long-term planning"],

    situations: ["Buying a home", "Moving", "Managing debt"],

    style: "Direct and concise",

    format: ["In person", "Virtual"],

    frequency: "As needed",

    years: 11,

    credentials: ["CFP®"],

    languages: ["English"],

    intro:
      "Noah offers straightforward guidance for people balancing home ownership with other goals.",

    approach:
      "He keeps meetings focused, provides clear options, and follows up with a concise action list.",

    color: "#387a8b",
  },

  {
    id: 8,

    name: "Sofia Alvarez",

    location: "Winnipeg, MB",

    specialties: ["Starting a family", "Building savings", "Investing"],

    situations: ["Starting a family", "Starting a new job", "I'm not sure yet"],

    style: "Warm and collaborative",

    format: ["Virtual", "In person"],

    frequency: "Monthly check-ins",

    years: 10,

    credentials: ["CFP®"],

    languages: ["English", "Spanish"],

    intro:
      "Sofia helps people connect day-to-day choices with the future they want to build.",

    approach:
      "Her warm, flexible process makes space for changing priorities and questions of every size.",

    color: "#c47a4b",
  },
]

export const situations = [
  "Buying a home",

  "Starting a family",

  "Moving",

  "Starting a new job",

  "Planning for retirement",

  "Managing debt",

  "Building savings",

  "I'm not sure yet",
]

export const priorities = [
  "Saving money",

  "Long-term planning",

  "Investing",

  "Paying down debt",

  "Buying a home",

  "Protecting my family",

  "Understanding my finances",
]

export const priorityAliases: Record<string, string> = {
  "Saving money": "Building savings",

  "Paying down debt": "Managing debt",
}

export const styles = [
  "Simple explanations",

  "Warm and collaborative",

  "Detailed and analytical",

  "Visual and practical",
]

export const formats = ["Virtual", "In person", "Either works"]

export const frequencies = [
  "Every two weeks",

  "Monthly check-ins",

  "Quarterly reviews",

  "As needed",
]

export const futureGoals = [
  {
    title: "Buying a home",

    description:
      "Prepare for upfront costs, a mortgage, and life after move-in.",

    priority: "Building savings",

    stage: "In progress",
  },

  {
    title: "Starting a family",

    description:
      "Plan for changing expenses, protection, and time away from work.",

    priority: "Protecting my family",

    stage: "Explore",
  },

  {
    title: "Saving for school",

    description:
      "Understand savings options and build a realistic contribution plan.",

    priority: "Long-term planning",

    stage: "Explore",
  },

  {
    title: "Building an emergency fund",

    description:
      "Create a cushion that fits your income, expenses, and responsibilities.",

    priority: "Building savings",

    stage: "Getting started",
  },

  {
    title: "Planning for retirement",

    description:
      "Turn the future you picture into practical saving and investing steps.",

    priority: "Long-term planning",

    stage: "Explore",
  },

  {
    title: "Starting a business",

    description:
      "Separate personal and business needs while preparing for uncertainty.",

    priority: "Understanding my finances",

    stage: "Explore",
  },

  {
    title: "Paying down debt",

    description:
      "Prioritize balances and create room for the goals that come next.",

    priority: "Paying down debt",

    stage: "Explore",
  },

  {
    title: "Unsure where to start",

    description: "Take stock of where you are and identify a useful next step.",

    priority: "Understanding my finances",

    stage: "Explore",
  },
]

export function answerSummary(answers: Answers) {
  const prioritiesText = answers.priorities.length
    ? answers.priorities.map((item) => item.toLowerCase()).join(", ")
    : "exploring your priorities"

  const meetingText = answers.format
    ? `${answers.format.toLowerCase()} meetings`
    : "a flexible meeting format"

  return `You’re focused on ${answers.situation.toLowerCase()}, ${prioritiesText}, and prefer ${meetingText}.`
}

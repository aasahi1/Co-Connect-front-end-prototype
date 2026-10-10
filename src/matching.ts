import { advisors, priorityAliases, type Advisor, type Answers } from "./data"

export type Match = {
  advisor: Advisor
  score: number
  reasons: string[]
  considerations: string[]
}

export function getMatches(answers: Answers): Match[] {
  return advisors
    .map((advisor) => {
      let score = 52
      const reasons: string[] = []
      if (answers.situation && advisor.situations.includes(answers.situation)) {
        score += 16
        reasons.push(
          `Experience helping people with ${answers.situation.toLowerCase()}`,
        )
      }
      answers.priorities.forEach((priority) => {
        const normalized = priorityAliases[priority] || priority
        if (advisor.specialties.includes(normalized)) {
          score += 9
          reasons.push(`Specializes in ${priority.toLowerCase()}`)
        }
      })
      if (answers.style && advisor.style === answers.style) {
        score += 8
        reasons.push(
          `Offers the ${answers.style.toLowerCase()} style you prefer`,
        )
      }
      if (
        answers.format &&
        (answers.format === "Either works" ||
          advisor.format.includes(answers.format))
      ) {
        score += 5
        reasons.push(
          `${
            answers.format === "Either works"
              ? advisor.format.join(" and ").toLowerCase()
              : answers.format
          } meetings available`,
        )
      }
      if (answers.frequency && advisor.frequency === answers.frequency) {
        score += 4
        reasons.push(
          `Matches your preferred ${answers.frequency.toLowerCase()} cadence`,
        )
      }

      const considerations: string[] = []
      if (
        answers.format &&
        answers.format !== "Either works" &&
        !advisor.format.includes(answers.format)
      ) {
        considerations.push(
          `Doesn’t currently offer ${answers.format.toLowerCase()} meetings`,
        )
      }
      if (answers.style && advisor.style !== answers.style) {
        considerations.push(
          `Uses a ${advisor.style.toLowerCase()} style rather than ${answers.style.toLowerCase()}`,
        )
      }
      if (answers.frequency && advisor.frequency !== answers.frequency) {
        considerations.push(
          `Typical availability is ${advisor.frequency.toLowerCase()}`,
        )
      }
      if (advisor.acceptingIntroductions === false) {
        considerations.unshift("Not accepting new introductions right now")
      }
      return {
        advisor,
        score: Math.min(score, 98),
        reasons: reasons.slice(0, 4),
        considerations: considerations.slice(0, 2),
      }
    })
    .sort((a, b) => b.score - a.score || a.advisor.id - b.advisor.id)
}

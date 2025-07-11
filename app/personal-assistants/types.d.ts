interface Profile {
  name: string
  image: string
  theme: string
  personality: {
    verbosity: number
    empathy: number
    humor: number
    formality: number
  }
  tone: "Professional" | "Casual" | "Friendly" | "Formal" | "Conversational"
  traits: string
  suggestedTraits:
    | "professional"
    | "enthusiastic"
    | " creative"
    | "supportive"
    | "detail-oriented"
    | " proactive"
    | "diplomatic"
}

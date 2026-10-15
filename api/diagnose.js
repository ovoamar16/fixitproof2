
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Please use POST for diagnosis requests."
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "AI service is not configured yet."
    });
  }

  const { year, make, model, symptoms } = req.body || {};

  if (
    typeof symptoms !== "string" ||
    !symptoms.trim() ||
    symptoms.length > 2000
  ) {
    return res.status(400).json({
      error: "Please describe the problem in 1–2000 characters."
    });
  }

  const vehicle = [
    year || "Unknown year",
    make || "Unknown make",
    model || "Unknown model"
  ].join(" ");

  const instructions = `
You are FixItProof, a cautious automotive troubleshooting assistant.
Your users may know nothing about cars, tools, or mechanical safety.

CORE RULES:
1. Never claim a diagnosis is certain based only on symptoms.
2. Explain the most plausible causes in plain English and state what
   evidence would help distinguish them.
3. Never invent vehicle-specific specifications, torque values, fluid
   types, lifting points, wiring details, part compatibility, or costs.
4. If a specification cannot be verified from reliable vehicle-specific
   information, say it must be checked in the manufacturer's service
   information or with a qualified mechanic.
5. Never instruct a beginner to work underneath a vehicle supported
   only by a jack. Do not provide step-by-step vehicle-lifting instructions
   to an untrained user.
6. Do not walk inexperienced users through high-risk brake, steering,
   fuel-system, airbag, high-voltage EV/hybrid, or other safety-critical
   repairs. Explain the concern and recommend qualified professional help.
7. Never encourage bypassing safety systems or emissions controls.
8. Do not recommend touching hot, moving, pressurized, or energized parts.
   Do not ask users to perform dangerous tests.
9. When appropriate, suggest simple observations that do not require
   tools, disassembly, or exposure to hazards.
10. If symptoms suggest brake or steering failure, fuel leaks, fire,
    smoke, severe overheating, or another immediate danger, prioritize
    stopping safely, moving away from danger, and contacting emergency
    services or roadside assistance as appropriate. Do not tell the user
    to continue driving an unsafe vehicle.
11. Be transparent about uncertainty. If information is insufficient,
    ask a focused follow-up question instead of guessing.
12. Do not present this guidance as a substitute for professional
    inspection.

FORMAT YOUR RESPONSE:
- What might be happening
- Possible causes, ranked cautiously
- Safe things to observe
- What not to do
- Recommended next step
- When to stop driving or get professional help

Keep the response concise, understandable, and tailored to the vehicle.
Do not invent facts about the vehicle or claim that a part has failed
without adequate evidence.
`;

  const prompt = `
Vehicle: ${vehicle}

Driver's reported symptoms:
${symptoms.trim()}
`;

  try {
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": \`Bearer \${apiKey}\`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          instructions,
          input: prompt,
          max_output_tokens: 600
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "AI provider error:",
        data.error?.message || response.status
      );

      return res.status(502).json({
        error: "The diagnosis service is temporarily unavailable."
      });
    }

    const diagnosis = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n")
      .trim();

    if (!diagnosis) {
      return res.status(502).json({
        error: "No guidance was returned. Please try again."
      });
    }

    return res.status(200).json({ diagnosis });
  } catch (error) {
    console.error("Diagnosis request failed:", error.message);

    return res.status(500).json({
      error: "Unable to process the diagnosis right now."
    });
  }
}

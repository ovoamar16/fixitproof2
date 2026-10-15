
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

  if (!symptoms || typeof symptoms !== "string") {
    return res.status(400).json({
      error: "Please describe the vehicle problem."
    });
  }

  const prompt = [
    "You are FixItProof, an automotive troubleshooting assistant.",
    "Give cautious, understandable guidance, not a definitive diagnosis.",
    "Identify plausible causes, explain safe next steps, and state when a mechanic is needed.",
    "If symptoms suggest unsafe driving, such as brake failure, steering failure, smoke, fuel leaks, or overheating, clearly advise stopping safely and seeking professional help.",
    "Never tell users to perform dangerous repairs.",
    "",
    `Vehicle: ${year || "Unknown"} ${make || ""} ${model || ""}`,
    `Reported symptoms: ${symptoms}`
  ].join("\n");

  try {
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: prompt,
          max_output_tokens: 500
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("AI provider error:", data.error?.message || response.status);
      return res.status(502).json({
        error: "The diagnosis service is temporarily unavailable."
      });
    }

    const diagnosis = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    if (!diagnosis) {
      return res.status(502).json({
        error: "The AI did not return a diagnosis. Please try again."
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

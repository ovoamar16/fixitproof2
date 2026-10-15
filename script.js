
const yearSelect = document.getElementById("year");

for (let y = 2027; y >= 1990; y--) {
  const option = document.createElement("option");
  option.value = y;
  option.textContent = y;
  yearSelect.appendChild(option);
}

document.getElementById("diagnosisForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const year = document.getElementById("year").value;
  const make = document.getElementById("make").value.trim();
  const model = document.getElementById("model").value.trim();
  const symptoms = document.getElementById("problem").value.trim();
  const result = document.getElementById("result");

  if (!year || !make || !model || !symptoms) return;

  result.classList.remove("hidden");
  result.textContent = "Analyzing your vehicle symptoms...";

  try {
    const response = await fetch("/api/diagnose", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        year,
        make,
        model,
        symptoms
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Diagnosis could not be completed.");
    }

    const heading = document.createElement("h3");
    heading.textContent = `${year} ${make} ${model}`;

    const diagnosis = document.createElement("p");
    diagnosis.style.whiteSpace = "pre-wrap";
    diagnosis.textContent = data.diagnosis;

    const disclaimer = document.createElement("p");
    disclaimer.textContent =
      "AI-generated guidance only. This is not a confirmed diagnosis. Have a qualified mechanic inspect safety-critical problems.";

    result.replaceChildren(heading, diagnosis, disclaimer);
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    result.textContent =
      error.message || "Something went wrong. Please try again.";
  }
});

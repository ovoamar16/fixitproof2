const yearSelect = document.getElementById("year");
for(let y=2027;y>=1990;y--){const o=document.createElement("option");o.value=y;o.textContent=y;yearSelect.appendChild(o)}

document.getElementById("diagnosisForm").addEventListener("submit", function(e){
  e.preventDefault();
  const year=document.getElementById("year").value;
  const make=document.getElementById("make").value.trim();
  const model=document.getElementById("model").value.trim();
  const problem=document.getElementById("problem").value.trim();
  const result=document.getElementById("result");
  if(!year||!make||!model||!problem)return;
  result.classList.remove("hidden");
  result.innerHTML=`
    <div class="eyebrow"><span></span> Preliminary analysis</div>
    <h3>${year} ${escapeHtml(make)} ${escapeHtml(model)}</h3>
    <p style="color:#9aadc0">Based on: “${escapeHtml(problem)}”</p>
    <div class="result-grid">
      <div class="result-box"><small>Possible causes</small><strong>Analysis ready</strong></div>
      <div class="result-box"><small>Urgency</small><strong>Needs review</strong></div>
      <div class="result-box"><small>Next step</small><strong>Inspect & verify</strong></div>
    </div>
    <p style="color:#8295aa;font-size:11px;margin-bottom:0">This demo shows the FixItProof experience. A production version would connect this form to the diagnosis engine, vehicle database, repair-cost data, and account system.</p>`;
  result.scrollIntoView({behavior:"smooth",block:"center"});
});

function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

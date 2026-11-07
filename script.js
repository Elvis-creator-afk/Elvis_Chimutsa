// ---------- Data ----------
// Add an `image` URL to any event to show a photo instead of the gradient banner.
const EVENTS = [
  {id:1,title:"CodeSprint Hackathon",cat:"Tech",date:"2026-12-12T09:00",venue:"KIIT Convention Centre, Bhubaneswar",emoji:"💻",c:["#6c4cf1","#3ec6ff"],desc:"A 24-hour hackathon where teams build innovative solutions to real-world problems. Mentors, prizes and food included."},
  {id:2,title:"Odissi Dance Festival",cat:"Cultural",date:"2026-12-20T18:00",venue:"Rabindra Mandap, Bhubaneswar",emoji:"💃",c:["#ff5d8f","#ffa94d"],desc:"An evening celebrating classical Odissi with performances by renowned artists and rising talents."},
  {id:3,title:"UI/UX Design Workshop",cat:"Workshop",date:"2026-11-28T10:30",venue:"Online (Zoom)",emoji:"🎨",c:["#a855f7","#ec4899"],desc:"Hands-on workshop covering Figma, design thinking and building a portfolio-ready prototype."},
  {id:4,title:"Inter-College Football Cup",cat:"Sports",date:"2027-01-09T15:00",venue:"Kalinga Stadium, Bhubaneswar",emoji:"⚽",c:["#1fa971","#a3e635"],desc:"Sixteen college teams battle it out for the championship trophy. Cheer for your campus!"},
  {id:5,title:"Startup Pitch Night",cat:"Business",date:"2027-01-18T17:30",venue:"IIIT Bhubaneswar Auditorium",emoji:"🚀",c:["#f97316","#facc15"],desc:"Founders pitch to investors live. Network with entrepreneurs and learn what makes a pitch win."},
  {id:6,title:"Indie Music Night",cat:"Music",date:"2027-02-06T19:00",venue:"Space 7 Arena, Bhubaneswar",emoji:"🎸",c:["#0ea5e9","#6366f1"],desc:"Live sets from the best indie bands in Eastern India under the open sky."},
  {id:7,title:"AI & Machine Learning Summit",cat:"Tech",date:"2027-02-21T09:30",venue:"Hotel Mayfair Lagoon",emoji:"🤖",c:["#14b8a6","#6366f1"],desc:"Talks and demos from industry experts on generative AI, MLOps and responsible AI."},
  {id:8,title:"Photography Walk",cat:"Workshop",date:"2027-03-07T06:00",venue:"Dhauli Hills",emoji:"📸",c:["#f43f5e","#fb923c"],desc:"Catch the sunrise and learn composition and lighting tips from professional photographers."}
];
const $ = s => document.querySelector(s);
const fmt = d => new Date(d).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"});
const store = {
  get:() => { try { return JSON.parse(localStorage.getItem("registrations")) || []; } catch { return []; } },
  set:v => localStorage.setItem("registrations", JSON.stringify(v))
};
let category = "All", current = null, timer = null;

// ---------- Theme ----------
function setTheme(t){ document.documentElement.dataset.theme = t; $("#themeBtn").textContent = t==="dark"?"☀️":"🌙"; localStorage.setItem("theme",t); }
setTheme(localStorage.getItem("theme") || (matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"));
$("#themeBtn").onclick = () => setTheme(document.documentElement.dataset.theme==="dark"?"light":"dark");

// ---------- Render events ----------
const bg = e => e.image ? `background-image:url(${e.image})` : `background:linear-gradient(135deg,${e.c[0]},${e.c[1]})`;
function renderFilters(){
  const cats = ["All",...new Set(EVENTS.map(e=>e.cat))];
  $("#filters").innerHTML = cats.map(c=>`<button class="chip ${c===category?"active":""}" data-c="${c}">${c}</button>`).join("");
}
function renderGrid(){
  const q = $("#search").value.trim().toLowerCase();
  const list = EVENTS.filter(e => (category==="All"||e.cat===category) && (e.title+e.venue+e.desc+e.cat).toLowerCase().includes(q));
  $("#grid").innerHTML = list.map((e,i)=>`
    <article class="card" data-id="${e.id}" style="animation-delay:${i*60}ms" tabindex="0">
      <div class="banner" style="${bg(e)}">${e.image?"":e.emoji}</div>
      <div class="card-body">
        <span class="tag">${e.cat}</span>
        <h3>${e.title}</h3>
        <p class="meta">📅 ${fmt(e.date)}<br>📍 ${e.venue}</p>
        <p class="meta">${e.desc.slice(0,80)}…</p>
        <button class="btn">View & Register</button>
      </div>
    </article>`).join("");
  $("#empty").hidden = list.length > 0;
}
$("#filters").onclick = e => { if(e.target.dataset.c){ category=e.target.dataset.c; renderFilters(); renderGrid(); } };
$("#search").oninput = renderGrid;
const openFromCard = e => { const c = e.target.closest(".card"); if(c && (e.type==="click"||e.key==="Enter")) openModal(+c.dataset.id); };
$("#grid").onclick = openFromCard; $("#grid").onkeydown = openFromCard;

// ---------- Modal ----------
function openModal(id){
  current = EVENTS.find(e=>e.id===id);
  const b = $("#mBanner"); b.style.cssText = bg(current); b.textContent = current.image?"":current.emoji;
  $("#mCat").textContent = current.cat; $("#mTitle").textContent = current.title;
  $("#mMeta").innerHTML = `📅 ${fmt(current.date)} &nbsp;•&nbsp; 📍 ${current.venue}`;
  $("#mDesc").textContent = current.desc;
  $("#eventSel").innerHTML = `<option value="">-- Select an event --</option>` + EVENTS.map(e=>`<option value="${e.id}">${e.title}</option>`).join("");
  $("#eventSel").value = id;
  $("#regForm").reset(); $("#eventSel").value = id; clearErrors();
  $("#regForm").hidden = false; $("#success").hidden = true;
  $("#modal").hidden = false; document.body.style.overflow = "hidden";
  tick(); clearInterval(timer); timer = setInterval(tick,1000);
}
function closeModal(){ $("#modal").hidden = true; document.body.style.overflow = ""; clearInterval(timer); }
$("#closeBtn").onclick = $("#doneBtn").onclick = closeModal;
$("#modal").onclick = e => { if(e.target.id==="modal") closeModal(); };
document.onkeydown = e => { if(e.key==="Escape" && !$("#modal").hidden) closeModal(); };

// ---------- Countdown ----------
function tick(){
  const ms = new Date(current.date) - Date.now();
  if(ms<=0){ $("#mCount").innerHTML = "<strong>This event has started!</strong>"; return; }
  const p = (n,l)=>`<div><b>${String(n).padStart(2,"0")}</b><span>${l}</span></div>`;
  $("#mCount").innerHTML = p(Math.floor(ms/864e5),"Days")+p(Math.floor(ms/36e5)%24,"Hrs")+p(Math.floor(ms/6e4)%60,"Min")+p(Math.floor(ms/1e3)%60,"Sec");
}

// ---------- Validation ----------
const rules = {
  name:v => /^[A-Za-z][A-Za-z .'-]{1,48}$/.test(v) ? "" : "Enter a valid name (letters only, min 2 characters).",
  email:v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Enter a valid email address.",
  phone:v => /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g,"")) ? "" : "Enter a valid 10-digit mobile number.",
  event:v => v ? "" : "Please select an event."
};
const field = {name:"name",email:"email",phone:"phone",event:"eventSel"};
function check(k){
  const el = $("#"+field[k]), msg = rules[k](el.value.trim());
  $("#"+k+"Err").textContent = msg;
  el.classList.toggle("bad",!!msg); el.classList.toggle("good",!msg);
  return !msg;
}
function clearErrors(){ Object.keys(field).forEach(k=>{ $("#"+k+"Err").textContent=""; $("#"+field[k]).classList.remove("bad","good"); }); }
Object.keys(field).forEach(k => $("#"+field[k]).addEventListener("blur",()=>check(k)));

$("#regForm").onsubmit = e => {
  e.preventDefault();
  if(!Object.keys(field).map(check).every(Boolean)) return;
  const evt = EVENTS.find(x=>x.id==$("#eventSel").value), email = $("#email").value.trim().toLowerCase();
  const all = store.get();
  if(all.some(r=>r.eventId===evt.id && r.email===email)){ $("#emailErr").textContent="This email is already registered for this event."; $("#email").classList.add("bad"); return; }
  all.push({eventId:evt.id,event:evt.title,name:$("#name").value.trim(),email,phone:$("#phone").value.trim(),time:Date.now()});
  store.set(all);
  $("#successMsg").textContent = `Thanks ${$("#name").value.trim()}! You're registered for "${evt.title}". A confirmation will be sent to ${email}.`;
  $("#regForm").hidden = true; $("#success").hidden = false; renderRegs();
};

// ---------- My registrations ----------
function renderRegs(){
  const all = store.get();
  $("#regList").innerHTML = all.length ? all.map((r,i)=>`<li><span><strong>${r.event}</strong><br><small>${r.name} • ${r.email}</small></span><button data-i="${i}">Cancel</button></li>`).join("") : `<li style="border-color:var(--border)">You haven't registered for any events yet.</li>`;
}
$("#regList").onclick = e => { if(e.target.dataset.i){ const a=store.get(); a.splice(+e.target.dataset.i,1); store.set(a); renderRegs(); } };

renderFilters(); renderGrid(); renderRegs();

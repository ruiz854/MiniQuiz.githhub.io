/* ====== Shortcuts ====== */
const $ = s => document.querySelector(s);

/* ====== Identidad del juego (para 1 sola vez) ====== */
const GAME_ID = 'escapeLinealesP4_v2';
const teamKey = (team, section) => `${GAME_ID}::${(section||'').trim().toUpperCase()}::${(team||'').trim().toUpperCase()}`;

/* ====== Estado ====== */
const state = {
  team:'', section:'', secondsLeft:45*60,
  startTime:null, endTime:null, gameOver:false, started:false,
  solved:[false,false,false,false],
  attempted:[false,false,false,false],
  hintsUsed:[false,false,false,false],
  words:[], score:0,
  answers:{ a1:null, a2:{a:null,b:null}, a3:null, a4:null }
};

const timeEl = $('#hudTime'), scoreHudEl = $('#hudScore'), teamHudEl = $('#hudTeam'), sectionHudEl = $('#hudSection');
const hudState = $('#hudState .value'); const scoreTxt = $('#scoreTxt'), wordsEl = $('#words');
const keys = [$('#k1'),$('#k2'),$('#k3'),$('#k4')]; const btnPDF = $('#btnPDF'); 
const lockEl = document.getElementById('lock'); const winEl = document.getElementById('win');

/* ====== Info rápida ====== */
document.getElementById('startInfo').textContent = 'Nota: este juego registra el intento por Equipo+Sección en este navegador.';

/* ====== Chequeo "ya jugó" al escribir campos ====== */
function checkPlayedPreview(){
  const t = (document.getElementById('team').value||'').trim();
  const s = (document.getElementById('section').value||'').trim();
  if(!t || !s){ document.getElementById('startLock').style.display='none'; return; }
  const k = teamKey(t,s);
  const rec = localStorage.getItem(k);
  document.getElementById('startLock').style.display = rec ? 'block' : 'none';
}
['team','section'].forEach(id => document.getElementById(id).addEventListener('input', checkPlayedPreview));

/* ====== Audio / Partículas ====== */
let audioCtx;
function beep(freq=880, dur=120, type='sine', gain=0.03){
  try{
    audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = gain;
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); setTimeout(()=>o.stop(), dur);
  }catch(e){}
}
function playSound(kind){
  if(kind==='ok'){ beep(880,120,'triangle'); }
  else if(kind==='fail'){ beep(300,180,'sawtooth',0.04); }
  else if(kind==='open'){ beep(660,80,'square'); setTimeout(()=>beep(990,80,'square'),90); }
}
function burst(x,y,color='#fff',n=14,spread=90){
  const wrap = document.getElementById('particles');
  for(let i=0;i<n;i++){
    const d=document.createElement('div'); d.className='burst';
    const ang=(Math.random()*spread - spread/2)*(Math.PI/180); const dist=60+Math.random()*60;
    d.style.left=x+'px'; d.style.top=y+'px'; d.style.background=color;
    d.style.setProperty('--dx',(Math.cos(ang)*dist)+'px'); d.style.setProperty('--dy',(Math.sin(ang)*dist)+'px');
    wrap.appendChild(d); setTimeout(()=>wrap.removeChild(d),650);
  }
}

/* ====== Inicio y tiempo ====== */
document.getElementById('btnStart').addEventListener('click', ()=>{
  const name = $('#team').value.trim();
  const section = $('#section').value.trim();
  if(!name || !section){
    document.getElementById('startWarn').style.display='block';
    return;
  }
  const key = teamKey(name, section);
  if(localStorage.getItem(key)){
    // Ya jugó: bloquear inicio
    document.getElementById('startLock').style.display='block';
    return;
  }
  // Registrar intento al iniciar (evita reinicios para repetir)
  localStorage.setItem(key, JSON.stringify({startedAt: new Date().toISOString(), finished:false}));

  document.getElementById('startWarn').style.display='none';
  state.team = name; state.section = section;
  teamHudEl.textContent = state.team; sectionHudEl.textContent = state.section;

  document.getElementById('start').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');

  startTimer();
  hudState.textContent='En juego';
  state.started = true;
  lockEl.style.display='none'; 
  winEl.style.display='none';
});

let tickInterval=null;
function startTimer(){
  state.startTime = new Date();
  state.secondsLeft = 45*60;
  renderTime();
  if(tickInterval) clearInterval(tickInterval);
  tickInterval = setInterval(()=>{
    if(!state.started || state.gameOver) return;
    state.secondsLeft--;
    if(state.secondsLeft<=0){
      state.secondsLeft=0; stopTimer();
      document.getElementById('game').classList.add('hidden');
      lockEl.style.display='flex';
      hudState.textContent='Tiempo agotado';
      // Marcar finalizado también si se acabó el tiempo
      persistFinish();
      return;
    }
    renderTime();
  },1000);
}
function stopTimer(){ if(tickInterval){ clearInterval(tickInterval); tickInterval=null; } }
function renderTime(){
  const m = Math.floor(state.secondsLeft/60), s = state.secondsLeft%60;
  timeEl.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

/* ====== Hints (una vez) ====== */
document.getElementById('hint1').addEventListener('click', ()=>showHint(0,'h1','#hint1'));
document.getElementById('hint2').addEventListener('click', ()=>showHint(1,'h2','#hint2'));
document.getElementById('hint3').addEventListener('click', ()=>showHint(2,'h3','#hint3'));
document.getElementById('hint4').addEventListener('click', ()=>showHint(3,'h4','#hint4'));
function showHint(idx, spanId, btnSel){
  if(state.hintsUsed[idx]) return;
  state.hintsUsed[idx]=true;
  document.getElementById(spanId).style.display='inline-flex';
  document.querySelector(btnSel).disabled = true;
}

/* ====== Un intento por reto ====== */
function canInteract(idx){ return !state.attempted[idx] && !state.gameOver && state.started; }

/* ====== Interacciones objetos ====== */
document.getElementById('frameObj').addEventListener('click', ()=> { if(canInteract(0)) openModal('m1'); });
document.getElementById('booksObj').addEventListener('click', ()=> { if(canInteract(1)) openModal('m2'); });
document.getElementById('safeObj').addEventListener('click', ()=> { if(canInteract(2)) openModal('m3'); });
document.getElementById('doorObj').addEventListener('click', ()=> { if(canInteract(3)) openModal('m4'); });

function openModal(id){ document.getElementById(id).style.display='flex'; }
function closeModal(id){ document.getElementById(id).style.display='none'; }

/* ====== Parsers ====== */
function parseNumber(tok){
  if(!tok) return NaN;
  tok = tok.replace(/\s+/g,'');
  if(/^-?\d+\/\d+$/.test(tok)){ const [a,b]=tok.split('/').map(Number); return b? a/b : NaN; }
  return Number(tok.replace(',','.'));
}
function parseSlopeIntercept(str){
  if(!str) return null;
  let s = str.toLowerCase().replace(/\s+/g,'').replace('−','-');
  const m1 = s.match(/^y=([-+]?(?:\d+\/\d+|\d*\.?\d+)?)x([+-](?:\d+\/\d+|\d*\.?\d+))?$/);
  const m2 = s.match(/^y=([+-]?(?:\d+\/\d+|\d*\.?\d+))([+-](?:\d+\/\d+|\d*\.?\d+)?)x$/);
  if(m1){
    const m = m1[1]===''||m1[1]==='+' ? 1 : (m1[1]==='-' ? -1 : parseNumber(m1[1]));
    const b = m1[2] ? parseNumber(m1[2]) : 0;
    return {m,b};
  }
  if(m2){
    const b = parseNumber(m2[1]);
    let coef=m2[2];
    const m = coef==='+'?1: (coef==='-'?-1: parseNumber(coef));
    return {m,b};
  }
  return null;
}
function parsePointSlope(str){
  if(!str) return null;
  let s = str.replace(/\s+/g,'').toLowerCase().replace('−','-');
  const re = /^y([+-](?:\d+\/\d+|\d*\.?\d+))?=([+-]?(?:\d+\/\d+|\d*\.?\d+))\((?:x)([+-](?:\d+\/\d+|\d*\.?\d+))?\)$/;
  const m = s.match(re);
  if(!m) return null;
  const yshift = m[1]? parseNumber(m[1]) : 0;
  const slope  = parseNumber(m[2]);
  const xshift = m[3]? parseNumber(m[3]) : 0;
  const x1 = -xshift, y1 = -yshift;
  return {m:slope, b:y1, point:{x:x1,y:y1}};
}

/* ====== Envíos ====== */
function afterSend(e, ok, respSpan, idx, onCorrect){
  respSpan.textContent='✅ Respuesta enviada.'; respSpan.className='pill '+(ok?'ok':'fail');
  state.attempted[idx]=true;
  lockObject(idx);
  if(ok && typeof onCorrect==='function') onCorrect();
  setTimeout(()=>{ closeModal(['m1','m2','m3','m4'][idx]); }, 900);
  checkProgress();
}
function lockObject(idx){
  ['#frameObj','#booksObj','#safeObj','#doorObj'].forEach((sel,i)=>{ if(i===idx) document.querySelector(sel).classList.add('locked'); });
}
function checkProgress(){
  const attemptsDone = state.attempted.every(Boolean);
  if(attemptsDone) finishGame(); 
}

/* Reto 1 */
function send1(e){
  if(!canInteract(0)) return;
  const raw = document.getElementById('a1').value.trim(); state.answers.a1 = raw;
  let ok = false;
  const parsed = parseSlopeIntercept(raw);
  if(parsed){ const {m,b}=parsed; ok = (Math.abs(m + 2)<1e-9 && Math.abs(b - 3)<1e-9); }
  afterSend(e, ok, document.getElementById('r1'), 0, ()=>resolve(0,'EL'));
  document.getElementById('r1').textContent = ok ? '✅ Correcto: y = -2x + 3' : '❌ Revisa el formato y los signos (Ej.: y = mx + b)';
}

/* Reto 2 */
function send2(e){
  if(!canInteract(1)) return;
  const a = (document.getElementById('a2a').value||'').toLowerCase().trim();
  const b = (document.getElementById('a2b').value||'').toLowerCase().trim();
  state.answers.a2 = {a,b};
  const arribaOk = /arriba|sube|\+\s*3/.test(a) && /3/.test(a);
  const abajoOk  = /abajo|baja|-\s*3/.test(b)   && /3/.test(b);
  const ok = arribaOk && abajoOk;
  afterSend(e, ok, document.getElementById('r2'), 1, ()=>resolve(1,'CONOCIMIENTO'));
  document.getElementById('r2').textContent = ok ? '✅ Correcto: y=2x+3 ↑3, y=2x-3 ↓3' : '❌ Usa "arriba 3" y "abajo 3".';
}

/* Reto 3 */
function send3(e){
  if(!canInteract(2)) return;
  const raw = document.getElementById('a3').value.trim(); state.answers.a3 = raw;
  let ok=false;
  const ps = parsePointSlope(raw);
  if(ps){
    const condSlope = Math.abs(ps.m - 4)<1e-9;
    const condPoint = ps.point && Math.abs(ps.point.x + 2)<1e-9 && Math.abs(ps.point.y - 3)<1e-9;
    if(condSlope && condPoint) ok = true;
  }
  if(!ok){
    const si = parseSlopeIntercept(raw);
    if(si){ ok = (Math.abs(si.m-4)<1e-9 && Math.abs(si.b-11)<1e-9); }
  }
  afterSend(e, ok, document.getElementById('r3'), 2, ()=>resolve(2,'ABRE'));
  document.getElementById('r3').textContent = ok ? '✅ Correcto (p.ej. y − 3 = 4(x + 2) ó y = 4x + 11)' : '❌ Revisa: m=4 y pasa por (−2,3).';
}

/* Reto 4 */
function send4(e){
  if(!canInteract(3)) return;
  const raw = document.getElementById('a4').value.trim(); state.answers.a4 = raw;
  const si = parseSlopeIntercept(raw);
  let ok=false;
  if(si){
    const mOk = Math.abs(si.m + 0.5)<1e-9;
    const bOk = Math.abs(si.b - 6.5)<1e-9;
    ok = mOk && bOk;
  }
  afterSend(e, ok, document.getElementById('r4'), 3, ()=>resolve(3,'PUERTAS'));
  document.getElementById('r4').textContent = ok ? '✅ Correcto: y = -0.5x + 6.5' : '❌ Sugerencia: calcula base, luego aplica derecha 2 y arriba 3.';
}
window.send1=send1; window.send2=send2; window.send3=send3; window.send4=send4;

/* ====== Resolver + finalizar ====== */
function resolve(index, word){
  if(state.solved[index]) return;
  state.solved[index]=true; state.words.push(word); state.score+=25;
  scoreHudEl.textContent = String(state.score);
  scoreTxt.textContent = `${state.solved.filter(Boolean).length}/4`;
  updateWords(); keys[index].textContent='✓';
}
function updateWords(){
  wordsEl.innerHTML='';
  state.words.forEach(w=>{const chip=document.createElement('div'); chip.className='chip'; chip.textContent=w; wordsEl.appendChild(chip);});
}
function enablePDFButtons(){
  btnPDF.disabled=false;
  const btn2 = document.getElementById('btnPDF2');
  if(btn2) btn2.disabled=false;
}
function persistFinish(){
  const key = teamKey(state.team, state.section);
  try{
    const prev = JSON.parse(localStorage.getItem(key) || '{}');
    const data = {
      ...prev,
      finished:true,
      finishedAt:new Date().toISOString(),
      score: state.score
    };
    localStorage.setItem(key, JSON.stringify(data));
  }catch(e){}
}
function finishGame(){
  if(state.gameOver) return;
  state.gameOver=true;
  stopTimer();
  timeEl.textContent='00:00';
  hudState.textContent='Juego terminado';
  ['#frameObj','#booksObj','#safeObj','#doorObj'].forEach(sel=>document.querySelector(sel).classList.add('locked'));
  state.endTime = new Date();
  enablePDFButtons();
  persistFinish(); // marcar como finalizado en almacenamiento
  const phrase = state.words.join(' ');
  const elapsed = formatElapsed();
  document.getElementById('summary').textContent =
    `Equipo: ${state.team} • Sección: ${state.section} • Tiempo: ${elapsed} • Puntaje: ${state.score} • Frase: "${phrase}"`;
  winEl.style.display='flex';
}

/* ====== Tiempo transcurrido ====== */
function formatElapsed(){
  if(!state.startTime) return '0m 0s';
  const end = state.endTime || new Date();
  const s = Math.max(0, Math.floor((end - state.startTime)/1000));
  const m = Math.floor(s/60), ss = s%60;
  return `${m}m ${ss}s`;
}

/* ====== PDF ====== */
document.getElementById('btnPDF').addEventListener('click', downloadPDF);
document.getElementById('btnPDF2').addEventListener('click', downloadPDF);

function downloadPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({unit:'pt',format:'a4'});
  const pad=48; let y=pad;
  const elapsed = formatElapsed();
  const now = new Date(); const dateStr = now.toLocaleString();

  // Evalúa resultados
  let r1ok=false; let r1_user = state.answers.a1 || '—'; const r1_correct='y = -2x + 3';
  const p1=parseSlopeIntercept(state.answers.a1); if(p1){ r1ok = Math.abs(p1.m+2)<1e-9 && Math.abs(p1.b-3)<1e-9; }

  const a2=state.answers.a2||{a:'',b:''};
  const r2a=/arriba|sube|\+\s*3/.test((a2.a||'').toLowerCase()) && /3/.test((a2.a||''));
  const r2b=/abajo|baja|-\s*3/.test((a2.b||'').toLowerCase())  && /3/.test((a2.b||''));
  const r2ok = r2a && r2b;
  const r2_user = `a) ${a2.a||'—'} | b) ${a2.b||'—'}`;
  const r2_correct = 'a) arriba 3 | b) abajo 3';

  let r3ok=false; const r3_user=state.answers.a3||'—'; const r3_correct='y − 3 = 4(x + 2)  ó  y = 4x + 11';
  const ps=parsePointSlope(state.answers.a3); if(ps){ r3ok = Math.abs(ps.m-4)<1e-9 && ps.point && Math.abs(ps.point.x+2)<1e-9 && Math.abs(ps.point.y-3)<1e-9; }
  if(!r3ok){ const si=parseSlopeIntercept(state.answers.a3); if(si){ r3ok = Math.abs(si.m-4)<1e-9 && Math.abs(si.b-11)<1e-9; } }

  let r4ok=false; const r4_user=state.answers.a4||'—'; const r4_correct='y = -0.5x + 6.5  (también y = -1/2 x + 13/2)';
  const p4=parseSlopeIntercept(state.answers.a4); if(p4){ r4ok = Math.abs(p4.m+0.5)<1e-9 && Math.abs(p4.b-6.5)<1e-9; }

  const correctas=[r1ok,r2ok,r3ok,r4ok].filter(Boolean).length;
  const puntaje = correctas*25;
  const nota10  = (correctas/4*10).toFixed(2);

  // Cabecera
  doc.setFillColor(240,240,240); doc.rect(0,0,595,842,'F');
  doc.setFillColor(208,0,0); doc.rect(0,0,595,84,'F');
  doc.setFont('helvetica','bold'); doc.setTextColor(255,255,255); doc.setFontSize(20);
  doc.text('Escape Room — Ecuaciones Lineales (Período 4)', pad, 52);

  // Datos
  y=110; doc.setTextColor(20,20,20); doc.setFontSize(12);
  doc.text(`Fecha y hora: ${dateStr}`, pad, y); y+=18;
  doc.text(`Equipo: ${state.team || '—'}`, pad, y); y+=18;
  doc.text(`Sección: ${state.section || '—'}`, pad, y); y+=18;
  doc.text(`Tiempo empleado: ${elapsed}`, pad, y); y+=24;

  // Resultados
  doc.setDrawColor(208,0,0); doc.line(pad,y,595-pad,y); y+=22;
  doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.text('Resultados por reto', pad, y); y+=18;
  const line = (titulo, ok, userAns, correctAns) => {
    doc.setFont('helvetica','bold'); doc.setFontSize(12);
    doc.text(`${titulo}: ${ok ? '✅ Correcto' : '❌ Incorrecto'}`, pad, y); y+=16;
    doc.setFont('helvetica','normal');
    doc.text(`Tu respuesta: ${userAns}`, pad, y); y+=16;
    doc.text(`Respuesta correcta: ${correctAns}`, pad, y); y+=14;
  };
  line('R1 — Pendiente–intersección', r1ok, r1_user, r1_correct);
  line('R2 — Desplazamiento', r2ok, r2_user, r2_correct);
  line('R3 — Punto–pendiente', r3ok, r3_user, r3_correct);
  line('R4 — Aplicación combinada', r4ok, r4_user, r4_correct); y+=8;

  // Resumen
  doc.setDrawColor(208,0,0); doc.line(pad,y,595-pad,y); y+=22;
  doc.setFont('helvetica','bold'); doc.setFontSize(12);
  doc.text(`Correctas: ${correctas} / 4`, pad, y); y+=18;
  doc.text(`Puntaje (0–100): ${puntaje}`, pad, y); y+=18;
  doc.text(`Nota (0–10): ${nota10}`, pad, y);

  doc.save('EscapeRoom-EcuacionesLineales.pdf');
}
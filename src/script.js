// Cuestionario dinámico para Examen LSP
// Generado a partir de bank.sql (38 reactivos actualmente)

const QUESTIONS = [
  {id:1,section:'CNPP',q:`El proceso penal en México es:`,options:{A:`Inquisitivo y escrito`,B:`Acusatorio y oral`,C:`Mixto y reservado`,D:`Administrativo y documental`},answer:'B', explanation:'Porque el sistema penal es acusatorio y oral.'},
  {id:2,section:'CNPP',q:`Son principios rectores del proceso penal, excepto:`,options:{A:`Publicidad`,B:`Contradicción`,C:`Secrecía absoluta`,D:`Inmediación`},answer:'C', explanation:'El principio no es la secrecía absoluta, todo lo contrario, se busca publicidad.'},
  {id:3,section:'CNPP',q:`El principio de publicidad implica que:`,options:{A:`Solo las partes pueden asistir`,B:`Las audiencias son privadas`,C:`El público puede acceder salvo excepciones`,D:`Solo el juez puede presenciar`},answer:'C', explanation:'La publicidad es la regla, con excepciones justificadas.'},
  {id:4,section:'CNPP',q:`El principio de contradicción permite:`,options:{A:`Oponerse a resoluciones firmes`,B:`Conocer y controvertir pruebas`,C:`Suspender audiencias`,D:`Delegar funciones`},answer:'B'},
  {id:5,section:'CNPP',q:`El principio de continuidad significa que las audiencias serán:`,options:{A:`Esporádicas`,B:`Secretas`,C:`Continuas y sucesivas`,D:`Escritas`},answer:'C'},
  {id:6,section:'CNPP',q:`El principio de inmediación exige:`,options:{A:`Delegación en secretarios`,B:`Presencia del órgano jurisdiccional`,C:`Uso exclusivo de medios electrónicos`,D:`Juicios escritos`},answer:'B'},
  {id:7,section:'CNPP',q:`La presunción de inocencia se mantiene hasta:`,options:{A:`Detención`,B:`Vinculación`,C:`Sentencia firme`,D:`Denuncia`},answer:'C'},
  {id:8,section:'CNPP',q:`El doble enjuiciamiento está:`,options:{A:`Permitido`,B:`Prohibido`,C:`Limitado`,D:`Facultado al MP`},answer:'B'},
  {id:9,section:'CNPP',q:`La prisión preventiva es de carácter:`,options:{A:`Obligatorio`,B:`Excepcional`,C:`Permanente`,D:`Administrativo`},answer:'B'},
  {id:10,section:'CNPP',q:`El derecho a la defensa debe ejercerse con:`,options:{A:`Cualquier ciudadano`,B:`Policía`,C:`Defensor titulado`,D:`Ministerio Público`},answer:'C'},
  {id:11,section:'LGV',q:`Son víctimas directas:`,options:{A:`Testigos`,B:`Personas que sufren daño por delito`,C:`Policías`,D:`Servidores públicos`},answer:'B'},
  {id:12,section:'LGV',q:`Las víctimas indirectas son:`,options:{A:`Periodistas`,B:`Familiares de la víctima directa`,C:`MP`,D:`Peritos`},answer:'B'},
  {id:13,section:'LGV',q:`El principio de dignidad implica:`,options:{A:`Discrecionalidad estatal`,B:`Respeto como fin y no medio`,C:`Criminalización`,D:`Reserva procesal`},answer:'B'},
  {id:14,section:'LGV',q:`El principio de buena fe obliga a:`,options:{A:`Sospechar de la víctima`,B:`Presumir su veracidad`,C:`Negar ayuda`,D:`Judicializar todo`},answer:'B'},
  {id:15,section:'LGV',q:`La reparación debe ser:`,options:{A:`Parcial`,B:`Económica únicamente`,C:`Integral y transformadora`,D:`Discrecional`},answer:'C'},
  {id:16,section:'Inteligencia',q:`La inteligencia criminal se enfoca en:`,options:{A:`Ideología`,B:`Organizaciones delictivas`,C:`Partidos políticos`,D:`Opinión pública`},answer:'B'},
  {id:17,section:'Inteligencia',q:`El nivel estratégico de inteligencia busca:`,options:{A:`Capturas inmediatas`,B:`Planeación a mediano y largo plazo`,C:`Detenciones urgentes`,D:`Flagrancia`},answer:'B'},
  {id:18,section:'Inteligencia',q:`El nivel táctico se orienta a:`,options:{A:`Política pública`,B:`Prevención general`,C:`Operativos específicos`,D:`Reformas legislativas`},answer:'C'},
  {id:19,section:'Inteligencia',q:`El ciclo de inteligencia inicia con:`,options:{A:`Difusión`,B:`Recolección`,C:`Planeación`,D:`Retroalimentación`},answer:'B'},
  {id:20,section:'Inteligencia',q:`La etapa final del ciclo es:`,options:{A:`Procesamiento`,B:`Planeación`,C:`Retroalimentación`,D:`Análisis`},answer:'C'},
  {id:21,section:'PrimerRespondiente',q:`El Primer Respondiente debe privilegiar:`,options:{A:`Evidencia`,B:`Detención`,C:`Vida humana`,D:`Persecución`},answer:'C'},
  {id:22,section:'PrimerRespondiente',q:`Los supuestos de actuación del Primer Respondiente son:`,options:{A:`Denuncia, flagrancia y descubrimiento`,B:`Solo flagrancia`,C:`Solo denuncia`,D:`Judicialización`},answer:'A'},
  {id:23,section:'PrimerRespondiente',q:`Si el MP no recibe la puesta a disposición, el policía debe:`,options:{A:`Retirarse`,B:`Informar a su superior y elaborar constancia`,C:`Liberar detenido`,D:`Destruir evidencia`},answer:'B'},
  {id:24,section:'CadenaCustodia',q:`La Cadena de Custodia garantiza:`,options:{A:`Publicidad`,B:`Legalidad administrativa`,C:`Mismidad y autenticidad`,D:`Transparencia presupuestal`},answer:'C'},
  {id:25,section:'CadenaCustodia',q:`La Cadena de Custodia inicia con:`,options:{A:`Juicio`,B:`Sentencia`,C:`Preservación del lugar`,D:`Peritaje final`},answer:'C'},
  {id:26,section:'CadenaCustodia',q:`La apertura del embalaje debe:`,options:{A:`Romper sello original`,B:`Abrirse por lado distinto al sellado`,C:`No documentarse`,D:`Hacerse sin registro`},answer:'B'},
  {id:27,section:'ProteccionDatos',q:`Las medidas de seguridad deben ser:`,options:{A:`Solo técnicas`,B:`Administrativas, físicas y técnicas`,C:`Opcionales`,D:`Verbales`},answer:'B'},
  {id:28,section:'ProteccionDatos',q:`El análisis de riesgo considera:`,options:{A:`Solo tecnología`,B:`Amenazas y vulnerabilidades`,C:`Presupuesto`,D:`Publicidad`},answer:'B'},
  {id:29,section:'ProteccionDatos',q:`Los derechos ARCO significan:`,options:{A:`Archivo, Registro, Consulta, Opinión`,B:`Acceso, Rectificación, Cancelación, Oposición`,C:`Autenticidad, Registro, Control, Observación`,D:`Análisis, Regulación, Control, Organización`},answer:'B'},
  {id:30,section:'Transparencia',q:`La información en posesión de sujetos obligados es:`,options:{A:`Privada`,B:`Reservada`,C:`Pública salvo excepciones`,D:`Confidencial siempre`},answer:'C'},
  {id:31,section:'Transparencia',q:`El acceso a la información es:`,options:{A:`Condicionado`,B:`Gratuito`,C:`Solo judicial`,D:`Discrecional`},answer:'B'},
  {id:32,section:'Transparencia',q:`El solicitante debe justificar interés:`,options:{A:`Sí`,B:`Solo judicialmente`,C:`No`,D:`Solo con abogado`},answer:'C'},
  {id:33,section:'Analisis',q:`El análisis táctico identifica:`,options:{A:`Tendencias a largo plazo`,B:`Patrones para intervención inmediata`,C:`Reformas legislativas`,D:`Política criminal`},answer:'B'},
  {id:34,section:'Analisis',q:`El análisis estratégico examina:`,options:{A:`Escenarios y tendencias`,B:`Detenciones individuales`,C:`Flagrancia`,D:`Audiencias`},answer:'A'},
  {id:35,section:'Analisis',q:`El análisis investigativo busca:`,options:{A:`Presupuesto`,B:`Vincular casos y modus operandi`,C:`Transparencia`,D:`Control administrativo`},answer:'B'},
  {id:36,section:'Analisis',q:`El análisis administrativo se usa para:`,options:{A:`Perfil criminal`,B:`Mapas e indicadores`,C:`Interrogatorio`,D:`Sentencias`},answer:'B'},
  {id:37,section:'Analisis',q:`El análisis operacional evalúa:`,options:{A:`Política pública`,B:`Despliegue de recursos`,C:`Delitos federales`,D:`Tratados internacionales`},answer:'B'},
  {id:38,section:'Analisis',q:`La inteligencia criminal moderna reemplaza doctrinas basadas en:`,options:{A:`Prevención`,B:`Guerra ideológica`,C:`Democracia`,D:`Seguridad pública`},answer:'B'}
];

// variables de estado
let startTime;
const quizEl = document.getElementById('quiz');

function renderQuiz(){
  quizEl.innerHTML = '';
  QUESTIONS.forEach((q,i)=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="qtitle">${i+1}. ${q.section}</div>
      <div class="meta">${q.q}</div>
      <div class="opts">
        ${['A','B','C','D'].map(l=>`<label class="opt"><input type="radio" name="q${i}" value="${l}"> ${q.options[l]}</label>`).join('')}
      </div>
      <div class="explanation" style="display:none;"></div>`;
    quizEl.appendChild(card);
  });
  quizEl.querySelectorAll('input[type=radio]').forEach(inp=>{
    inp.addEventListener('change', updateProgress);
  });
  updateProgress();
}

function updateProgress(){
  const answered = quizEl.querySelectorAll('input[type=radio]:checked').length;
  document.getElementById('pillAnswered').textContent = `Contestadas: ${answered}`;
  document.getElementById('progressText').textContent = `${answered}/${QUESTIONS.length} contestadas`;
  document.getElementById('bar').style.width = `${(answered/QUESTIONS.length)*100}%`;
}

function grade(){
  // require name
  const nameVal = inputName ? inputName.value.trim() : '';
  if(nameVal === ''){
    alert('Por favor ingresa el nombre del cadete antes de calificar.');
    if(inputName) inputName.focus();
    return;
  }
  const answeredInputs = quizEl.querySelectorAll('input[type=radio]:checked');
  let score = 0;
  const wrongSections = {};
  answeredInputs.forEach(inp=>{
    const idx = parseInt(inp.name.slice(1),10);
    if(inp.value === QUESTIONS[idx].answer) {
      score++;
    } else {
      const sec = QUESTIONS[idx].section;
      wrongSections[sec] = (wrongSections[sec]||0)+1;
    }
  });
  const elapsed = Math.floor((new Date() - startTime)/1000);
  const percent = Math.round((score/QUESTIONS.length)*100);
  document.getElementById('pillScore').textContent = `Puntaje: ${score} (${percent}%)`;
  document.getElementById('pillTime').textContent = `Tiempo: ${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`;
  document.getElementById('pillStatus').textContent = 'Calificado';
  document.getElementById('btnExport').disabled = false;

  // feedback
  const feedbackEl = document.getElementById('feedback');
  const feedbackText = document.getElementById('feedbackText');
  if(score === QUESTIONS.length){
    feedbackText.textContent = '¡Felicitaciones! Contestaste todas las preguntas correctamente.';
  } else {
    const sections = Object.keys(wrongSections);
    if(sections.length) {
      feedbackText.textContent = 'Debes reforzar los temas: ' + sections.join(', ') + '.';
    } else {
      feedbackText.textContent = 'Hubo algunas respuestas incorrectas. Repasa el examen.';
    }
  }
  feedbackEl.style.display = 'block';

  // show review icon
  const reviewEl = document.getElementById('reviewIcon');
  if(reviewEl) reviewEl.style.display = 'block';

  // reveal correct answers and explanations
  const cards = quizEl.querySelectorAll('.card');
  cards.forEach((card, i)=>{
    const expl = card.querySelector('.explanation');
    if(!expl) return;
    const correct = QUESTIONS[i].answer;
    const text = `Respuesta correcta: ${correct}. ${QUESTIONS[i].explanation || ''}`;
    expl.textContent = text;
    expl.style.display = 'block';
    const selected = card.querySelector('input[type=radio]:checked');
    if(selected && selected.value === correct) card.classList.add('ok');
    else card.classList.add('bad');
  });
}

function reset(){
  quizEl.querySelectorAll('input[type=radio]').forEach(inp=>inp.checked=false);
  startTime = new Date();
  document.getElementById('pillStatus').textContent = 'Sin calificar';
  document.getElementById('pillScore').textContent = 'Puntaje: ';
  document.getElementById('pillTime').textContent = 'Tiempo: 00:00';
  document.getElementById('btnExport').disabled = true;
  updateProgress();
}

function shuffle(){
  for(let i=QUESTIONS.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [QUESTIONS[i], QUESTIONS[j]] = [QUESTIONS[j], QUESTIONS[i]];
  }
  renderQuiz();
  reset();
}

function exportJSON(){
  const nameVal = inputName ? inputName.value.trim() : '';
  if(nameVal === ''){
    alert('Ingresa el nombre del cadete antes de exportar.');
    if(inputName) inputName.focus();
    return;
  }
  const answeredInputs = quizEl.querySelectorAll('input[type=radio]:checked');
  const answersArr = Array.from(answeredInputs).map(inp=>{
    const idx = parseInt(inp.name.slice(1),10);
    return {id: QUESTIONS[idx].id, answer: inp.value};
  });
  const data = {
    name: nameVal,
    arma: document.getElementById('inputArma').value,
    servicio: document.getElementById('inputServicio').value,
    answers: answersArr,
    timestamp: new Date().toISOString()
  };
  document.getElementById('exportArea').value = JSON.stringify(data,null,2);
}

window.addEventListener('DOMContentLoaded', ()=>{
  renderQuiz();
  reset();
  const title = document.getElementById('examTitle');
  if(title){ title.textContent = `Examen LSP – ${QUESTIONS.length} reactivos (Opción múltiple)`; }
  const build = document.getElementById('buildInfo');
  if(build){ build.textContent = 'Build: 2026-02-27'; }
  // optional: focus name input
  const nameInp = document.getElementById('inputName');
  if(nameInp) nameInp.focus();
});

const btnShuffle = document.getElementById('btnShuffle');
const btnGrade = document.getElementById('btnGrade');
const btnReset = document.getElementById('btnReset');
const btnExport = document.getElementById('btnExport');
const inputName = document.getElementById('inputName');

function updateButtonState(){
  if(inputName && inputName.value.trim() !== ''){
    btnGrade.disabled = false;
  } else {
    btnGrade.disabled = true;
  }
}

if(inputName){
  inputName.addEventListener('input', updateButtonState);
}
if(btnShuffle) btnShuffle.addEventListener('click', shuffle);
if(btnGrade) btnGrade.addEventListener('click', grade);
if(btnReset) btnReset.addEventListener('click', reset);
if(btnExport) btnExport.addEventListener('click', exportJSON);

// initialize button state
updateButtonState();

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
// flow state
let currentIndex = 0;           // index of the question currently shown
let score = 0;                  // number of correct answers
let answersArr = [];            // array of {id,answer} objects
let wrongSections = {};         // track mistakes by section
// input elements will be assigned once DOM content has loaded
let inputName;
let inputYear;
let inputArma;
let inputServicio;
let btnGrade;
let btnShuffle;
let btnReset;
// let btnExport;  // no longer used
let startName, startYear, startArma, startServicio;
let btnStart, btnRestart;
let btnSubmit, btnNext;


// original quiz rendering no longer used

function updateProgress(){
  const answered = answersArr.length;
  document.getElementById('pillAnswered').textContent = `Contestadas: ${answered}/${QUESTIONS.length}`;
  document.getElementById('progressText').textContent = `${answered}/${QUESTIONS.length} contestadas`;
  document.getElementById('bar').style.width = `${(answered/QUESTIONS.length)*100}%`;
}

function showQuestion(i){
  const q = QUESTIONS[i];
  if(!q) return;
  quizEl.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
      <div class="qtitle">${i+1}. ${q.section}</div>
      <div class="meta">${q.q}</div>
      <div class="opts">
        ${['A','B','C','D'].map(l=>`<label class="opt"><input type="radio" name="answer" value="${l}"> ${q.options[l]}</label>`).join('')}
      </div>`;
  quizEl.appendChild(card);
  quizEl.querySelectorAll('input[type=radio]').forEach(inp=>{
    inp.addEventListener('change', ()=>{ if(btnSubmit) btnSubmit.disabled=false; });
  });
  document.getElementById('questionFeedback').textContent = '';
  if(btnSubmit) btnSubmit.disabled = true;
  if(btnNext) btnNext.disabled = true;
  updateProgress();
}

// grade wrapper unreachable now; delegate to finishExam
function grade(){
  finishExam();
}


function reset(){
  currentIndex = 0;
  score = 0;
  answersArr = [];
  wrongSections = {};
  startTime = new Date();
  document.getElementById('pillStatus').textContent = 'Sin calificar';
  document.getElementById('pillScore').textContent = 'Puntaje: ';
  document.getElementById('pillTime').textContent = 'Tiempo: 00:00';
  // no export button to disable
  showQuestion(currentIndex);
}

function shuffle(){
  for(let i=QUESTIONS.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [QUESTIONS[i], QUESTIONS[j]] = [QUESTIONS[j], QUESTIONS[i]];
  }
  reset();
}

function exportJSON(){
  const nameVal = inputName ? inputName.value.trim() : '';
  if(nameVal === ''){
    return '';
  }
  const data = {
    name: nameVal,
    year: inputYear ? inputYear.value : '',
    arma: inputArma ? inputArma.value : '',
    servicio: inputServicio ? inputServicio.value : '',
    answers: answersArr,
    timestamp: new Date().toISOString()
  };
  return JSON.stringify(data,null,2);
}

window.addEventListener('DOMContentLoaded', ()=>{
  // build info & title
  const title = document.getElementById('examTitle');
  if(title){ title.textContent = `Examen LSP – ${QUESTIONS.length} reactivos (Opción múltiple)`; }
  const build = document.getElementById('buildInfo');
  if(build){ build.textContent = 'Build: 2026-02-27'; }

  // start screen elements
  startName = document.getElementById('startName');
  startYear = document.getElementById('startYear');
  startArma = document.getElementById('startArma');
  startServicio = document.getElementById('startServicio');
  btnStart = document.getElementById('btnStart');
  btnRestart = document.getElementById('btnRestart');

  // header is hidden until the exam begins
  const headerEl = document.querySelector('header');
  if(headerEl) headerEl.classList.add('hidden');
  
  // main is hidden until exam starts, startScreen is visible
  const mainEl = document.querySelector('main');
  if(mainEl) mainEl.classList.add('hidden');

  // wire persistent buttons (they exist in DOM even if header hidden)
  btnShuffle = document.getElementById('btnShuffle');
  btnGrade = document.getElementById('btnGrade');
  btnReset = document.getElementById('btnReset');
  if(btnShuffle) btnShuffle.addEventListener('click', shuffle);
  if(btnGrade) btnGrade.addEventListener('click', grade);
  if(btnReset) btnReset.addEventListener('click', reset);

  if(startName) {
    startName.focus();
    startName.addEventListener('input', updateStartButtonState);
  }
  if(startYear) startYear.addEventListener('input', updateStartButtonState);
  if(btnStart) btnStart.addEventListener('click', startExam);
  if(btnRestart) btnRestart.addEventListener('click', restart);

  // wire download button on result screen
  const exportBtn = document.getElementById('btnExportResults');
  if(exportBtn){
    exportBtn.addEventListener('click', ()=>{
      const json = exportJSON();
      if(!json) return;
      const blob = new Blob([json],{type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'examen.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
  // other controls will be wired when exam starts
});

function updateButtonState(){
  if(!btnGrade) return; // nothing to do before exam starts
  if(inputName && inputName.value.trim() !== ''){
    btnGrade.disabled = false;
  } else {
    btnGrade.disabled = true;
  }
  // hide student card if still present (should not exist in new UI)
  const card = document.getElementById('studentInfoCard');
  if(card && inputName && inputName.value.trim() !== '') card.style.display = 'none';
}

function attachEnterClose(element){
  // helper not really needed any more
  element.addEventListener('keydown', e=>{
    if(e.key === 'Enter'){
      // no special behavior now
    }
  });
}

// start-screen handlers
function updateStartButtonState(){
  if(btnStart){
    btnStart.disabled = !(startName && startName.value.trim() && startYear && startYear.value.trim());
  }
}

// navigation callbacks for the one-question flow
function handleSubmit(){
  const q = QUESTIONS[currentIndex];
  const selected = quizEl.querySelector('input[type=radio]:checked');
  if(!selected) return;
  const isCorrect = selected.value === q.answer;
  if(isCorrect){
    score++;
  } else {
    wrongSections[q.section] = (wrongSections[q.section]||0)+1;
  }
  answersArr.push({id: q.id, answer: selected.value});

  // feedback text
  const fb = document.getElementById('questionFeedback');
  fb.textContent = isCorrect ? 'Correcto' : `Incorrecto - ${q.explanation || ''}`;
  fb.classList.toggle('ok', isCorrect);
  fb.classList.toggle('bad', !isCorrect);

  btnSubmit.disabled = true;
  if(currentIndex === QUESTIONS.length - 1){
    btnNext.textContent = 'Terminar';
  } else {
    btnNext.textContent = 'Siguiente';
  }
  btnNext.disabled = false;
  updateProgress();
}

function handleNext(){
  if(btnNext.textContent === 'Terminar'){
    finishExam();
    return;
  }
  currentIndex++;
  showQuestion(currentIndex);
}

function finishExam(){
  // require name
  const nameVal = inputName ? inputName.value.trim() : '';
  if(nameVal === ''){
    alert('Por favor ingresa el nombre antes de calificar.');
    if(inputName) inputName.focus();
    return;
  }
  const elapsed = Math.floor((new Date() - startTime)/1000);
  const percent = Math.round((score/QUESTIONS.length)*100);
  document.getElementById('pillScore').textContent = `Puntaje: ${score} (${percent}%)`;
  document.getElementById('pillTime').textContent = `Tiempo: ${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`;
  document.getElementById('pillStatus').textContent = 'Calificado';

  // show feedback summary
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


  // show result screen
  const resultEl = document.getElementById('resultScreen');
  const resultText = document.getElementById('resultText');
  const suggestionEl = document.getElementById('studySuggestion');
  if(resultEl && resultText && suggestionEl){
    let emoji = '😢';
    if(percent >= 80) emoji = '😃';
    else if(percent >= 50) emoji = '🙂';
    resultText.innerHTML = `<strong>${inputName.value}</strong><br>Año: ${inputYear.value}<br><br>Puntaje: <strong>${score}/${QUESTIONS.length} (${percent}%)</strong> ${emoji}`;
    if(percent >= 80) suggestionEl.textContent = 'Excelente trabajo. Sigue estudiando para mantener tu nivel.';
    else if(percent >= 50) suggestionEl.textContent = 'Buen intento. Dedica más tiempo a repasar los temas.';
    else suggestionEl.textContent = 'Necesitas estudiar más antes del examen.';
    resultEl.style.display = 'flex';
  }

  quizEl.style.display = 'none';
}

function startExam(){
  if(!startName.value.trim() || !startYear.value.trim()){
    alert('Por favor ingresa nombre y año para iniciar el examen.');
    return;
  }
  // map start inputs to global vars expected by other code
  inputName = startName;
  inputYear = startYear;
  inputArma = startArma;
  inputServicio = startServicio;

  document.getElementById('startScreen').classList.add('hidden');
  document.querySelector('main').classList.remove('hidden');
  const headerEl = document.querySelector('header');
  if(headerEl) headerEl.classList.remove('hidden');

  // reset and show first question
  reset();
  showQuestion(currentIndex);
  startTime = new Date();
}

function restart(){
  document.getElementById('resultScreen').style.display = 'none';
  document.getElementById('startScreen').classList.remove('hidden');
  document.querySelector('main').classList.add('hidden');
  const headerEl = document.querySelector('header');
  if(headerEl) headerEl.classList.add('hidden');
  startName.value = '';
  startYear.value = '';
  startArma.value = '';
  startServicio.value = '';
  updateStartButtonState();
}


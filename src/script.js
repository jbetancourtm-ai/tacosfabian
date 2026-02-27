const form = document.getElementById('cadet-form');
const intro = document.getElementById('intro');
const quiz = document.getElementById('quiz');
const result = document.getElementById('result');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('next-btn');
const currentEl = document.getElementById('current');
const resultEmoji = document.getElementById('result-emoji');
const resultText = document.getElementById('result-text');
const scoreText = document.getElementById('score-text');
const advice = document.getElementById('advice');
const restart = document.getElementById('restart');

let cadet = { name: '', year: '', branch: '' };
let current = 0;
let score = 0;
let answers = [];
let wrongCounts = {};

const questions = [
  { q: '¿Cuál es una misión fundamental de las Fuerzas Armadas mexicanas?', options: ['Atacar otros países', 'Defender la soberanía y proteger a la población', 'Organizar eventos políticos', 'Controlar medios de comunicación'], answer: 1, category: 'mision' },
  { q: '¿Qué significa acatar una orden en el servicio militar?', options: ['Seguir una instrucción legítima de la cadena de mando', 'Ignorar superiores', 'Tomar decisiones por cuenta propia siempre', 'Dar órdenes a civiles'], answer: 0, category: 'disciplina' },
  { q: '¿Qué obligación tiene un soldado hacia los civiles en desastres?', options: ['Asistir y apoyar en acciones de protección civil', 'Evitar ayudar', 'Solo observar', 'Cobrar por ayuda'], answer: 0, category: 'servicio' },
  { q: '¿Cuál es una norma básica de conducta militar?', options: ['Mantener disciplina y respeto', 'Faltar a la verdad', 'No cumplir horarios', 'Revelar información clasificada públicamente'], answer: 0, category: 'disciplina' },
  { q: 'La imparcialidad política en activo significa:', options: ['Participar en campañas', 'Mantener neutralidad y no intervenir en política partidista', 'Organizar mítines', 'Dictar leyes'], answer: 1, category: 'ética' },
  { q: '¿Qué debe hacer un militar ante una herida leve en campo?', options: ['Aplicar primeros auxilios básicos y pedir apoyo médico', 'Ignorarla', 'Auto-medicarse sin autorización', 'Continuar sin reportar'], answer: 0, category: 'primeros_auxilios' },
  { q: '¿Cuál es el propósito del adiestramiento físico?', options: ['Mejorar la capacidad para cumplir tareas y seguridad', 'Solo estética', 'Evitar el trabajo', 'Competir con civiles'], answer: 0, category: 'entrenamiento' },
  { q: 'La cadena de mando sirve para:', options: ['Organizar responsabilidades y órdenes claras', 'Confundir al personal', 'Evitar responsabilidades', 'Permitir decisiones anárquicas'], answer: 0, category: 'organizacion' },
  { q: '¿Qué representa con respeto el uso de símbolos nacionales en ceremonias?', options: ['Honor y respeto a la nación', 'Desinterés', 'Protesta', 'Desacato'], answer: 0, category: 'tradicion' },
  { q: 'En cuanto al manejo de equipo, la responsabilidad principal es:', options: ['Mantenerlo en condiciones y reportar fallas', 'Rompelo sin avisar', 'Prestarlo sin control', 'Ignorarlo'], answer: 0, category: 'mantenimiento' },
  { q: 'La seguridad e higiene en puestos y cuarteles busca:', options: ['Proteger la salud del personal y prevenir accidentes', 'Generar trabajo extra', 'Ignorar riesgos', 'Solo estética'], answer: 0, category: 'seguridad' },
  { q: '¿Qué importancia tiene la comunicación con la comunidad?', options: ['Fortalecer confianza y coordinar apoyo en emergencias', 'Evitar contacto', 'Ignorar a la población', 'Imponer acciones'], answer: 0, category: 'servicio' },
  { q: 'El respeto a los derechos humanos se aplica:', options: ['Siempre, en todas las operaciones', 'Solo en tiempos de paz', 'Nunca', 'Solo en ceremonias'], answer: 0, category: 'ética' },
  { q: '¿Cuál es una función del Ejército y Fuerza Aérea en tareas no militares?', options: ['Apoyar en protección civil y emergencias', 'Sustituir al gobierno', 'Actuar como partido político', 'Administrar empresas'], answer: 0, category: 'servicio' },
  { q: '¿Qué debe hacer un cadete ante una duda sobre una orden?', options: ['Consultar a su superior para aclararla', 'Ignorarla', 'Actuar sin preguntar', 'Difundirla públicamente'], answer: 0, category: 'disciplina' },
  { q: 'El uniforme y presentación personal reflejan:', options: ['Profesionalismo y respeto a la institución', 'Indiferencia', 'Rebeldía', 'Moda personal'], answer: 0, category: 'tradicion' },
  { q: 'El entrenamiento técnico (mecánica, comunicaciones, sanidad) sirve para:', options: ['Asegurar capacidades útiles a la unidad y la población', 'Solo ocupar tiempo', 'Crear privilegios', 'Desordenar la unidad'], answer: 0, category: 'entrenamiento' },
  { q: '¿Qué hace la Fuerza Aérea en apoyo a la población?', options: ['Transporte de emergencia, vigilancia y apoyo logístico', 'Intervenir en política', 'Solo exhibiciones', 'Controlar empresas'], answer: 0, category: 'mision' },
  { q: '¿Cuál es un deber legal de los militares respecto a información clasificada?', options: ['Resguardar y no divulgar información sensible', 'Compartirla libremente', 'Publicarla en redes', 'Usarla para beneficio personal'], answer: 0, category: 'ética' },
  { q: 'Al terminar el servicio, un deber importante es:', options: ['Mantener la disciplina y contribuir al civismo', 'Olvidar todo lo aprendido', 'Difamar a la institución', 'Vivir sin responsabilidades'], answer: 0, category: 'disciplina' }
];

const categoryNames = {
  mision: 'Misión y funciones',
  disciplina: 'Disciplina y órdenes',
  servicio: 'Servicio a la comunidad',
  ética: 'Ética y derechos humanos',
  primeros_auxilios: 'Primeros auxilios',
  entrenamiento: 'Entrenamiento',
  organizacion: 'Organización y cadena de mando',
  tradicion: 'Tradición y símbolos',
  mantenimiento: 'Mantenimiento de equipo',
  seguridad: 'Seguridad e higiene'
};

function startQuiz(e){
  e.preventDefault();
  cadet.name = document.getElementById('name').value.trim();
  cadet.year = document.getElementById('year').value;
  cadet.branch = document.getElementById('branch').value.trim();
  if(!cadet.name){ alert('Escribe tu nombre para continuar.'); return }
  intro.classList.add('hidden');
  quiz.classList.remove('hidden');
  current = 0; score = 0; answers = [];
  wrongCounts = {};
  showQuestion();
}

function showQuestion(){
  const q = questions[current];
  currentEl.textContent = current+1;
  questionEl.textContent = q.q;
  optionsEl.innerHTML = '';
  q.options.forEach((opt, i)=>{
    const div = document.createElement('label');
    div.className = 'option';
    div.innerHTML = `<input type="radio" name="opt" value="${i}"> <span>${opt}</span>`;
    div.addEventListener('click', ()=>{
      Array.from(optionsEl.querySelectorAll('.option')).forEach(o=>o.classList.remove('selected'));
      div.classList.add('selected');
      nextBtn.disabled = false;
    });
    optionsEl.appendChild(div);
  });
  nextBtn.disabled = true;
}

function handleNext(){
  const selected = optionsEl.querySelector('input[name="opt"]:checked');
  // if not clicked but label selected, find checked by input property
  let choice = null;
  const inputs = optionsEl.querySelectorAll('input[name="opt"]');
  inputs.forEach(i=>{ if(i.checked) choice = Number(i.value) });
  if(choice === null){ // try to infer from .selected
    const sel = optionsEl.querySelector('.option.selected input');
    if(sel) choice = Number(sel.value);
  }
  if(choice === null) return; // safety
  const q = questions[current];
  answers.push(choice);
  if(choice === q.answer){ score++ } else {
    wrongCounts[q.category] = (wrongCounts[q.category] || 0) + 1;
  }
  current++;
  if(current < questions.length){
    showQuestion();
  } else {
    showResult();
  }
}

function showResult(){
  quiz.classList.add('hidden');
  result.classList.remove('hidden');
  const pct = Math.round((score / questions.length) * 100);
  let emoji = '⚠️';
  if(pct >= 90) emoji = '🏅';
  else if(pct >= 70) emoji = '👍';
  else if(pct >= 50) emoji = '🙂';
  resultEmoji.textContent = emoji;
  resultText.textContent = `Cadete ${cadet.name} (${cadet.branch || '—'}), año ${cadet.year}`;
  scoreText.textContent = `Resultado: ${score} / ${questions.length} (${pct}%)`;
  // determine area to improve
  let toStudy = null;
  let maxWrong = 0;
  for(const k in wrongCounts){ if(wrongCounts[k] > maxWrong){ maxWrong = wrongCounts[k]; toStudy = k } }
  if(toStudy){
    advice.textContent = `Área a reforzar: ${categoryNames[toStudy] || toStudy}. Te recomendamos repasar temas relacionados.`;
  } else {
    advice.textContent = '¡Buen desempeño! Revisa los temas generales para mejorar aún más.';
  }
}

function restartQuiz(){
  result.classList.add('hidden');
  intro.classList.remove('hidden');
}

form.addEventListener('submit', startQuiz);
nextBtn.addEventListener('click', handleNext);
restart.addEventListener('click', restartQuiz);

function autoStart(){
  // Si ya hay un nombre en el formulario, no preguntar
  const existing = document.getElementById('name').value.trim();
  if(existing) return;
  const n = prompt('Nombre del cadete (dejar vacío para usar formulario):');
  if(!n) return; // si cancela o deja vacío, permitir usar el formulario manual
  const y = prompt('Año (1-5):','1');
  const b = prompt('Arma o servicio (Ej. Infantería, Fuerza Aérea):','');
  document.getElementById('name').value = n;
  if(y && ['1','2','3','4','5'].includes(y)) document.getElementById('year').value = y;
  document.getElementById('branch').value = b || '';
  // llamar startQuiz sin evento real (proveer preventDefault)
  startQuiz({ preventDefault: ()=>{} });
}

window.addEventListener('DOMContentLoaded', autoStart);

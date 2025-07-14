document.addEventListener("DOMContentLoaded", () => {
  const formScreen = document.getElementById("formScreen");
  const mainApp = document.getElementById("mainApp");
  const chatScreen = document.getElementById("chatScreen");
  const recipesScreen = document.getElementById("recipesScreen");
  const chatBox = document.getElementById("chatBox");
  const datosForm = document.getElementById("datosForm");
  const chatForm = document.getElementById("chatForm");
  const saludoPrincipal = document.getElementById("saludoPrincipal");
  const alergiasBtns = document.getElementById("alergiasBtns");

  // Modo oscuro guardado
  if (localStorage.getItem("nutribot_darkmode") === "on") {
    document.body.classList.add("dark");
  }


  // Mostrar pantalla principal si hay datos guardados
  const datosGuardados = localStorage.getItem("nutribot_datos");
  if (datosGuardados) {
    const datos = JSON.parse(datosGuardados);
    formScreen.classList.add("hidden");
    mainApp.classList.remove("hidden");
    saludoPrincipal.innerHTML = `Hola 👋 ${datos.nombre}, soy <span class="logo">NutriBot</span>`;
  }

  // Manejo del formulario
  datosForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const edad = parseInt(document.getElementById("edad").value);
    const peso = parseFloat(document.getElementById("peso").value);
    const talla = parseFloat(document.getElementById("talla").value) / 100;
    const actividad = document.getElementById("actividad").value;

    if (!nombre || edad <= 0 || peso <= 0 || talla <= 0 || !actividad) {
      alert("Por favor, completa todos los campos correctamente.");
      return;
    }

    const alergias = Array.from(document.querySelectorAll(".alergia-btn.active"))
      .map(btn => btn.textContent);

    const imc = (peso / (talla * talla)).toFixed(2);

    const datos = { nombre, edad, peso, talla, actividad, alergias, imc };
    localStorage.setItem("nutribot_datos", JSON.stringify(datos));

    alert(`Gracias ${nombre}, tu IMC es ${imc}`);
    formScreen.classList.add("hidden");
    mainApp.classList.remove("hidden");
    saludoPrincipal.innerHTML = `Hola 👋 ${nombre}, soy <span class="logo">NutriBot</span>`;
    mostrarGraficoIMC();
  });

  // Chatbot
chatForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("userInput");
  const pregunta = input.value.trim();
  if (!pregunta) return;

  agregarMensaje("user", pregunta);
  input.value = "";

  const respuesta = responderPregunta(pregunta);
  setTimeout(() => agregarMensaje("bot", respuesta), 500);
});

// Mostrar mensaje en el chat
function agregarMensaje(tipo, texto) {
  const msg = document.createElement("div");
  msg.className = `message ${tipo}`;
  msg.innerText = texto;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Base de conocimiento categorizada mejorada para NutriBot
const baseConocimiento = {
  categorias: {
    general: [
      {
        palabraClave: ["hola", "saludos", "buenos dias", "buenas tardes", "que tal", "que onda"],
        respuesta: "¡Hola! Soy NutriBot, tu asistente de nutrición. ¿En qué puedo ayudarte hoy?"
      },
      {
        palabraClave: ["gracias", "agradecer", "muchas gracias", "te lo agradezco"],
        respuesta: "¡De nada! Recuerda que una alimentación balanceada es clave para tu salud. ¿Tienes otra pregunta?"
      },
      {
        palabraClave: ["que eres", "quien eres", "eres un bot", "para que sirves"],
        respuesta: "Soy NutriBot, un asistente de IA diseñado para darte información y consejos sobre nutrición para adolescentes. ¡Pregúntame lo que quieras!"
      },
      {
        palabraClave: ["ayuda", "ayudar", "necesito ayuda", "orientacion"],
        respuesta: "Claro, estoy aquí para ayudarte con temas de nutrición. ¿Cuál es tu consulta?"
      },
      {
        palabraClave: ["adios", "chau", "hasta luego", "nos vemos"],
        respuesta: "¡Adiós! Que tengas un excelente día y no olvides cuidar tu alimentación. ¡Vuelve pronto!"
      }
    ],
    gruposAlimenticios: [
      { palabraClave: ["proteína", "proteínas", "carne", "huevo", "pollo", "pescado", "legumbres", "queso"], respuesta: "Las **proteínas** son esenciales para construir y reparar músculos, tejidos y para muchas funciones corporales. Las mejores fuentes son: **carnes magras** (pollo, pavo, res), **pescado**, **huevos**, **legumbres** (lentejas, frijoles, garbanzos), **lácteos** (yogur griego, queso fresco) y **tofu**." },
      { palabraClave: ["carbohidrato", "carbohidratos", "energía", "azúcar", "azucares"], respuesta: "Los **carbohidratos** son tu principal fuente de energía. Prefiere los complejos como **cereales integrales** (avena, arroz integral, quinoa), **pan integral**, **papas**, **camote** y **vegetales**. Limita los azúcares simples de golosinas, bebidas azucaradas y alimentos procesados." },
      { palabraClave: ["grasa", "grasas", "lípidos", "aceite", "aguacate", "nueces", "semillas", "omega 3"], respuesta: "Las **grasas saludables** son necesarias para absorber vitaminas, proteger órganos y para la salud cerebral. Consúmelas de fuentes como **aguacate**, **nueces**, **almendras**, **aceite de oliva extra virgen**, **pescados azules** (salmón, atún, caballa), y **semillas** (chía, linaza, girasol). Evita las grasas trans y limita las saturadas." },
      { palabraClabra: ["fibra", "estreñimiento", "digestión", "fibroso"], respuesta: "La **fibra** es crucial para una buena digestión, previene el estreñimiento y te ayuda a sentirte lleno por más tiempo. La encuentras en **frutas** (con cáscara), **verduras**, **cereales integrales**, **legumbres** y **frutos secos**." },
      { palabraClave: ["vitaminas", "minerales", "nutrientes"], respuesta: "Las **vitaminas y minerales** son micronutrientes esenciales para que tu cuerpo funcione correctamente, desde la energía hasta la inmunidad. Una dieta variada con abundantes frutas, verduras, cereales integrales y proteínas es la mejor forma de obtenerlos." }
    ],
    alimentosEspecificos: [
      { palabraClave: ["pollo", "pechuga de pollo"], respuesta: "La **pechuga de pollo** sin piel es una excelente fuente de **proteína magra**. Una porción de 100g de pechuga cocida tiene aproximadamente **31 gramos de proteína** y muy poca grasa, alrededor de 3.6g." },
      { palabraClave: ["huevo", "huevos"], respuesta: "Un **huevo grande** (aproximadamente 50g) tiene alrededor de **6 gramos de proteína**, 5 gramos de grasa (la mayoría en la yema) y unas 70 calorías. Es una fuente completa de proteínas y rico en vitaminas." },
      { palabraClave: ["arroz", "arroz blanco"], respuesta: "100 gramos de **arroz blanco cocido** contienen aproximadamente **28 gramos de carbohidratos**, 2.7 gramos de proteína, y 0.3 gramos de grasa, aportando unas 130 calorías. Si eliges **arroz integral**, tendrá más fibra." },
      { palabraClave: ["pan", "pan blanco"], respuesta: "Una rebanada de **pan blanco** (unos 25g) tiene aproximadamente **13-15 gramos de carbohidratos**, 2-3 gramos de proteína y 0.5-1 gramo de grasa. El **pan integral** aporta más fibra y nutrientes." },
      { palabraClave: ["manzana", "manzanas"], respuesta: "Una **manzana mediana** (unos 180g) contiene aproximadamente **25 gramos de carbohidratos** (la mayoría azúcares naturales), unos 4 gramos de fibra, y menos de 1 gramo de proteína o grasa. Aporta unas 95 calorías." },
      { palabraClave: ["platano", "platanos", "banana", "bananas"], respuesta: "Un **plátano mediano** (unos 118g) tiene aproximadamente **27 gramos de carbohidratos**, 3 gramos de fibra, 1.3 gramos de proteína y 0.4 gramos de grasa, aportando unas 105 calorías. Son ricos en potasio." },
      { palabraClave: ["palta", "aguacate"], respuesta: "Media **palta/aguacate** (unos 100g) aporta alrededor de **15 gramos de grasas saludables** (monoinsaturadas), 2 gramos de proteína, 9 gramos de carbohidratos (de los cuales 7g son fibra), y unas 160 calorías. Es muy nutritivo." },
      { palabraClave: ["lentejas", "legumbres"], respuesta: "Una taza (unos 200g) de **lentejas cocidas** contiene aproximadamente **18 gramos de proteína**, 40 gramos de carbohidratos (16g de fibra) y 0.8 gramos de grasa, con unas 230 calorías. ¡Son una excelente fuente de proteína vegetal y fibra!" },
      { palabraClave: ["yogur", "yogurt"], respuesta: "Un envase de **yogur natural descremado** (unos 150g) puede tener alrededor de **15 gramos de proteína**, 10-15 gramos de carbohidratos (azúcares naturales de la leche) y muy poca grasa, con unas 100-120 calorías. El yogur griego tiene más proteína." },
      { palabraClave: ["leche", "leche descremada"], respuesta: "Una taza (240ml) de **leche descremada** tiene aproximadamente **8 gramos de proteína**, 12 gramos de carbohidratos (lactosa) y 0.4 gramos de grasa, aportando unas 80 calorías. Es una buena fuente de calcio y vitamina D." },
      { palabraClave: ["salmon", "pescado azul"], respuesta: "Un filete de **salmón** (100g) aporta unos **20 gramos de proteína** y 13 gramos de grasas saludables, incluyendo **Omega-3**, con unas 208 calorías. Es excelente para la salud cerebral y cardiovascular." },
      { palabraClave: ["brócoli", "brocoli"], respuesta: "100 gramos de **brócoli cocido** tienen solo unas 34 calorías, 7 gramos de carbohidratos (2.6g de fibra), y 2.4 gramos de proteína. Es rico en Vitamina C y K." }
    ],
    hidratacion: [
      { palabraClave: ["agua", "cuanta agua", "litros de agua", "hidratarse"], respuesta: "La **cantidad de agua** que debe beber un adolescente varía según la actividad y el clima. Generalmente, se recomienda entre **2 a 3 litros al día** (aproximadamente 8 a 12 vasos de 250ml). ¡Mantenerte hidratado es vital para tu energía y concentración!" },
      { palabraClave: ["agua 12 años", "cuanta agua 12", "agua para niño de 12"], respuesta: "Un adolescente de 12 años debería beber al menos **1.8 a 2.5 litros de agua al día** (unos 7 a 10 vasos), especialmente si hace actividad física." },
      { palabraClave: ["agua 14 años", "cuanta agua 14", "agua para adolescente de 14"], respuesta: "Para un adolescente de 14 años, se recomienda beber entre **2 a 2.8 litros de agua al día** (unos 8 a 11 vasos). Es importante aumentarla si haces mucho ejercicio." },
      { palabraClave: ["agua 16 años", "cuanta agua 16", "agua para adolescente de 16"], respuesta: "A los 16 años, tu necesidad de agua puede ser similar a la de un adulto joven: entre **2.5 a 3.5 litros al día** (10 a 14 vasos), dependiendo de tu nivel de actividad y el clima." },
      { palabraClave: ["sodio", "sal", "exceso sal"], respuesta: "El **sodio** (presente en la sal) es necesario en pequeñas cantidades, pero el exceso puede elevar la presión arterial. Limita alimentos procesados, embutidos y snacks salados. Intenta cocinar con menos sal y usar especias." }
    ],
    saludYNutricion: [
      { palabraClave: ["colesterol", "colesterol alto", "grasa en sangre"], respuesta: "Para controlar el **colesterol**, es clave reducir las grasas saturadas y trans (presentes en frituras, bollería, comida rápida). Aumenta el consumo de **fibra** (avena, legumbres, frutas) y **grasas saludables** (aguacate, aceite de oliva, pescado azul)." },
      { palabraClave: ["diabetes", "diabético", "azucar en sangre"], respuesta: "Si tienes **diabetes**, es esencial controlar la ingesta de carbohidratos, especialmente los simples. Prioriza los **integrales**, **verduras**, **proteínas magras** y **grasas saludables**. Siempre consulta a un nutricionista o médico para un plan específico." },
      { palabraClave: ["presión alta", "hipertensión"], respuesta: "Para la **presión alta**, es clave reducir el consumo de **sal** y alimentos muy procesados. Aumenta frutas, verduras, potasio (plátano, papa, espinaca), y limita el alcohol." },
      { palabraClave: ["anemia", "hierro bajo"], respuesta: "La **anemia** a menudo es por falta de **hierro**. Consume **carnes rojas**, **legumbres** (lentejas, frijoles), **espinacas** y otros vegetales de hoja verde. Combínalos con fuentes de Vitamina C (naranja, pimiento) para mejorar la absorción." },
      { palabraClave: ["estreñimiento", "no voy al baño", "dificultad ir al baño"], respuesta: "Si sufres de **estreñimiento**, aumenta tu consumo de **fibra** (frutas con cáscara, verduras, cereales integrales, legumbres) y bebe suficiente **agua**. La actividad física regular también ayuda mucho." },
      { palabraClave: ["obesidad", "sobrepeso", "peso saludable"], respuesta: "El **sobrepeso** y la **obesidad** son un riesgo para la salud. La clave es un balance entre alimentación saludable (menos procesados, más alimentos naturales) y actividad física regular. Busca apoyo profesional para un plan seguro y efectivo." },
      { palabraClave: ["cáncer", "nutricion cancer"], respuesta: "Una dieta rica en frutas, verduras, fibra y antioxidantes puede ayudar a reducir el riesgo de algunos tipos de cáncer. Limita carnes rojas y procesadas, azúcares y grasas saturadas. Consulta a un especialista para información específica." },
      { palabraClave: ["huesos fuertes", "osteoporosis"], respuesta: "Para tener **huesos fuertes**, necesitas **calcio** y **vitamina D**. Consume lácteos, verduras de hoja verde oscuro, pescados grasos y asegúrate de tener exposición solar moderada." }
    ],
    mitosNutricionales: [
      { palabraClave: ["engordar", "engorda", "engordan"], condicionExtra: (txt) => txt.includes("fruta") || txt.includes("noche") || txt.includes("carbohidrato"), respuesta: "Es un **mito** que la fruta o los carbohidratos engorden más de noche. Lo que importa es el total de calorías y la calidad general de tu dieta a lo largo del día, no la hora en que consumes ciertos alimentos." },
      { palabraClave: ["dieta milagro", "dieta rapida", "bajar peso rapido"], respuesta: "⚠️ **Cuidado con las dietas milagro.** Prometen resultados rápidos pero suelen ser muy restrictivas, poco saludables y conllevan un **efecto rebote**. Lo sano es perder peso gradualmente (0.5-1kg por semana) con hábitos sostenibles." },
      { palabraClave: ["detox", "desintoxicar", "limpieza corporal"], respuesta: "Tu cuerpo tiene órganos (hígado, riñones) que se encargan de la **desintoxicación** natural. Las dietas 'detox' extremas no son necesarias y pueden ser perjudiciales. Una dieta saludable y equilibrada es la mejor 'limpieza'." },
      { palabraClave: ["grasas son malas", "evitar grasas"], respuesta: "¡No todas las **grasas** son malas! Las grasas saludables (como las del aguacate, frutos secos, aceite de oliva y pescado azul) son esenciales para tu salud. Lo importante es elegir las adecuadas y consumirlas con moderación. Evita las grasas trans y limita las saturadas." },
      { palabraClave: ["comer cada 2 horas", "muchas comidas"], respuesta: "La frecuencia de las comidas (comer cada 2-3 horas o 3 comidas grandes) depende de cada persona y sus necesidades. Lo importante es la **calidad** y **cantidad total** de lo que comes al día. Escucha a tu cuerpo." },
      { palabraClave: ["desayuno es la comida mas importante"], respuesta: "Si bien el **desayuno** es importante para empezar el día con energía, todas las comidas son relevantes. Lo crucial es que tu alimentación total sea balanceada y nutritiva." }
    ],
    suplementos: [
      { palabraClave: ["suplemento", "suplementos", "proteína en polvo", "creatina", "quemagrasas"], respuesta: "Los **suplementos alimenticios** no son mágicos y no siempre son necesarios si llevas una dieta balanceada. Si estás pensando en tomar alguno, es **FUNDAMENTAL** que primero consultes a un nutricionista o médico para saber si es adecuado para ti, cuál tomar y en qué dosis." },
      { palabraClave: ["vitaminas extra", "multivitaminico"], respuesta: "Generalmente, una dieta variada y equilibrada te proporciona todas las **vitaminas** que necesitas. Los **multivitamínicos** pueden ser útiles en casos de deficiencias o necesidades especiales, pero siempre es mejor que un profesional te los recete." }
    ],
    planificacionComidas: [
      { palabraClave: ["planificar comidas", "menu semanal", "que comer"], respuesta: "¡Excelente idea **planificar tus comidas**! Te ayuda a comer más saludable, ahorrar tiempo y dinero. Empieza por definir tus comidas principales, haz una lista de compras y cocina en lotes si puedes." },
      { palabraClave: ["compras", "lista de compras", "supermercado"], respuesta: "Para unas **compras saludables**: \n1. Haz una lista basada en tu menú semanal.\n2. Compra primero en las secciones de frutas, verduras y alimentos frescos.\n3. Lee las etiquetas nutricionales de los productos envasados.\n4. Evita comprar con hambre para no caer en tentaciones." },
      { palabraClave: ["batch cooking", "cocinar por adelantado"], respuesta: "**Batch cooking** es cocinar grandes cantidades de comida una vez a la semana. Te ahorra tiempo diario y te asegura tener opciones saludables listas. Puedes cocinar cereales, proteínas y picar vegetales." }
    ],
    desarrolloFisico: [
      { palabraClave: ["crecer", "altura", "crecimiento"], respuesta: "Para un **crecimiento** óptimo, tu cuerpo necesita: \n- **Proteínas** (pollo, huevos, legumbres)\n- **Calcio** (lácteos, brócoli)\n- **Vitamina D** (sol, pescado graso)\n- **Zing** (carnes, nueces). Una dieta balanceada y suficiente descanso son clave." },
      { palabraClave: ["musculos", "masa muscular", "ganar musculo"], respuesta: "Para **ganar masa muscular**, necesitas un consumo adecuado de **proteínas** de alta calidad (pollo, pescado, huevos, legumbres) y **carbohidratos complejos** para energía. Además, el entrenamiento de fuerza y un buen descanso son esenciales." }
    ],
    emocionesYComida: [
      { palabraClave: ["comer por ansiedad", "estres", "ansiedad", "comer emocional"], respuesta: "Si sientes ganas de **comer por ansiedad o estrés**, intenta identificar si es hambre real. Busca otras formas de manejar esas emociones: salir a caminar, hablar con alguien, escuchar música. Ten snacks saludables a mano." },
      { palabraClave: ["adiccion azucar", "adiccion comida chatarra"], respuesta: "La **adicción al azúcar o a la comida chatarra** es un problema común. Intenta reducir su consumo gradualmente, sustitúyelos por frutas o snacks saludables y busca apoyo si sientes que te supera." }
    ],
    dietasPopulares: [
      { palabraClave: ["keto", "dieta keto", "cetogénica"], respuesta: "La **dieta cetogénica (keto)** es muy baja en carbohidratos, alta en grasas. Puede ser efectiva para algunos, pero es restrictiva y no apta para todos, especialmente adolescentes. Requiere supervisión médica para evitar deficiencias." },
      { palabraClabra: ["mediterránea", "dieta mediterranea"], respuesta: "La **dieta mediterránea** es considerada una de las más saludables: se basa en vegetales, frutas, legumbres, cereales integrales, aceite de oliva, pescado, y consumo moderado de lácteos y aves. Es antiinflamatoria y buena para el corazón." },
      { palabraClave: ["vegana", "vegetariana", "plant based"], respuesta: "Las **dietas veganas o vegetarianas** pueden ser muy saludables si están bien planificadas. Asegúrate de obtener suficientes proteínas combinando legumbres y cereales, y presta atención a nutrientes como B12, hierro, calcio y Omega-3, que pueden necesitar suplementación." }
    ]
  },
  defaultResponses: [
    "No estoy seguro de entender esa pregunta. ¿Podrías intentar reformularla o ser más específico?",
    "Mi conocimiento se centra en la nutrición para adolescentes y adultos jóvenes. ¿Te gustaría saber sobre algún alimento en particular, una dieta específica o un consejo de salud?",
    "Lo siento, no tengo información precisa sobre ese tema en este momento. Te recomiendo consultar a un profesional de la salud o un nutricionista para obtener una respuesta personalizada.",
    "Para darte una mejor respuesta, ¿podrías ser más claro con lo que buscas? Por ejemplo, '¿Cuántas calorías tiene una manzana?' o '¿Qué alimentos son buenos para el cerebro?'"
  ]
};

function responderPregunta(p) {
  const texto = p.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  for (const categoria of Object.values(baseConocimiento.categorias)) {
    for (const item of categoria) {
      for (const palabra of item.palabraClave) {
        if (texto.includes(palabra.toLowerCase())) {
          if (!item.condicionExtra || item.condicionExtra(texto)) {
            return item.respuesta;
          }
        }
      }
    }
  }
  const respuestas = baseConocimiento.defaultResponses;
  return respuestas[Math.floor(Math.random() * respuestas.length)];
}

// Mensaje de bienvenida automático
window.onload = function() {
  mostrarMensaje("¡Hola! Soy NutriBot, tu asistente de nutrición. ¿En qué puedo ayudarte hoy?");
};

function mostrarMensaje(mensaje) {
  const chatBox = document.getElementById("chatBox");
  const nuevoMensaje = document.createElement("div");
  nuevoMensaje.className = "mensaje-bot";
  nuevoMensaje.innerText = mensaje;
  chatBox.appendChild(nuevoMensaje);
  chatBox.scrollTop = chatBox.scrollHeight;
} // Asegúrate de tener un div con id="chatBox" en tu HTML

  // Crear botones de alergias
  const ALERGIAS = [
    "Leche de vaca", "Huevos", "Cacahuetes (maní)", "Frutos secos",
    "Soja", "Trigo", "Pescado", "Mariscos", "Apio", "Mostaza",
    "Sésamo", "Sulfitos", "Altramuces"
  ];

  ALERGIAS.forEach(nombre => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "alergia-btn";
    btn.textContent = nombre;
    btn.addEventListener("click", () => btn.classList.toggle("active"));
    alergiasBtns.appendChild(btn);
  });

  // Autocompletar nombre
  const datos = JSON.parse(localStorage.getItem("nutribot_datos"));
  if (datos?.nombre) {
    document.getElementById("nombre").value = datos.nombre;
  }
});

// Modo oscuro
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  const modo = document.body.classList.contains("dark") ? "on" : "off";
  localStorage.setItem("nutribot_darkmode", modo);
}

// Navegación entre pantallas
function volverAlMenu() {
  ocultarTodo();
  document.getElementById("mainApp").classList.remove("hidden");
}
function showChat() {
  ocultarTodo();
  document.getElementById("chatScreen").classList.remove("hidden");
}
function showRecipes() {
  ocultarTodo();
  document.getElementById("recipesScreen").classList.remove("hidden");
}
function ocultarTodo() {
  document.querySelectorAll(".container").forEach(el => el.classList.add("hidden"));
}

// Mostrar receta personalizada
function mostrarReceta(tipo) {
  const recetas = {
    desayuno: {
      nombre: "Avena con frutas y huevo",
      ingredientes: ["1 taza de avena", "1 banana", "5 fresas", "1 huevo sancochado", "1 vaso de leche semidescremada"],
      calorias: 350,
      proteinas: "14g",
      grasas: "8g",
      precio: "S/ 4.50",
      contiene: ["lactosa"]
    },
    almuerzo: {
      nombre: "Arroz con pollo y ensalada",
      ingredientes: ["1 presa de pollo", "1 taza de arroz", "1/2 taza de arvejas y zanahorias", "Ensalada de lechuga y tomate", "Jugo de maracuyá"],
      calorias: 600,
      proteinas: "32g",
      grasas: "15g",
      precio: "S/ 6.80",
      contiene: []
    },
    cena: {
      nombre: "Ensalada de atún con galletas integrales",
      ingredientes: ["1 lata de atún en agua", "1/2 palta", "Lechuga y tomate", "4 galletas integrales", "1 yogur natural"],
      calorias: 400,
      proteinas: "25g",
      grasas: "10g",
      precio: "S/ 5.20",
      contiene: ["lactosa"]
    }
  };

  const datos = JSON.parse(localStorage.getItem("nutribot_datos")) || { alergias: [] };
  const receta = recetas[tipo];
  let advertencia = "";

  if (receta.contiene.some(al => datos.alergias.includes(al))) {
    advertencia = "<strong>⚠️ Esta receta contiene ingredientes que podrías no tolerar.</strong><br><br>";
  }

  const html = `
    <strong>${receta.nombre}</strong><br><br>
    <u>Ingredientes:</u><br>
    <ul>${receta.ingredientes.map(i => `<li>${i}</li>`).join("")}</ul>
    <br>
    <u>Valor nutricional:</u><br>
    Calorías: ${receta.calorias} kcal<br>
    Proteínas: ${receta.proteinas}<br>
    Grasas: ${receta.grasas}<br>
    <br>
    <u>Presupuesto estimado:</u> ${receta.precio}<br><br>
    ${advertencia}
  `;

  document.getElementById("recetaResultado").innerHTML = html;
}

// Reiniciar todo
function reiniciarTodo() {
  if (confirm("¿Seguro que quieres borrar tus datos?")) {
    localStorage.clear();
    location.reload();
  }
}
function mostrarOpcionesPlan() {
  document.getElementById("mainMenu").classList.add("hidden");
  document.getElementById("planOpciones").classList.remove("hidden");
}

function volverAlMenu() {
  // Eliminar pantalla automática si existe
  const pantallaAuto = document.getElementById("planAutomaticoScreen");
  if (pantallaAuto) pantallaAuto.remove();

  // Ocultar todas las pantallas (excepto mainApp)
  document.querySelectorAll(".container:not(#mainApp)").forEach(el => {
    el.classList.add("hidden");
  });

  // 🔥 NUEVO: Asegurar que también se oculte planOpciones (por si sigue visible)
  const planOpciones = document.getElementById("planOpciones");
  if (planOpciones) {
    planOpciones.classList.add("hidden");
  }

  // Mostrar pantalla principal
  const mainApp = document.getElementById("mainApp");
  if (mainApp) {
    mainApp.classList.remove("hidden");
    mainApp.classList.remove("visible");
    void mainApp.offsetWidth;
    mainApp.classList.add("visible");
  }

  // Asegurar que el menú principal se muestre
  const mainMenu = document.getElementById("mainMenu");
  if (mainMenu) {
    mainMenu.classList.remove("hidden");
  }

  // Volver arriba suavemente
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Función principal
function generarPlanAutomatico() {
  ocultarTodo();

  const planes = [
    {
    titulo: "Recetario Semanal",
    dias: {
      Lunes: {
        desayuno: {
          nombre: "Avena con plátano y almendras",
          calorias: 320,
          proteinas: "10g",
          grasas: "7g",
          precio: "S/ 3.50",
          img: "imagenes/avena_banana_almendras.jpg",
    preparacion: [
      "Calienta una taza de agua o leche en una olla.",
      "Agrega la avena y cocina a fuego medio por 5-7 minutos.",
      "Corta el plátano en rodajas y agrégalo cuando la avena esté cocida.",
      "Añade las almendras troceadas por encima.",
      "Sirve caliente. Opcional: agrega un toque de miel."
    ]
        },
        almuerzo: {
          nombre: "Pollo al horno con arroz integral y ensalada",
          calorias: 620,
          proteinas: "35g",
          grasas: "14g",
          precio: "S/ 7.00",
          img: "imagenes/pollo_horno.jpeg",
          preparacion: [
                    "Precalienta el horno a 180°C (350°F).",
                    "Sazona la pieza de pollo con sal, pimienta y hierbas.",
                    "Hornea el pollo por 30-40 minutos o hasta que esté cocido.",
                    "Cocina el arroz integral según las instrucciones del paquete.",
                    "Prepara una ensalada fresca con lechuga, tomate y pepino.",
                    "Sirve el pollo con el arroz y la ensalada."
                ]
        },
        cena: {
          nombre: "Sopa de verduras con huevo duro",
          calorias: 280,
          proteinas: "12g",
          grasas: "6g",
          precio: "S/ 3.00",
          img: "imagenes/sopa_verduras.png",
           preparacion: [
                    "Pica varias verduras (zanahoria, apio, zapallo, papa).",
                    "Sofríe ligeramente en una olla con un poco de aceite.",
                    "Agrega agua o caldo y cocina hasta que las verduras estén suaves.",
                    "Sazona al gusto.",
                    "Hierve un huevo hasta que esté duro, pélalo y córtalo en cuartos.",
                    "Sirve la sopa caliente con el huevo duro."
                ]
        },
      },
      Martes: {
        desayuno: {
          nombre: "Pan integral con palta y tomate",
          calorias: 300,
          proteinas: "8g",
          grasas: "9g",
          precio: "S/ 2.80",
          img: "imagenes/pan_palta.avif",
           preparacion: [
                    "Tuesta 2 rebanadas de pan integral.",
                    "Aplasta 1/2 palta madura y sazónala con sal y pimienta.",
                    "Corta 1 tomate en rodajas finas.",
                    "Unta la palta sobre las tostadas y coloca las rodajas de tomate encima.",
                    "Opcional: rocía con un poco de aceite de oliva."
                ]
        },
        almuerzo: {
          nombre: "Guiso de lentejas con zanahoria y arroz",
          calorias: 590,
          proteinas: "25g",
          grasas: "11g",
          precio: "S/ 6.50",
          img: "imagenes/lentejas.jpg",
           preparacion: [
                    "Lava y remoja las lentejas si es necesario.",
                    "Sofríe cebolla, ajo y zanahoria picada en una olla.",
                    "Agrega las lentejas, agua o caldo, y cocina hasta que estén tiernas.",
                    "Sazona con comino, orégano y sal.",
                    "Sirve el guiso de lentejas acompañado de arroz blanco."
                ]
        },
        cena: {
          nombre: "Tortilla de espinaca con pan integral",
          calorias: 350,
          proteinas: "15g",
          grasas: "8g",
          precio: "S/ 3.80",
          img: "imagenes/tortilla_espinaca.jpg",
           preparacion: [
                    "Bate 2 huevos con sal y pimienta.",
                    "Añade espinacas picadas (frescas o congeladas y escurridas).",
                    "Calienta un poco de aceite en una sartén antiadherente.",
                    "Vierte la mezcla y cocina hasta que cuaje por ambos lados.",
                    "Sirve la tortilla caliente con 1 rebanada de pan integral."
                ]
        },
      },
      Miércoles: {
        desayuno: {
          nombre: "Yogur griego con frutos rojos y granola",
          calorias: 310,
          proteinas: "18g",
          grasas: "5g",
          precio: "S/ 4.00",
          img: "imagenes/yogur_frutos_rojos.jpeg",
           preparacion: [
                    "En un bol, coloca 1 taza de yogur griego natural.",
                    "Añade 1/2 taza de frutos rojos frescos o congelados (fresas, arándanos).",
                    "Espolvorea 2 cucharadas de granola sin azúcar añadida.",
                    "Puedes agregar un chorrito de miel si deseas un toque dulce."
                ]
        },
        almuerzo: {
          nombre: "Pescado a la plancha con puré de papa y brócoli al vapor",
          calorias: 580,
          proteinas: "30g",
          grasas: "12g",
          precio: "S/ 8.00",
          img: "imagenes/pescado_plancha.jpg",
          preparacion: [
                    "Sazona un filete de pescado (perico, merluza) con sal, pimienta y limón.",
                    "Cocínalo en una sartén antiadherente con poco aceite hasta que esté dorado.",
                    "Hierve papas hasta que estén suaves y prepáralas como puré con un poco de leche.",
                    "Cocina brócoli al vapor hasta que esté tierno pero crujiente.",
                    "Sirve el pescado con el puré y el brócoli."
                ]
        },
        cena: {
          nombre: "Ensalada de quinua con verduras frescas",
          calorias: 320,
          proteinas: "10g",
          grasas: "7g",
          precio: "S/ 4.50",
          img: "imagenes/ensalada_quinua.jpg",
          preparacion: [
                    "Lava la quinua y cocínala con 2 tazas de agua por cada taza de quinua.",
                    "Deja enfriar la quinua cocida.",
                    "Pica tomate, pepino, pimiento y cebolla morada.",
                    "Mezcla la quinua con las verduras picadas.",
                    "Aliña con aceite de oliva, limón, sal y pimienta."
                ]
        },
      },
      Jueves: {
        desayuno: {
          nombre: "Batido de frutas con espinaca y proteína en polvo",
          calorias: 290,
          proteinas: "20g",
          grasas: "3g",
          precio: "S/ 5.00",
          img: "imagenes/batido_verde.jpg",
          preparacion: [
                    "En una licuadora, combina 1 plátano, 1/2 taza de espinacas frescas.",
                    "Agrega 1 scoop de proteína en polvo (opcional), 1 taza de leche vegetal o agua.",
                    "Licúa hasta obtener una consistencia suave y homogénea.",
                    "Sirve inmediatamente."
                ]
        },
        almuerzo: {
          nombre: "Seco de res con frijoles y arroz",
          calorias: 650,
          proteinas: "38g",
          grasas: "15g",
          precio: "S/ 7.50",
          img: "imagenes/seco_res.jpg",
          preparacion: [
                    "Corta la carne de res en trozos y séllala en una olla.",
                    "En la misma olla, sofríe cebolla, ajo y ají amarillo.",
                    "Agrega la carne, culantro licuado y caldo. Cocina hasta que la carne esté tierna.",
                    "Hierve los frijoles y sazónalos.",
                    "Sirve el seco de res con arroz y frijoles."
                ]
        },
        cena: {
          nombre: "Ensalada de atún con lechuga y tomate",
          calorias: 300,
          proteinas: "25g",
          grasas: "8g",
          precio: "S/ 4.00",
          img: "imagenes/ensalada_atun.png",
          preparacion: [
                    "Escurre una lata de atún en agua o aceite.",
                    "Pica lechuga, tomate y cebolla morada.",
                    "Mezcla el atún con las verduras.",
                    "Aliña con aceite de oliva, vinagre, sal y pimienta."
                ]
        },
      },
      Viernes: {
        desayuno: {
          nombre: "Huevos revueltos con tostadas integrales y jugo de naranja",
          calorias: 350,
          proteinas: "15g",
          grasas: "10g",
          precio: "S/ 4.20",
          img: "imagenes/huevos_tostadas.jpg",
          preparacion: [
                    "Bate 2 huevos con un chorrito de leche, sal y pimienta.",
                    "Cocínalos en una sartén caliente con poco aceite hasta que estén revueltos.",
                    "Tuesta 2 rebanadas de pan integral.",
                    "Prepara un jugo de naranja natural.",
                    "Sirve los huevos revueltos con las tostadas y el jugo."
                ]
        },
        almuerzo: {
          nombre: "Pasta integral con salsa de tomate casera y pollo desmenuzado",
          calorias: 600,
          proteinas: "30g",
          grasas: "10g",
          precio: "S/ 6.80",
          img: "imagenes/pasta_pollo.jpg",
          preparacion: [
                    "Cocina la pasta integral según las instrucciones del paquete.",
                    "Prepara una salsa de tomate casera con tomates frescos, ajo y albahaca.",
                    "Cocina una pechuga de pollo y desmenúzala.",
                    "Mezcla la pasta con la salsa y el pollo desmenuzado."
                ]
        },
        cena: {
          nombre: "Crema de zapallo con crutones",
          calorias: 270,
          proteinas: "8g",
          grasas: "5g",
          precio: "S/ 3.20",
          img: "imagenes/crema_zapallo.jpg",
           preparacion: [
                    "Pica zapallo, cebolla y ajo.",
                    "Sofríe la cebolla y el ajo, luego añade el zapallo y caldo.",
                    "Cocina hasta que el zapallo esté tierno, luego licúa hasta obtener una crema suave.",
                    "Corta pan integral en cubos y tuéstalos en el horno o sartén para hacer crutones.",
                    "Sirve la crema caliente con los crutones."
                ]
        },
      },
      Sábado: {
        desayuno: {
          nombre: "Panqueques de avena con frutas y miel",
          calorias: 380,
          proteinas: "12g",
          grasas: "9g",
          precio: "S/ 4.80",
          img: "imagenes/panqueques_avena.jpg",
          preparacion: [
                    "Mezcla avena, huevo, leche y un poco de polvo de hornear hasta obtener una masa ligera.",
                    "Calienta una sartén antiadherente y vierte porciones de la mezcla para formar panqueques.",
                    "Cocina hasta que doren por ambos lados.",
                    "Sirve con frutas picadas (plátano, fresas) y un chorrito de miel."
                ]
        },
        almuerzo: {
          nombre: "Ceviche de pescado con camote y choclo",
          calorias: 550,
          proteinas: "30g",
          grasas: "8g",
          precio: "S/ 9.00",
          img: "imagenes/ceviche.avif",
          preparacion: [
                    "Corta pescado fresco (perico, lenguado) en cubos.",
                    "Marínalo con jugo de limón recién exprimido, ají limo picado, cebolla roja en juliana, culantro picado y sal.",
                    "Deja reposar unos minutos en el refrigerador.",
                    "Sirve el ceviche con rodajas de camote sancochado y granos de choclo cocido."
                ]
        },
        cena: {
          nombre: "Wrap de pollo con verduras y tortilla integral",
          calorias: 380,
          proteinas: "20g",
          grasas: "10g",
          precio: "S/ 5.50",
          img: "imagenes/wrap_pollo.jpg",
          preparacion: [
                    "Cocina una pechuga de pollo y córtala en tiras o desmenúzala.",
                    "Corta verduras frescas (lechuga, tomate, pimiento, cebolla).",
                    "Calienta una tortilla integral de trigo.",
                    "Rellena la tortilla con el pollo y las verduras.",
                    "Opcional: añade un poco de yogur natural o una salsa ligera."
                ]
        },
      },
      Domingo: {
        desayuno: {
          nombre: "Frutas picadas con yogur y chía",
          calorias: 280,
          proteinas: "10g",
          grasas: "6g",
          precio: "S/ 3.50",
          img: "imagenes/frutas_yogur_chia.jpg",
          preparacion: [
                    "Pica una variedad de frutas de temporada (papaya, melón, sandía, uvas).",
                    "En un bol, mezcla las frutas con yogur natural.",
                    "Espolvorea semillas de chía por encima.",
                    "Sirve frío."
                ]
        },
        almuerzo: {
          nombre: "Asado de res con papas al horno y ensalada mixta",
          calorias: 700,
          proteinas: "40g",
          grasas: "20g",
          precio: "S/ 9.50",
          img: "imagenes/asado_res.jpg",
          preparacion: [
                    "Sazona un corte de carne de res para asado (peceto, asado de tira).",
                    "Ásalo en el horno con hierbas y especias hasta que esté tierno.",
                    "Corta papas en gajos y ásalas en el horno con un poco de aceite y romero.",
                    "Prepara una ensalada mixta con lechuga, tomate, pepino y zanahoria."
                ]

        },
        cena: {
          nombre: "Tostadas de aguacate con huevo poché",
          calorias: 330,
          proteinas: "15g",
          grasas: "12g",
          precio: "S/ 4.00",
          img: "imagenes/tostadas_aguacate.jpg",
          preparacion: [
                    "Tuesta 2 rebanadas de pan integral.",
                    "Aplasta 1/2 aguacate maduro y sazónalo con sal y pimienta.",
                    "Para el huevo poché: hierve agua en una olla, reduce el fuego a bajo, crea un remolino con una cuchara y desliza el huevo con cuidado. Cocina por 3-4 minutos.",
                    "Unta el aguacate en las tostadas y coloca el huevo poché encima.",
                    "Opcional: espolvorea un poco de pimentón."
                ]
        },
      },
    },
  },
  {
  titulo: "Recetario Semanal",
  dias: {
    Lunes: {
      desayuno: {
        nombre: "Pan con huevo y avena",
        calorias: 330,
        proteinas: "12g",
        grasas: "9g",
        precio: "S/ 3.20",
        img: "imagenes/pan_huevo.jpeg",
        preparacion: [
                    "Tuesta 1-2 rebanadas de pan.",
                    "Prepara 1-2 huevos revueltos o fritos (con poco aceite).",
                    "Cocina 1/2 taza de avena con agua o leche.",
                    "Sirve todo junto."
                ]
      },
      almuerzo: {
        nombre: "Tallarines verdes con papa y huevo",
        calorias: 650,
        proteinas: "28g",
        grasas: "16g",
        precio: "S/ 6.00",
        img: "imagenes/tallarines_verdes.jpg",
        preparacion: [
                    "Cocina los tallarines según las instrucciones del paquete.",
                    "Licúa espinaca, albahaca, queso fresco, ajo, nueces y aceite para la salsa verde.",
                    "Mezcla la salsa con los tallarines cocidos.",
                    "Sirve con papa sancochada y huevo duro."
                ]
      },
      cena: {
        nombre: "Ensalada de atún con galletas integrales",
        calorias: 380,
        proteinas: "22g",
        grasas: "8g",
        precio: "S/ 4.80",
        img: "imagenes/ensalada_atun.jpeg",
        preparacion: [
                    "Escurre una lata de atún en agua.",
                    "Pica lechuga, tomate y apio.",
                    "Mezcla el atún con las verduras y un poco de mayonesa light o yogur natural.",
                    "Sirve con 4-5 galletas integrales."
                ]
      }
    },
    Martes: {
      desayuno: {
        nombre: "Batido de mango con avena",
        calorias: 310,
        proteinas: "9g",
        grasas: "6g",
        precio: "S/ 2.90",
        img: "imagenes/batido_mango.jpg",
        preparacion: [
                    "En una licuadora, combina 1 mango pelado y picado, 1/2 taza de avena.",
                    "Agrega 1 taza de leche (o bebida vegetal) y un poco de miel si deseas.",
                    "Licúa hasta que esté suave y cremoso."
                ]
      },
      almuerzo: {
        nombre: "Seco de pollo con frejoles y arroz",
        calorias: 680,
        proteinas: "32g",
        grasas: "18g",
        precio: "S/ 7.50",
        img: "imagenes/seco_pollo.jpg",
        preparacion: [
                    "Dora las piezas de pollo en una olla.",
                    "En la misma olla, sofríe cebolla, ajo, ají mirasol y culantro licuado.",
                    "Agrega el pollo, zanahoria y alverjitas, y cocina hasta que el pollo esté tierno.",
                    "Prepara los frijoles cocidos y sazónalos.",
                    "Sirve el seco de pollo con frejoles y arroz."
                ]
      },
      cena: {
        nombre: "Tostadas integrales con queso fresco y tomate",
        calorias: 320,
        proteinas: "14g",
        grasas: "7g",
        precio: "S/ 3.20",
        img: "imagenes/tostadas_queso.jpg",
        preparacion: [
                    "Tuesta 2-3 rebanadas de pan integral.",
                    "Corta queso fresco en rebanadas y tomate en rodajas.",
                    "Coloca el queso y el tomate sobre las tostadas.",
                    "Opcional: espolvorea orégano o albahaca."
                ]
      }
    },
    Miércoles: {
      desayuno: {
        nombre: "Yogur con frutas y avena",
        calorias: 340,
        proteinas: "11g",
        grasas: "5g",
        precio: "S/ 3.00",
        img: "imagenes/yogur_frutas.jpg",
        preparacion: [
                    "En un tazón, combina 1 taza de yogur natural.",
                    "Agrega 1/2 taza de frutas picadas (ej. manzana, pera, uvas).",
                    "Añade 2-3 cucharadas de avena en hojuelas.",
                    "Mezcla y disfruta."
                ]
      },
      almuerzo: {
        nombre: "Pescado sudado con arroz y ensalada",
        calorias: 620,
        proteinas: "34g",
        grasas: "14g",
        precio: "S/ 7.20",
        img: "imagenes/pescado_sudado.jpg",
         preparacion: [
                    "En una olla, sofríe cebolla, tomate y ajo.",
                    "Agrega un filete de pescado y un poco de caldo o agua.",
                    "Cubre y cocina a fuego lento hasta que el pescado esté cocido.",
                    "Sazona con sal, pimienta y culantro.",
                    "Sirve con arroz y una ensalada de verduras frescas."
                ]
      },
      cena: {
        nombre: "Crema de espinaca con pan integral",
        calorias: 300,
        proteinas: "12g",
        grasas: "6g",
        precio: "S/ 3.50",
        img: "imagenes/crema_espinaca.jpeg",
        preparacion: [
                    "Sofríe cebolla y ajo en una olla.",
                    "Añade espinacas frescas, un poco de papa picada y caldo de verduras.",
                    "Cocina hasta que las verduras estén tiernas, luego licúa hasta obtener una crema.",
                    "Sazona al gusto y sirve con una rebanada de pan integral."
                ]
      }
    },
    Jueves: {
      desayuno: {
        nombre: "Panqueques con miel y frutas",
        calorias: 370,
        proteinas: "10g",
        grasas: "9g",
        precio: "S/ 3.60",
        img: "imagenes/panqueques.jpg",
        preparacion: [
                    "Prepara la masa de panqueques (harina, huevo, leche, polvo de hornear).",
                    "Cocina los panqueques en una sartén caliente.",
                    "Sirve con frutas frescas picadas (plátano, fresas) y un chorrito de miel."
                ]
      },
      almuerzo: {
        nombre: "Causa limeña de pollo",
        calorias: 580,
        proteinas: "29g",
        grasas: "15g",
        precio: "S/ 5.80",
        img: "imagenes/causa_pollo.jpg",
         preparacion: [
                    "Prensa papas amarillas cocidas y mezcla con ají amarillo licuado, limón y aceite.",
                    "Prepara un relleno con pollo desmenuzado, mayonesa light, alverjitas y zanahoria.",
                    "Forma capas de papa y relleno.",
                    "Decora con huevo duro y aceitunas."
                ]
      },
      cena: {
        nombre: "Sándwich de huevo con lechuga",
        calorias: 330,
        proteinas: "13g",
        grasas: "7g",
        precio: "S/ 3.10",
        img: "imagenes/sandwich_huevo.jpg",
         preparacion: [
                    "Hierve 2 huevos duros, pélalos y pícalos.",
                    "Mezcla los huevos picados con un poco de mayonesa light, sal y pimienta.",
                    "Rellena 2 rebanadas de pan integral con la mezcla de huevo y hojas de lechuga."
                ]
      }
    },
    Viernes: {
      desayuno: {
        nombre: "Tostadas con palta y huevo",
        calorias: 350,
        proteinas: "14g",
        grasas: "10g",
        precio: "S/ 3.50",
        img: "imagenes/tostadas_palta.avif",
         preparacion: [
                    "Tuesta 2 rebanadas de pan integral.",
                    "Aplasta 1/2 palta y sazónala.",
                    "Prepara 1 huevo cocido a tu gusto (revuelto, frito o pochado).",
                    "Unta la palta en las tostadas y coloca el huevo encima."
                ]
      },
      almuerzo: {
        nombre: "Ají de gallina con arroz",
        calorias: 670,
        proteinas: "30g",
        grasas: "17g",
        precio: "S/ 6.90",
        img: "imagenes/aji_gallina.jpg",
         preparacion: [
                    "Hierve y desmenuza una pechuga de gallina (o pollo).",
                    "Sofríe cebolla, ajo, ají amarillo y ají panca.",
                    "Agrega la gallina desmenuzada, leche evaporada y pan remojado. Cocina hasta espesar.",
                    "Sazona con sal y pimienta.",
                    "Sirve con arroz y decora con huevo y aceitunas."
                ]
      },
      cena: {
        nombre: "Sopa de quinua con verduras",
        calorias: 290,
        proteinas: "11g",
        grasas: "5g",
        precio: "S/ 3.30",
        img: "imagenes/sopa_quinua.jpg",
         preparacion: [
                    "Lava bien la quinua.",
                    "En una olla, sofríe cebolla, ajo y pimiento.",
                    "Agrega la quinua, agua o caldo y verduras picadas (zanahoria, arvejas).",
                    "Cocina hasta que la quinua y las verduras estén tiernas.",
                    "Sazona al gusto."
                ]
      }
    },
    Sábado: {
      desayuno: {
        nombre: "Tamal con pan y café",
        calorias: 400,
        proteinas: "12g",
        grasas: "15g",
        precio: "S/ 4.00",
        img: "imagenes/tamal_pan.jpg",
        preparacion: [
                    "Calienta un tamal (puede ser de pollo o cerdo).",
                    "Sirve con una rebanada de pan.",
                    "Prepara una taza de café negro o con leche al gusto."
                ]
      },
      almuerzo: {
        nombre: "Arroz chaufa de verduras",
        calorias: 600,
        proteinas: "22g",
        grasas: "14g",
        precio: "S/ 6.20",
        img: "imagenes/chaufa_verduras.jpg",
         preparacion: [
                    "Calienta aceite en un wok o sartén grande.",
                    "Saltea verduras picadas (brócoli, zanahoria, col, pimiento).",
                    "Agrega arroz cocido frío, tortilla de huevo en tiras, salsa de soya y un poco de aceite de ajonjolí.",
                    "Saltea todo junto a fuego alto."
                ]
      },
      cena: {
        nombre: "Tortilla de verduras con pan",
        calorias: 340,
        proteinas: "13g",
        grasas: "6g",
        precio: "S/ 3.40",
        img: "imagenes/tortilla_verduras.jpg",
         preparacion: [
                    "Bate 2 huevos con sal y pimienta.",
                    "Añade verduras picadas (ej. cebolla, pimiento, calabacín).",
                    "Cocina la mezcla en una sartén con poco aceite hasta que cuaje.",
                    "Sirve con una rebanada de pan."
                ]
      }
    },
    Domingo: {
      desayuno: {
        nombre: "Empanada con jugo natural",
        calorias: 360,
        proteinas: "10g",
        grasas: "14g",
        precio: "S/ 3.80",
        img: "imagenes/empanada_jugo.avif",
         preparacion: [
                    "Calienta una empanada de carne o queso (horneada es preferible).",
                    "Prepara un jugo natural de tu fruta favorita (naranja, papaya, piña).",
                    "Sirve la empanada con el jugo."
                ]
      },
      almuerzo: {
        nombre: "Pescado frito con arroz y ensalada",
        calorias: 690,
        proteinas: "33g",
        grasas: "19g",
        precio: "S/ 7.80",
        img: "imagenes/pescado_frito.jpg",
        preparacion: [
                    "Sazona un filete de pescado y fríelo en poco aceite hasta que esté dorado y cocido.",
                    "Cocina arroz blanco.",
                    "Prepara una ensalada fresca con lechuga, tomate y cebolla.",
                    "Sirve el pescado frito con arroz y ensalada."
                ]
      },
      cena: {
        nombre: "Sándwich de atún con palta",
        calorias: 330,
        proteinas: "18g",
        grasas: "10g",
        precio: "S/ 3.90",
        img: "imagenes/sandwich_atun.jpg",
        preparacion: [
                    "Escurre una lata de atún en agua.",
                    "Aplasta 1/2 palta y mézclala con el atún, sal y pimienta.",
                    "Rellena 2 rebanadas de pan integral con la mezcla."
                ]
      }
    }
  }
},
{
    titulo: "Recetario Semanal",
    dias: {
      Lunes: {
        desayuno: {
          nombre: "Smoothie de frutas con semillas de chía",
          calorias: 290,
          proteinas: "8g",
          grasas: "5g",
          precio: "S/ 3.80",
          img: "imagenes/smoothie_chia.jpg",
          preparacion: [
                    "En una licuadora, combina 1 plátano, 1/2 taza de frutos rojos (frescos o congelados).",
                    "Agrega 1 cucharada de semillas de chía y 1 taza de leche (o bebida vegetal).",
                    "Licúa hasta obtener una mezcla suave.",
                    "Sirve inmediatamente."
                ]
        },
        almuerzo: {
          nombre: "Estofado de carne con papas y arroz",
          calorias: 680,
          proteinas: "35g",
          grasas: "18g",
          precio: "S/ 7.20",
          img: "imagenes/estofado_carne.jpg",
          preparacion: [
                    "Corta carne de res en cubos y séllala en una olla.",
                    "Sofríe cebolla, ajo, zanahoria y arvejas.",
                    "Agrega la carne, pasta de tomate y caldo. Cocina a fuego lento hasta que la carne esté tierna.",
                    "Añade papas en cubos y cocina hasta que estén suaves.",
                    "Sirve con arroz."
                ]
        },
        cena: {
          nombre: "Omelette de claras con champiñones y tostada integral",
          calorias: 290,
          proteinas: "15g",
          grasas: "6g",
          precio: "S/ 3.60",
          img: "imagenes/omelette_champiñones.jpeg",
          preparacion: [
                    "Bate 3 claras de huevo con sal y pimienta.",
                    "Saltea champiñones laminados en una sartén con poco aceite.",
                    "Vierte las claras sobre los champiñones y cocina hasta que cuaje el omelette.",
                    "Sirve con 1 rebanada de pan integral tostado."
                ]
        },
      },
      Martes: {
        desayuno: {
          nombre: "Tostadas de queso cottage y mermelada sin azúcar",
          calorias: 270,
          proteinas: "12g",
          grasas: "4g",
          precio: "S/ 3.00",
          img: "imagenes/tostadas_cottage.jpg",
           preparacion: [
                    "Tuesta 2 rebanadas de pan integral.",
                    "Unta cada tostada con queso cottage.",
                    "Agrega una cucharadita de mermelada sin azúcar por encima."
                ]
        },
        almuerzo: {
          nombre: "Saltado de vainitas con arroz y huevo frito",
          calorias: 610,
          proteinas: "28g",
          grasas: "14g",
          precio: "S/ 6.80",
          img: "imagenes/saltado_vainitas.jpg",
          preparacion: [
                    "Corta vainitas en trozos y saltealás en un wok o sartén grande con cebolla y tomate.",
                    "Sazona con salsa de soya y un poco de vinagre.",
                    "Fríe un huevo con poco aceite.",
                    "Sirve el saltado de vainitas con arroz y el huevo frito encima."
                ]
        },
        cena: {
          nombre: "Sopa de lentejas con verduras",
          calorias: 310,
          proteinas: "14g",
          grasas: "6g",
          precio: "S/ 3.90",
          img: "imagenes/sopa_lentejas.jpeg",
          preparacion: [
                    "Lava y cocina lentejas hasta que estén tiernas.",
                    "Sofríe cebolla, ajo, zanahoria y apio picados.",
                    "Agrega las lentejas cocidas, caldo de verduras y hierbas aromáticas.",
                    "Cocina por unos minutos más y sazona al gusto."
                ]
        },
      },
      Miércoles: {
        desayuno: {
          nombre: "Fruta picada con granola y miel",
          calorias: 330,
          proteinas: "7g",
          grasas: "8g",
          precio: "S/ 3.20",
          img: "imagenes/fruta_granola.jpg",
          preparacion: [
                    "Pica una variedad de frutas de tu elección (ej. manzana, pera, plátano).",
                    "Colócalas en un bol.",
                    "Espolvorea granola por encima y rocía con un poco de miel."
                ]
        },
        almuerzo: {
          nombre: "Arroz con pollo y ensalada cocida",
          calorias: 640,
          proteinas: "30g",
          grasas: "16g",
          precio: "S/ 7.00",
          img: "imagenes/arroz_pollo.jpg",
           preparacion: [
                    "Dora piezas de pollo en una olla.",
                    "Sofríe cebolla, ajo, ají amarillo y culantro licuado.",
                    "Agrega el arroz, alverjitas y zanahoria, y caldo de pollo.",
                    "Cocina hasta que el arroz esté graneado y el pollo tierno.",
                    "Sirve con ensalada de zanahoria y vainitas cocidas."
                ]
        },
        cena: {
          nombre: "Ensalada de garbanzos con vegetales frescos",
          calorias: 300,
          proteinas: "12g",
          grasas: "7g",
          precio: "S/ 4.20",
          img: "imagenes/ensalada_garbanzos.jpg",
           preparacion: [
                    "Escurre y enjuaga una lata de garbanzos.",
                    "Pica tomate, pepino, pimiento y cebolla morada.",
                    "Mezcla los garbanzos con las verduras.",
                    "Aliña con aceite de oliva, limón, sal y pimienta."
                ]
        },
      },
      Jueves: {
        desayuno: {
          nombre: "Avena cocida con manzana y canela",
          calorias: 300,
          proteinas: "9g",
          grasas: "6g",
          precio: "S/ 3.00",
          img: "imagenes/avena_manzana.jpeg",
           preparacion: [
                    "Calienta 1 taza de agua o leche en una olla.",
                    "Agrega 1/2 taza de avena en hojuelas y cocina hasta que espese.",
                    "Incorpora trozos de manzana y una pizca de canela.",
                    "Sirve caliente."
                ]
        },
        almuerzo: {
          nombre: "Cau cau de mondongo con arroz",
          calorias: 590,
          proteinas: "28g",
          grasas: "13g",
          precio: "S/ 6.50",
          img: "imagenes/cau_cau.jpg",
           preparacion: [
                    "Limpia y cocina el mondongo hasta que esté tierno, luego pícalo.",
                    "Sofríe cebolla, ajo, ají amarillo, palillo y hierbabuena.",
                    "Agrega el mondongo, papas en cubos y un poco de caldo.",
                    "Cocina hasta que las papas estén cocidas.",
                    "Sirve con arroz."
                ]
        },
        cena: {
          nombre: "Brochetas de pollo con pimientos y cebolla",
          calorias: 360,
          proteinas: "25g",
          grasas: "9g",
          precio: "S/ 5.00",
          img: "imagenes/brochetas_pollo.jpeg",
           preparacion: [
                    "Corta pechuga de pollo en cubos y pimientos de colores y cebolla en trozos.",
                    "Ensarta alternando pollo y verduras en brochetas.",
                    "Cocina a la plancha o en el horno hasta que el pollo esté cocido y las verduras tiernas.",
                    "Sazona al gusto."
                ]
        },
      },
      Viernes: {
        desayuno: {
          nombre: "Café con leche descremada y tostada con miel",
          calorias: 280,
          proteinas: "8g",
          grasas: "5g",
          precio: "S/ 2.70",
          img: "imagenes/cafe_leche_tostada.jpg",
           preparacion: [
                    "Prepara una taza de café.",
                    "Añade leche descremada al gusto.",
                    "Tuesta 1 rebanada de pan integral y úntale un poco de miel."
                ]
        },
        almuerzo: {
          nombre: "Spaghetti con salsa bolognesa de carne magra",
          calorias: 630,
          proteinas: "32g",
          grasas: "15g",
          precio: "S/ 7.10",
          img: "imagenes/spaghetti_bolognesa.jpg",
          preparacion: [
                    "Cocina el spaghetti integral según las instrucciones.",
                    "Sofríe cebolla y ajo, luego añade carne molida magra y cocina hasta que dore.",
                    "Agrega salsa de tomate triturado, hierbas (orégano, albahaca) y cocina a fuego lento.",
                    "Mezcla la salsa con el spaghetti cocido."
                ]
        },
        cena: {
          nombre: "Ensalada César con pollo grillado (sin aderezo cremoso)",
          calorias: 390,
          proteinas: "30g",
          grasas: "11g",
          precio: "S/ 5.80",
          img: "imagenes/ensalada_cesar_pollo.jpg",
           preparacion: [
                    "Cocina una pechuga de pollo a la parrilla o a la plancha y córtala en tiras.",
                    "Lava y trocea lechuga romana.",
                    "Prepara crutones de pan integral.",
                    "Mezcla la lechuga, pollo, crutones y un aderezo ligero (limón, aceite de oliva, mostaza Dijon)."
                ]
        },
      },
      Sábado: {
        desayuno: {
          nombre: "Huevos duros con rodajas de tomate y queso fresco",
          calorias: 310,
          proteinas: "16g",
          grasas: "10g",
          precio: "S/ 3.40",
          img: "imagenes/huevos_duros_tomate.jpg",
           preparacion: [
                    "Hierve 2 huevos hasta que estén duros.",
                    "Pélalos y córtalos en rodajas.",
                    "Corta un tomate en rodajas y unas lonchas de queso fresco.",
                    "Sirve todo junto."
                ]
        },
        almuerzo: {
          nombre: "Locro de zapallo con arroz",
          calorias: 570,
          proteinas: "20g",
          grasas: "12g",
          precio: "S/ 6.00",
          img: "imagenes/locro_zapallo.avif",
          preparacion: [
                    "Sofríe cebolla, ajo y ají amarillo.",
                    "Agrega zapallo macre picado, papa, choclo, alverjitas y espinaca.",
                    "Cocina con un poco de caldo hasta que el zapallo esté tierno.",
                    "Añade queso fresco picado al final.",
                    "Sirve con arroz."
                ]
        },
        cena: {
          nombre: "Chupín de pescado y verduras",
          calorias: 320,
          proteinas: "20g",
          grasas: "7g",
          precio: "S/ 4.50",
          img: "imagenes/chupin_pescado.jpg",
          preparacion: [
                    "Sofríe cebolla, ajo y tomate.",
                    "Agrega trozos de pescado (cabrilla, bonito), papa, zanahoria y caldo.",
                    "Cocina hasta que el pescado y las verduras estén cocidos.",
                    "Añade hierbabuena picada al final."
                ]
        },
      },
      Domingo: {
        desayuno: {
          nombre: "Tostadas francesas con frutos del bosque",
          calorias: 390,
          proteinas: "11g",
          grasas: "10g",
          precio: "S/ 4.50",
          img: "imagenes/tostadas_francesas.jpg",
          preparacion: [
                    "Bate huevos con un poco de leche, vainilla y canela.",
                    "Remoja rebanadas de pan integral en la mezcla.",
                    "Cocina en una sartén con poco aceite hasta que estén doradas por ambos lados.",
                    "Sirve con frutos del bosque (arándanos, frambuesas) y un chorrito de miel."
                ]
        },
        almuerzo: {
          nombre: "Parihuela de mariscos (sin arroz)",
          calorias: 600,
          proteinas: "40g",
          grasas: "15g",
          precio: "S/ 10.00",
          img: "imagenes/parihuela.jpg",
           preparacion: [
                    "Sofríe cebolla, ajo, ají panca y ají mirasol.",
                    "Agrega una mezcla de mariscos (pescado, camarones, calamares, conchas).",
                    "Añade un poco de chicha de jora o vino blanco y caldo de pescado.",
                    "Cocina a fuego medio hasta que los mariscos estén cocidos.",
                    "Sirve caliente con culantro picado."
                ]
        },
        cena: {
          nombre: "Vegetales asados con pechuga de pollo desmenuzada",
          calorias: 350,
          proteinas: "28g",
          grasas: "9g",
          precio: "S/ 5.20",
          img: "imagenes/vegetales_asados_pollo.avif",
          preparacion: [
                    "Corta vegetales (brócoli, pimientos, zanahorias, cebolla) en trozos grandes.",
                    "Mézclalos con aceite de oliva, sal, pimienta y hierbas.",
                    "Ásalos en el horno hasta que estén tiernos y ligeramente dorados.",
                    "Cocina una pechuga de pollo, desmenúzala y mézclala con los vegetales asados."
                ]
        },
      },
    },
  },
{
    titulo: "Recetario Semanal",
    dias: {
        Lunes: {
            desayuno: {
                nombre: "Sándwich integral de pavo y lechuga",
                calorias: 340,
                proteinas: "18g",
                grasas: "7g",
                precio: "S/ 3.90",
                img: "imagenes/sandwich_pavo.jpg",
                preparacion: [
                    "Tuesta 2 rebanadas de pan integral.",
                    "Coloca una capa de hojas de lechuga fresca.",
                    "Añade 2-3 lonchas de pechuga de pavo.",
                    "Opcional: puedes poner una rodaja de tomate o pepino."
                ]
            },
            almuerzo: {
                nombre: "Picante de carne con papas y arroz",
                calorias: 670,
                proteinas: "34g",
                grasas: "17g",
                precio: "S/ 7.30",
                img: "imagenes/picante_carne.avif",
                preparacion: [
                    "Corta carne de res en trozos pequeños y cocínala.",
                    "Prepara un aderezo con cebolla, ajo y ají panca.",
                    "Mezcla la carne con el aderezo, papas en cubos y un poco de caldo.",
                    "Cocina hasta que las papas estén tiernas y la salsa espese.",
                    "Sirve con arroz blanco."
                ]
            },
            cena: {
                nombre: "Ensalada de espinacas con huevo cocido y champiñones",
                calorias: 290,
                proteinas: "12g",
                grasas: "6g",
                precio: "S/ 3.80",
                img: "imagenes/ensalada_espinaca_huevo.jpg",
                preparacion: [
                    "Lava bien las espinacas frescas.",
                    "Hierve 1 huevo hasta que esté duro y córtalo en cuartos.",
                    "Saltea champiñones laminados en una sartén con poco aceite.",
                    "Mezcla las espinacas, el huevo y los champiñones.",
                    "Aliña con aceite de oliva, limón, sal y pimienta."
                ]
            },
        },
        Martes: {
            desayuno: {
                nombre: "Pan integral con hummus y pepino",
                calorias: 310,
                proteinas: "10g",
                grasas: "8g",
                precio: "S/ 3.20",
                img: "imagenes/pan_hummus.jpg",
                preparacion: [
                    "Tuesta 2 rebanadas de pan integral.",
                    "Unta cada tostada con hummus.",
                    "Corta un pepino en rodajas finas y colócalas encima."
                ]
            },
            almuerzo: {
                nombre: "Chaufa de pollo bajo en grasa",
                calorias: 620,
                proteinas: "30g",
                grasas: "14g",
                precio: "S/ 6.90",
                img: "imagenes/chaufa_pollo_ligero.jpg",
                preparacion: [
                    "Corta pechuga de pollo en cubos y cocínala.",
                    "Calienta un wok o sartén grande con poco aceite.",
                    "Saltea ajo, jengibre y cebolla china.",
                    "Agrega arroz cocido frío, el pollo, tortilla de huevo en tiras, salsa de soya baja en sodio.",
                    "Saltea todo a fuego alto."
                ]
            },
            cena: {
                nombre: "Sopa de lentejas rojas y vegetales",
                calorias: 300,
                proteinas: "13g",
                grasas: "5g",
                precio: "S/ 3.70",
                img: "imagenes/sopa_lentejas_rojas.jpg",
                preparacion: [
                    "Sofríe cebolla, ajo y zanahoria picados.",
                    "Agrega lentejas rojas (no necesitan remojo), caldo de verduras y especias.",
                    "Cocina hasta que las lentejas estén tiernas y se deshagan ligeramente.",
                    "Sirve caliente."
                ]
            },
        },
        Miércoles: {
            desayuno: {
                nombre: "Batido de yogur con plátano y avena",
                calorias: 330,
                proteinas: "15g",
                grasas: "6g",
                precio: "S/ 3.50",
                img: "imagenes/batido_yogur_platano.jpg",
                preparacion: [
                    "En una licuadora, combina 1 yogur natural (o griego), 1 plátano.",
                    "Agrega 2-3 cucharadas de avena en hojuelas y un poco de leche si es necesario.",
                    "Licúa hasta obtener una consistencia suave y cremosa."
                ]
            },
            almuerzo: {
                nombre: "Saltado de champiñones con arroz integral",
                calorias: 590,
                proteinas: "28g",
                grasas: "13g",
                precio: "S/ 6.50",
                img: "imagenes/saltado_champiñones.jpg",
                preparacion: [
                    "Corta champiñones en láminas y saltealós en un wok o sartén con cebolla, pimiento y tomate.",
                    "Sazona con salsa de soya, un poco de vinagre y culantro.",
                    "Sirve el saltado con arroz integral."
                ]
            },
            cena: {
                nombre: "Omelette de vegetales",
                calorias: 300,
                proteinas: "12g",
                grasas: "7g",
                precio: "S/ 3.80",
                img: "imagenes/omelette_vegetales.jpg",
                preparacion: [
                    "Bate 2 huevos con sal y pimienta.",
                    "Pica tus vegetales favoritos (ej. espinaca, cebolla, pimiento, tomate).",
                    "Saltea los vegetales en una sartén con poco aceite.",
                    "Vierte los huevos batidos sobre los vegetales y cocina hasta que el omelette esté cuajado."
                ]
            },
        },
        Jueves: {
            desayuno: {
                nombre: "Cereal integral con leche y frutos secos",
                calorias: 360,
                proteinas: "10g",
                grasas: "10g",
                precio: "S/ 3.00",
                img: "imagenes/cereal_frutos_secos.jpg",
                preparacion: [
                    "En un bol, vierte 1 taza de cereal integral (sin azúcar añadido).",
                    "Agrega 1 taza de leche descremada o bebida vegetal.",
                    "Espolvorea un puñado de frutos secos (almendras, nueces) por encima."
                ]
            },
            almuerzo: {
                nombre: "Arroz a la jardinera con huevo frito",
                calorias: 630,
                proteinas: "25g",
                grasas: "15g",
                precio: "S/ 6.00",
                img: "imagenes/arroz_jardinera.jpg",
                preparacion: [
                    "Sofríe cebolla, ajo y ají amarillo.",
                    "Agrega arroz, zanahoria, alverjitas, choclo desgranado y un poco de caldo.",
                    "Cocina hasta que el arroz esté graneado.",
                    "Fríe un huevo con poco aceite.",
                    "Sirve el arroz a la jardinera con el huevo frito encima."
                ]
            },
            cena: {
                nombre: "Ensalada de lentejas y vegetales",
                calorias: 320,
                proteinas: "15g",
                grasas: "8g",
                precio: "S/ 4.00",
                img: "imagenes/ensalada_lentejas_vegetales.jpg",
                preparacion: [
                    "Cocina lentejas hasta que estén tiernas y deja enfriar.",
                    "Pica tomate, pepino, pimiento y cebolla morada.",
                    "Mezcla las lentejas con los vegetales.",
                    "Aliña con aceite de oliva, limón, sal y pimienta."
                ]
            },
        },
        Viernes: {
            desayuno: {
                nombre: "Batido de espinaca, manzana y jengibre",
                calorias: 280,
                proteinas: "7g",
                grasas: "2g",
                precio: "S/ 3.50",
                img: "imagenes/batido_espinaca_jengibre.jpeg",
                preparacion: [
                    "En una licuadora, combina 1 taza de espinaca, 1 manzana verde picada.",
                    "Agrega un trocito de jengibre fresco y 1 taza de agua.",
                    "Licúa hasta que esté muy suave.",
                    "Sirve inmediatamente."
                ]
            },
            almuerzo: {
                nombre: "Lomo saltado de pollo (sin papas fritas)",
                calorias: 650,
                proteinas: "35g",
                grasas: "18g",
                precio: "S/ 7.50",
                img: "imagenes/lomo_saltado_pollo.jpg",
                preparacion: [
                    "Corta pechuga de pollo en tiras gruesas.",
                    "Saltea en un wok o sartén grande con cebolla, tomate, ají amarillo y culantro.",
                    "Añade salsa de soya, vinagre y un poco de caldo.",
                    "Cocina a fuego alto hasta que el pollo esté cocido y las verduras tiernas.",
                    "Sirve con arroz."
                ]
            },
            cena: {
                nombre: "Sopa de pollo desmenuzado con fideos",
                calorias: 340,
                proteinas: "20g",
                grasas: "8g",
                precio: "S/ 4.00",
                img: "imagenes/sopa_pollo_fideos.jpg",
                preparacion: [
                    "Hierve una pechuga de pollo y desmenúzala.",
                    "En una olla, prepara un caldo de pollo con vegetales (zanahoria, apio).",
                    "Agrega fideos cortos y el pollo desmenuzado.",
                    "Cocina hasta que los fideos estén listos y sazona al gusto."
                ]
            },
        },
        Sábado: {
            desayuno: {
                nombre: "Tostadas con mermelada y queso crema light",
                calorias: 300,
                proteinas: "8g",
                grasas: "10g",
                precio: "S/ 3.20",
                img: "imagenes/tostadas_mermelada_queso.png",
                preparacion: [
                    "Tuesta 2 rebanadas de pan integral.",
                    "Unta una capa fina de queso crema light en cada tostada.",
                    "Agrega una cucharadita de mermelada (sin azúcar si es posible) por encima."
                ]
            },
            almuerzo: {
                nombre: "Ajiaco de papa con arroz",
                calorias: 580,
                proteinas: "20g",
                grasas: "15g",
                precio: "S/ 6.50",
                img: "imagenes/ajiaco_papa.jpg",
                preparacion: [
                    "Sofríe cebolla, ajo y ají mirasol.",
                    "Agrega papas amarillas en cubos, habas, choclo y caldo.",
                    "Cocina hasta que las papas estén tiernas y espesa ligeramente con leche.",
                    "Añade huacatay y queso fresco al final.",
                    "Sirve con arroz."
                ]
            },
            cena: {
                nombre: "Crema de brócoli con crutones",
                calorias: 280,
                proteinas: "10g",
                grasas: "6g",
                precio: "S/ 3.50",
                img: "imagenes/crema_brocoli.jpg",
                preparacion: [
                    "Cocina floretes de brócoli con cebolla y ajo en caldo de verduras.",
                    "Licúa hasta obtener una crema suave.",
                    "Sazona al gusto.",
                    "Sirve caliente con crutones de pan integral."
                ]
            },
        },
        Domingo: {
            desayuno: {
                nombre: "Huevos pochados sobre espinacas salteadas",
                calorias: 350,
                proteinas: "18g",
                grasas: "12g",
                precio: "S/ 4.00",
                img: "imagenes/huevos_espinacas.jpg",
                preparacion: [
                    "Saltea espinacas frescas en una sartén con un poco de ajo picado y aceite de oliva.",
                    "Prepara 2 huevos pochados (ver instrucciones en Domingo, Semana 1).",
                    "Sirve los huevos pochados sobre las espinacas salteadas."
                ]
            },
            almuerzo: {
                nombre: "Arroz con pato (versión ligera)",
                calorias: 700,
                proteinas: "40g",
                grasas: "20g",
                precio: "S/ 9.00",
                img: "imagenes/arroz_pato_ligero.jpg",
                preparacion: [
                    "Sella piezas de pato (sin piel, si es posible) en una olla.",
                    "Sofríe cebolla, ajo, ají amarillo y culantro licuado.",
                    "Agrega el pato, chicha de jora o cerveza negra y caldo.",
                    "Cocina hasta que el pato esté tierno, luego añade arroz, alverjitas y zanahoria.",
                    "Sirve con zarza criolla (cebolla y ají limón)."
                ]
            },
            cena: {
                nombre: "Sopa de verduras con pollo desmenuzado",
                calorias: 300,
                proteinas: "22g",
                grasas: "7g",
                precio: "S/ 4.00",
                img: "imagenes/sopa_verduras_pollo.jpg",
                preparacion: [
                    "Prepara un caldo con trozos de pollo y verduras (zanahoria, apio, poro).",
                    "Retira el pollo, desmenúzalo.",
                    "Sirve el caldo con las verduras y el pollo desmenuzado."
                ]
            },
        },
    },
},
  ];

  let planGuardado = localStorage.getItem("nutribot_plan_semanal");
  let planSeleccionado;

  if (planGuardado) {
    planSeleccionado = JSON.parse(planGuardado);
  } else {
    const indice = Math.floor(Math.random() * planes.length);
    planSeleccionado = planes[indice];
  }

  ultimaSemanaMostrada = planSeleccionado;
  mostrarPlan(planSeleccionado, !!planGuardado);
}

// Mostrar visualmente el plan
function mostrarPlan(plan, yaGuardado) {
  let html = `<div class="semana-bloque"><h2>📅 ${plan.titulo}</h2>`;

  for (const dia in plan.dias) {
    const comidas = plan.dias[dia];
    html += `
      <div class="plan-dia">
        <h3>${dia}</h3>
        ${["desayuno", "almuerzo", "cena"].map(tipo => {
          const comida = comidas[tipo];
          const emoji = tipo === "desayuno" ? "🍽️" : tipo === "almuerzo" ? "🍛" : "🌙";
          return `
            <div class="comida">
              <h4>${emoji} ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}: ${comida.nombre}</h4>
              <img src="${comida.img}" class="comida-img" alt="${tipo} ${dia}">
              ${comida.preparacion ? `
  <div class="nutri-info">
    <strong>📝 Preparación:</strong>
    <ol>
      ${comida.preparacion.map(paso => `<li>${paso}</li>`).join("")}
    </ol>
  </div>
` : ""}
              <p><strong>Calorías:</strong> ${comida.calorias} kcal</p>
              <p><strong>Proteínas:</strong> ${comida.proteinas}</p>
              <p><strong>Grasas:</strong> ${comida.grasas}</p>
              <p><strong>Presupuesto:</strong> ${comida.precio}</p>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  html += `</div>`;

  const contenedor = document.createElement("div");
  contenedor.className = "container";
  contenedor.id = "planAutomaticoScreen";
  contenedor.innerHTML = `
    <h1>🥗 Tu plan nutricional</h1>
    <p style="font-style: italic;">Balanceado, económico y saludable.</p>
    ${html}
    ${!yaGuardado ? `
      <button class="btn" onclick="guardarPlanActual()">💾 Guardar este plan</button>
    ` : `
      <button class="btn" onclick="generarNuevoPlan()">🔁 Generar nuevo plan</button>
    `}
    <button class="btn back" onclick="volverAlMenu()">⬅️ Volver</button>
  `;

  document.body.appendChild(contenedor);
}

// Guardar el plan en localStorage
function guardarPlanActual() {
  if (!ultimaSemanaMostrada) return;
  localStorage.setItem("nutribot_plan_semanal", JSON.stringify(ultimaSemanaMostrada));
  alert("✅ Tu plan ha sido guardado correctamente.");
}

// Permitir generar otro plan
function generarNuevoPlan() {
  localStorage.removeItem("nutribot_plan_semanal");
  location.reload();
}


function irAPlanPersonalizado() {
  ocultarTodo();
  document.getElementById("planPersonalizadoScreen").classList.remove("hidden");
}
function generarPlanConAlimentos() {
  const lista = document.getElementById("listaAlimentos").value.trim();
  const resultado = document.getElementById("resultadoPlanPersonalizado");

  if (!lista) {
    alert("Por favor, escribe al menos un alimento.");
    return;
  }

  // Simulación de respuesta de NutriBot
  resultado.innerHTML = `
    <strong>Plan semanal basado en tus alimentos:</strong><br><br>
    <u>Lunes:</u> Arroz con pollo y ensalada<br>
    <u>Martes:</u> Tortilla de huevo con tomate<br>
    <u>Miércoles:</u> Guiso de lentejas con arroz<br>
    <u>Jueves:</u> Pollo al horno con papas<br>
    <u>Viernes:</u> Pasta con salsa de tomate<br>
    <u>Sábado:</u> Ensalada de huevo y arroz<br>
    <u>Domingo:</u> Sopita con verduras y pollo<br><br>
    <em>(Basado en: ${lista})</em>
  `;
}
function generarPlanConAlimentos() {
  const lista = document.getElementById("listaAlimentos").value.trim().toLowerCase();
  const resultado = document.getElementById("resultadoPlanPersonalizado");

  if (!lista) {
    alert("Por favor, escribe al menos un alimento.");
    return;
  }

  const alimentosUsuario = lista.split(",").map(a => a.trim());

  // Recetas base (puedes agregar más)
const recetas = [
  // --- Desayunos ---
  {
    nombre: "Avena con plátano y almendras",
    tipo: "desayuno",
    ingredientes: ["avena", "agua o leche", "plátano", "almendras"],
    calorias: 320,
    proteinas: "10g",
    grasas: "7g",
    precio: "S/ 3.50",
    imagen: "imagenes/avena_almendras.jpg",
  },
  {
    nombre: "Pan integral con palta y tomate",
    tipo: "desayuno",
    ingredientes: ["pan integral", "palta", "tomate", "sal", "pimienta"],
    calorias: 300,
    proteinas: "8g",
    grasas: "9g",
    precio: "S/ 2.80",
    imagen: "imagenes/pan_palta.jpg",
  },
  {
    nombre: "Yogur griego con frutos rojos y granola",
    tipo: "desayuno",
    ingredientes: ["yogur griego", "frutos rojos (fresas, arándanos)", "granola"],
    calorias: 310,
    proteinas: "18g",
    grasas: "5g",
    precio: "S/ 4.00",
    imagen: "imagenes/yogur_frutos_rojos.jpg",
  },
  {
    nombre: "Batido de frutas con espinaca y proteína",
    tipo: "desayuno",
    ingredientes: ["espinaca", "plátano", "mango", "leche descremada", "proteína en polvo (opcional)"],
    calorias: 290,
    proteinas: "20g",
    grasas: "3g",
    precio: "S/ 5.00",
    imagen: "imagenes/batido_verde.jpg",
  },
  {
    nombre: "Huevos revueltos con tostadas integrales y jugo",
    tipo: "desayuno",
    ingredientes: ["huevos", "pan integral", "sal", "pimienta", "jugo de naranja natural"],
    calorias: 350,
    proteinas: "15g",
    grasas: "10g",
    precio: "S/ 4.20",
    imagen: "imagenes/huevos_tostadas.jpg",
  },
  {
    nombre: "Panqueques de avena con frutas y miel",
    tipo: "desayuno",
    ingredientes: ["avena", "huevo", "leche", "frutas (fresas, arándanos)", "miel"],
    calorias: 380,
    proteinas: "12g",
    grasas: "9g",
    precio: "S/ 4.80",
    imagen: "imagenes/panqueques_avena.jpg",
  },
  {
    nombre: "Frutas picadas con yogur y chía",
    tipo: "desayuno",
    ingredientes: ["frutas de estación", "yogur natural", "semillas de chía"],
    calorias: 280,
    proteinas: "10g",
    grasas: "6g",
    precio: "S/ 3.50",
    imagen: "imagenes/frutas_yogur_chia.jpg",
  },
  {
    nombre: "Smoothie de frutas con semillas de chía",
    tipo: "desayuno",
    ingredientes: ["frutas congeladas (mango, piña)", "leche vegetal", "semillas de chía"],
    calorias: 290,
    proteinas: "8g",
    grasas: "5g",
    precio: "S/ 3.80",
    imagen: "imagenes/smoothie_chia.jpg",
  },
  {
    nombre: "Tostadas de queso cottage y mermelada sin azúcar",
    tipo: "desayuno",
    ingredientes: ["pan integral", "queso cottage", "mermelada sin azúcar"],
    calorias: 270,
    proteinas: "12g",
    grasas: "4g",
    precio: "S/ 3.00",
    imagen: "imagenes/tostadas_cottage.jpg",
  },
  {
    nombre: "Fruta picada con granola y miel",
    tipo: "desayuno",
    ingredientes: ["manzana", "pera", "uva", "granola sin azúcar", "miel (opcional)"],
    calorias: 330,
    proteinas: "7g",
    grasas: "8g",
    precio: "S/ 3.20",
    imagen: "imagenes/fruta_granola.jpg",
  },
  {
    nombre: "Avena cocida con manzana y canela",
    tipo: "desayuno",
    ingredientes: ["avena", "agua o leche", "manzana", "canela en polvo"],
    calorias: 300,
    proteinas: "9g",
    grasas: "6g",
    precio: "S/ 3.00",
    imagen: "imagenes/avena_manzana.jpg",
  },
  {
    nombre: "Café con leche descremada y tostada con miel",
    tipo: "desayuno",
    ingredientes: ["café", "leche descremada", "pan integral", "miel"],
    calorias: 280,
    proteinas: "8g",
    grasas: "5g",
    precio: "S/ 2.70",
    imagen: "imagenes/cafe_leche_tostada.jpg",
  },
  {
    nombre: "Huevos duros con rodajas de tomate y queso fresco",
    tipo: "desayuno",
    ingredientes: ["huevos", "tomate", "queso fresco", "sal", "pimienta"],
    calorias: 310,
    proteinas: "16g",
    grasas: "10g",
    precio: "S/ 3.40",
    imagen: "imagenes/huevos_duros_tomate.jpg",
  },
  {
    nombre: "Tostadas francesas con frutos del bosque",
    tipo: "desayuno",
    ingredientes: ["pan de molde integral", "huevo", "leche", "frutos del bosque (frescos o congelados)"],
    calorias: 390,
    proteinas: "11g",
    grasas: "10g",
    precio: "S/ 4.50",
    imagen: "imagenes/tostadas_francesas.jpg",
  },
  {
    nombre: "Sándwich integral de pavo y lechuga",
    tipo: "desayuno",
    ingredientes: ["pan integral", "pechuga de pavo", "lechuga", "mostaza (opcional)"],
    calorias: 340,
    proteinas: "18g",
    grasas: "7g",
    precio: "S/ 3.90",
    imagen: "imagenes/sandwich_pavo.jpg",
  },
  {
    nombre: "Pan integral con hummus y pepino",
    tipo: "desayuno",
    ingredientes: ["pan integral", "hummus", "rodajas de pepino"],
    calorias: 310,
    proteinas: "10g",
    grasas: "8g",
    precio: "S/ 3.20",
    imagen: "imagenes/pan_hummus.jpg",
  },
  {
    nombre: "Batido de yogur con plátano y avena",
    tipo: "desayuno",
    ingredientes: ["yogur natural", "plátano", "avena", "leche descremada"],
    calorias: 330,
    proteinas: "15g",
    grasas: "6g",
    precio: "S/ 3.50",
    imagen: "imagenes/batido_yogur_platano.jpg",
  },
  {
    nombre: "Cereal integral con leche descremada y berries",
    tipo: "desayuno",
    ingredientes: ["cereal integral sin azúcar", "leche descremada", "frutos del bosque (berries)"],
    calorias: 290,
    proteinas: "9g",
    grasas: "4g",
    precio: "S/ 2.80",
    imagen: "imagenes/cereal_berries.jpg",
  },
  {
    nombre: "Tortilla de avena con frutas",
    tipo: "desayuno",
    ingredientes: ["avena", "huevo", "leche", "frutas picadas (manzana, pera)"],
    calorias: 360,
    proteinas: "10g",
    grasas: "9g",
    precio: "S/ 4.00",
    imagen: "imagenes/tortilla_avena.jpg",
  },
  {
    nombre: "Huevos rancheros (sin tortillas fritas)",
    tipo: "desayuno",
    ingredientes: ["huevos", "salsa de tomate natural", "frijoles negros", "aguacate", "tortilla de maíz horneada"],
    calorias: 390,
    proteinas: "18g",
    grasas: "12g",
    precio: "S/ 5.00",
    imagen: "imagenes/huevos_rancheros.jpg",
  },
  {
    nombre: "Pan integral con queso fresco y tomate cherry",
    tipo: "desayuno",
    ingredientes: ["pan integral", "queso fresco", "tomates cherry", "orégano"],
    calorias: 290,
    proteinas: "10g",
    grasas: "7g",
    precio: "S/ 3.00",
    imagen: "imagenes/pan_queso_cherry.jpg",
  },
  {
    nombre: "Cereal de quinua inflada con leche vegetal y frutos secos",
    tipo: "desayuno",
    ingredientes: ["quinua inflada", "leche de almendras o soya", "nueces", "pasas"],
    calorias: 300,
    proteinas: "10g",
    grasas: "8g",
    precio: "S/ 3.50",
    imagen: "imagenes/quinua_inflada.jpg",
  },
  {
    nombre: "Wrap de huevo y espinaca en tortilla integral",
    tipo: "desayuno",
    ingredientes: ["huevo revuelto", "espinaca salteada", "tortilla integral"],
    calorias: 320,
    proteinas: "15g",
    grasas: "10g",
    precio: "S/ 3.80",
    imagen: "imagenes/wrap_huevo_espinaca.jpg",
  },
  {
    nombre: "Tostadas con mermelada light y queso crema light",
    tipo: "desayuno",
    ingredientes: ["pan integral", "mermelada sin azúcar", "queso crema light"],
    calorias: 260,
    proteinas: "8g",
    grasas: "5g",
    precio: "S/ 2.90",
    imagen: "imagenes/tostadas_mermelada_queso.jpg",
  },
  {
    nombre: "Porridge de chía con leche de coco y frutos secos",
    tipo: "desayuno",
    ingredientes: ["semillas de chía", "leche de coco (light)", "frutos secos variados (almendras, nueces)"],
    calorias: 350,
    proteinas: "10g",
    grasas: "15g",
    precio: "S/ 4.50",
    imagen: "imagenes/porridge_chia.avif",
  },
  {
    nombre: "Panqueques de plátano con huevo y canela",
    tipo: "desayuno",
    ingredientes: ["plátano maduro", "huevo", "harina integral", "canela"],
    calorias: 370,
    proteinas: "11g",
    grasas: "8g",
    precio: "S/ 4.20",
    imagen: "imagenes/panqueques_platano.jpg",
  },
  {
    nombre: "Tortilla de claras con pimientos y cebolla",
    tipo: "desayuno",
    ingredientes: ["claras de huevo", "pimientos de colores", "cebolla", "perejil"],
    calorias: 270,
    proteinas: "16g",
    grasas: "4g",
    precio: "S/ 3.50",
    imagen: "imagenes/tortilla_claras_pimientos.jpg",
  },
  {
    nombre: "Bowl de yogur con frutas tropicales y coco rallado",
    tipo: "desayuno",
    ingredientes: ["yogur natural", "piña", "mango", "coco rallado sin azúcar"],
    calorias: 310,
    proteinas: "10g",
    grasas: "9g",
    precio: "S/ 4.00",
    imagen: "imagenes/bowl_yogur_tropical.jpg",
  },
  {
    nombre: "Tostadas de arroz con huevo y aguacate",
    tipo: "desayuno",
    ingredientes: ["tostadas de arroz inflado", "huevo cocido o revuelto", "aguacate en rodajas"],
    calorias: 310,
    proteinas: "12g",
    grasas: "10g",
    precio: "S/ 3.70",
    imagen: "imagenes/tostadas_arroz_huevo_aguacate.jpg",
  },
  {
    nombre: "Yogur natural con semillas de chía y frutos secos",
    tipo: "desayuno",
    ingredientes: ["yogur natural sin azúcar", "semillas de chía", "nueces", "almendras"],
    calorias: 290,
    proteinas: "15g",
    grasas: "10g",
    precio: "S/ 3.60",
    imagen: "imagenes/yogur_chia_frutos_secos.jpg",
  },
  {
    nombre: "Batido de espinaca, plátano y leche de almendras",
    tipo: "desayuno",
    ingredientes: ["espinaca fresca", "plátano", "leche de almendras sin azúcar", "semillas de lino"],
    calorias: 280,
    proteinas: "7g",
    grasas: "5g",
    precio: "S/ 4.00",
    imagen: "imagenes/batido_espinaca_platano.jpg",
  },
  {
    nombre: "Pan integral con huevo duro y rodajas de pepino",
    tipo: "desayuno",
    ingredientes: ["pan integral", "huevo duro", "pepino", "sal", "pimienta"],
    calorias: 290,
    proteinas: "12g",
    grasas: "7g",
    precio: "S/ 3.00",
    imagen: "imagenes/pan_huevo_pepino.jpg",
  },
  {
    nombre: "Cereal de avena inflada con frutas y miel",
    tipo: "desayuno",
    ingredientes: ["avena inflada", "leche descremada", "frutas picadas (fresa, kiwi)", "miel"],
    calorias: 300,
    proteinas: "9g",
    grasas: "5g",
    precio: "S/ 3.20",
    imagen: "imagenes/cereal_avena_frutas.jpg",
  },
  {
    nombre: "Huevos revueltos con champiñones y tostada de aguacate",
    tipo: "desayuno",
    ingredientes: ["huevos", "champiñones", "aguacate", "pan integral"],
    calorias: 390,
    proteinas: "18g",
    grasas: "15g",
    precio: "S/ 4.90",
    imagen: "imagenes/huevos_champi_aguacate.jpg",
  },
  {
    nombre: "Batido de frutos rojos con avena y proteína",
    tipo: "desayuno",
    ingredientes: ["frutos rojos congelados", "avena", "leche descremada", "proteína en polvo (opcional)"],
    calorias: 340,
    proteinas: "22g",
    grasas: "4g",
    precio: "S/ 5.50",
    imagen: "imagenes/batido_frutos_rojos_proteina.jpg",
  },
  {
    nombre: "Pan integral con crema de cacahuete y rodajas de plátano",
    tipo: "desayuno",
    ingredientes: ["pan integral", "crema de cacahuete natural", "plátano en rodajas"],
    calorias: 350,
    proteinas: "10g",
    grasas: "15g",
    precio: "S/ 3.90",
    imagen: "imagenes/pan_crema_cacahuete_platano.jpg",
  },
  {
    nombre: "Huevos poché sobre tostada integral y espinacas",
    tipo: "desayuno",
    ingredientes: ["huevo poché", "pan integral", "espinacas salteadas"],
    calorias: 300,
    proteinas: "15g",
    grasas: "8g",
    precio: "S/ 3.70",
    imagen: "imagenes/huevo_poche_espinaca.jpg",
  },
  // --- Almuerzos ---
  {
    nombre: "Pollo al horno con arroz integral y ensalada",
    tipo: "almuerzo",
    ingredientes: ["pechuga de pollo", "arroz integral", "lechuga", "tomate", "pepino", "zanahoria"],
    calorias: 620,
    proteinas: "35g",
    grasas: "14g",
    precio: "S/ 7.00",
    imagen: "imagenes/pollo_horno.jpg",
  },
  {
    nombre: "Guiso de lentejas con zanahoria y arroz",
    tipo: "almuerzo",
    ingredientes: ["lentejas", "zanahoria", "papa", "arroz", "cebolla", "ajo"],
    calorias: 590,
    proteinas: "25g",
    grasas: "11g",
    precio: "S/ 6.50",
    imagen: "imagenes/lentejas.jpg",
  },
  {
    nombre: "Pescado a la plancha con puré de papa y brócoli",
    tipo: "almuerzo",
    ingredientes: ["filete de pescado", "papa", "brócoli", "leche descremada", "aceite de oliva"],
    calorias: 580,
    proteinas: "30g",
    grasas: "12g",
    precio: "S/ 8.00",
    imagen: "imagenes/pescado_plancha.jpg",
  },
  {
    nombre: "Seco de res con frijoles y arroz",
    tipo: "almuerzo",
    ingredientes: ["carne de res (punta de pecho)", "frijoles", "arroz", "cilantro", "cebolla"],
    calorias: 650,
    proteinas: "38g",
    grasas: "15g",
    precio: "S/ 7.50",
    imagen: "imagenes/seco_res.jpg",
  },
  {
    nombre: "Pasta integral con salsa de tomate y pollo desmenuzado",
    tipo: "almuerzo",
    ingredientes: ["pasta integral", "tomate natural", "pechuga de pollo", "albahaca", "ajo"],
    calorias: 600,
    proteinas: "30g",
    grasas: "10g",
    precio: "S/ 6.80",
    imagen: "imagenes/pasta_pollo.jpg",
  },
  {
    nombre: "Ceviche de pescado con camote y choclo",
    tipo: "almuerzo",
    ingredientes: ["pescado blanco", "limón", "cebolla roja", "ají limo", "camote", "choclo"],
    calorias: 550,
    proteinas: "30g",
    grasas: "8g",
    precio: "S/ 9.00",
    imagen: "imagenes/ceviche.jpg",
  },
  {
    nombre: "Asado de res con papas al horno y ensalada mixta",
    tipo: "almuerzo",
    ingredientes: ["carne de res (asado)", "papas", "lechuga", "tomate", "cebolla", "vinagreta"],
    calorias: 700,
    proteinas: "40g",
    grasas: "20g",
    precio: "S/ 9.50",
    imagen: "imagenes/asado_res.jpg",
  },
  {
    nombre: "Estofado de carne con papas y arroz",
    tipo: "almuerzo",
    ingredientes: ["carne para estofado", "papa", "arvejas", "zanahoria", "arroz", "tomate"],
    calorias: 680,
    proteinas: "35g",
    grasas: "18g",
    precio: "S/ 7.20",
    imagen: "imagenes/estofado_carne.jpg",
  },
  {
    nombre: "Saltado de vainitas con arroz y huevo frito",
    tipo: "almuerzo",
    ingredientes: ["vainitas", "cebolla", "tomate", "huevo", "arroz", "salsa de soya (baja en sodio)"],
    calorias: 610,
    proteinas: "28g",
    grasas: "14g",
    precio: "S/ 6.80",
    imagen: "imagenes/saltado_vainitas.jpg",
  },
  {
    nombre: "Arroz con pollo y ensalada cocida",
    tipo: "almuerzo",
    ingredientes: ["arroz", "pollo", "zanahoria", "arvejas", "choclo", "pimiento"],
    calorias: 640,
    proteinas: "30g",
    grasas: "16g",
    precio: "S/ 7.00",
    imagen: "imagenes/arroz_pollo.jpg",
  },
  {
    nombre: "Cau cau de mondongo con arroz",
    tipo: "almuerzo",
    ingredientes: ["mondongo cocido", "papa", "zanahoria", "arvejas", "hierbabuena", "arroz"],
    calorias: 590,
    proteinas: "28g",
    grasas: "13g",
    precio: "S/ 6.50",
    imagen: "imagenes/cau_cau.jpg",
  },
  {
    nombre: "Spaghetti con salsa bolognesa de carne magra",
    tipo: "almuerzo",
    ingredientes: ["spaghetti integral", "carne molida magra", "salsa de tomate", "cebolla", "ajo"],
    calorias: 630,
    proteinas: "32g",
    grasas: "15g",
    precio: "S/ 7.10",
    imagen: "imagenes/spaghetti_bolognesa.jpg",
  },
  {
    nombre: "Locro de zapallo con arroz",
    tipo: "almuerzo",
    ingredientes: ["zapallo", "papa", "choclo", "arvejas", "leche descremada", "arroz"],
    calorias: 570,
    proteinas: "20g",
    grasas: "12g",
    precio: "S/ 6.00",
    imagen: "imagenes/locro_zapallo.avif",
  },
  {
    nombre: "Parihuela de mariscos (sin arroz)",
    tipo: "almuerzo",
    ingredientes: ["pescado", "mariscos variados", "ají amarillo", "tomate", "caldo de pescado"],
    calorias: 600,
    proteinas: "40g",
    grasas: "15g",
    precio: "S/ 10.00",
    imagen: "imagenes/parihuela.jpg",
  },
  {
    nombre: "Picante de carne con papas y arroz",
    tipo: "almuerzo",
    ingredientes: ["carne de res (molida o picada)", "papa", "ají panca", "arroz", "cebolla"],
    calorias: 670,
    proteinas: "34g",
    grasas: "17g",
    precio: "S/ 7.30",
    imagen: "imagenes/picante_carne.jpg",
  },
  {
    nombre: "Chaufa de pollo bajo en grasa",
    tipo: "almuerzo",
    ingredientes: ["arroz", "pechuga de pollo", "tortilla de huevo", "cebolla china", "pimiento", "sillao bajo en sodio"],
    calorias: 620,
    proteinas: "30g",
    grasas: "14g",
    precio: "S/ 6.90",
    imagen: "imagenes/chaufa_pollo_ligero.jpg",
  },
  {
    nombre: "Saltado de champiñones con arroz integral",
    tipo: "almuerzo",
    ingredientes: ["champiñones", "cebolla", "tomate", "ají amarillo", "arroz integral"],
    calorias: 580,
    proteinas: "20g",
    grasas: "11g",
    precio: "S/ 6.30",
    imagen: "imagenes/saltado_champiñones.jpg",
  },
  {
    nombre: "Guiso de pollo con quinua y verduras",
    tipo: "almuerzo",
    ingredientes: ["pechuga de pollo", "quinua", "zanahoria", "arvejas", "vainitas"],
    calorias: 630,
    proteinas: "32g",
    grasas: "15g",
    precio: "S/ 7.00",
    imagen: "imagenes/guiso_pollo_quinua.jpg",
  },
  {
    nombre: "Arroz a la jardinera con pollo desmenuzado",
    tipo: "almuerzo",
    ingredientes: ["arroz", "pollo desmenuzado", "zanahoria", "arvejas", "choclo", "pimiento"],
    calorias: 610,
    proteinas: "28g",
    grasas: "13g",
    precio: "S/ 6.70",
    imagen: "imagenes/arroz_jardinera.jpg",
  },
  {
    nombre: "Aguadito de pollo con arroz",
    tipo: "almuerzo",
    ingredientes: ["pollo", "arroz", "arvejas", "zanahoria", "culantro", "papa"],
    calorias: 570,
    proteinas: "30g",
    grasas: "10g",
    precio: "S/ 6.50",
    imagen: "imagenes/aguadito_pollo.jpg",
  },
  {
    nombre: "Parrillada de verduras con pollo a la brasa (sin piel)",
    tipo: "almuerzo",
    ingredientes: ["pimientos", "calabacín", "cebolla", "champiñones", "pechuga de pollo a la brasa (sin piel)"],
    calorias: 690,
    proteinas: "45g",
    grasas: "18g",
    precio: "S/ 9.80",
    imagen: "imagenes/parrillada_verduras_pollo.jpg",
  },
  {
    nombre: "Albóndigas de pollo en salsa de tomate con arroz",
    tipo: "almuerzo",
    ingredientes: ["pechuga de pollo molida", "salsa de tomate natural", "arroz", "cebolla", "ajo"],
    calorias: 650,
    proteinas: "38g",
    grasas: "15g",
    precio: "S/ 7.00",
    imagen: "imagenes/albondigas_pollo.jpg",
  },
  {
    nombre: "Frejoles con arroz y pescado a la plancha",
    tipo: "almuerzo",
    ingredientes: ["frejoles negros o canarios", "arroz", "filete de pescado blanco", "cebolla", "ajo"],
    calorias: 680,
    proteinas: "35g",
    grasas: "16g",
    precio: "S/ 7.50",
    imagen: "imagenes/frejoles_pescado.jpg",
  },
  {
    nombre: "Guiso de carne molida con arvejas y papas",
    tipo: "almuerzo",
    ingredientes: ["carne molida magra", "arvejas", "papa", "zanahoria", "salsa de tomate"],
    calorias: 630,
    proteinas: "30g",
    grasas: "15g",
    precio: "S/ 6.80",
    imagen: "imagenes/guiso_carne_molida.jpg",
  },
  {
    nombre: "Pescado al vapor con quinua y ensalada",
    tipo: "almuerzo",
    ingredientes: ["filete de pescado", "quinua", "brócoli", "zanahoria", "lechuga", "tomate"],
    calorias: 590,
    proteinas: "32g",
    grasas: "10g",
    precio: "S/ 8.20",
    imagen: "imagenes/pescado_vapor_quinua.jpg",
  },
  {
    nombre: "Tallarines saltados de pollo y verduras",
    tipo: "almuerzo",
    ingredientes: ["tallarines integrales", "pechuga de pollo", "pimiento", "cebolla china", "brócoli", "sillao bajo en sodio"],
    calorias: 640,
    proteinas: "32g",
    grasas: "14g",
    precio: "S/ 7.10",
    imagen: "imagenes/tallarines_saltados.jpg",
  },
  {
    nombre: "Escabeche de pollo con arroz",
    tipo: "almuerzo",
    ingredientes: ["pollo", "cebolla", "ají amarillo", "vinagre", "arroz", "huevo duro"],
    calorias: 620,
    proteinas: "35g",
    grasas: "13g",
    precio: "S/ 7.80",
    imagen: "imagenes/escabeche_pollo.jpg",
  },
  {
    nombre: "Caucau de pollo con arroz",
    tipo: "almuerzo",
    ingredientes: ["pollo desmenuzado", "papa", "zanahoria", "arvejas", "arroz", "culantro"],
    calorias: 580,
    proteinas: "30g",
    grasas: "12g",
    precio: "S/ 6.60",
    imagen: "imagenes/caucau_pollo.jpg",
  },
  {
    nombre: "Ají de gallina (versión ligera) con arroz",
    tipo: "almuerzo",
    ingredientes: ["pechuga de gallina deshilachada", "ají amarillo", "leche descremada", "pan integral remojado", "arroz"],
    calorias: 660,
    proteinas: "38g",
    grasas: "16g",
    precio: "S/ 7.40",
    imagen: "imagenes/aji_gallina_ligero.jpg",
  },
  {
    nombre: "Saltado de verduras con tofu y arroz integral",
    tipo: "almuerzo",
    ingredientes: ["tofu firme", "brócoli", "zanahoria", "pimiento", "cebolla", "arroz integral", "sillao bajo en sodio"],
    calorias: 600,
    proteinas: "28g",
    grasas: "12g",
    precio: "S/ 6.90",
    imagen: "imagenes/saltado_tofu_integral.jpg",
  },
  {
    nombre: "Arroz con mariscos (sin crema) y ensalada fresca",
    tipo: "almuerzo",
    ingredientes: ["arroz", "mariscos variados (calamar, pulpo, conchas)", "ají amarillo", "arvejas", "pimiento", "lechuga", "tomate"],
    calorias: 680,
    proteinas: "35g",
    grasas: "15g",
    precio: "S/ 9.50",
    imagen: "imagenes/arroz_mariscos_fresco.jpg",
  },
  {
    nombre: "Estofado de pollo con verduras y quinua",
    tipo: "almuerzo",
    ingredientes: ["pechuga de pollo", "quinua", "zanahoria", "arvejas", "papa", "tomate"],
    calorias: 640,
    proteinas: "35g",
    grasas: "14g",
    precio: "S/ 7.10",
    imagen: "imagenes/estofado_pollo_quinua.jpg",
  },
  {
    nombre: "Arroz chaufa de verduras con huevo",
    tipo: "almuerzo",
    ingredientes: ["arroz", "zanahoria", "arvejas", "choclo", "pimiento", "huevo", "sillao bajo en sodio"],
    calorias: 580,
    proteinas: "20g",
    grasas: "10g",
    precio: "S/ 6.50",
    imagen: "imagenes/arroz_chaufa_verduras.jpg",
  },
  {
    nombre: "Sopa seca con carapulcra (versión ligera)",
    tipo: "almuerzo",
    ingredientes: ["papa seca", "carne de cerdo o pollo (poca grasa)", "maní", "ají panca", "fideos"],
    calorias: 690,
    proteinas: "35g",
    grasas: "20g",
    precio: "S/ 8.00",
    imagen: "imagenes/sopa_seca_carapulcra_ligera.jpg",
  },
  {
    nombre: "Arroz con pato (versión casera)",
    tipo: "almuerzo",
    ingredientes: ["pato (pierna/muslo)", "arroz", "culantro", "ají amarillo", "cerveza negra (opcional)"],
    calorias: 720,
    proteinas: "40g",
    grasas: "22g",
    precio: "S/ 11.00",
    imagen: "imagenes/arroz_pato_casero.jpg",
  },
  {
    nombre: "Sudado de pescado con yuca y arroz",
    tipo: "almuerzo",
    ingredientes: ["pescado (entero o filete)", "yuca", "tomate", "cebolla", "ají amarillo", "arroz"],
    calorias: 630,
    proteinas: "35g",
    grasas: "14g",
    precio: "S/ 8.50",
    imagen: "imagenes/sudado_pescado_yuca.jpg",
  },
  {
    nombre: "Tallarines verdes con milanesa de pollo al horno",
    tipo: "almuerzo",
    ingredientes: ["tallarines integrales", "espinaca", "albahaca", "queso fresco (poco)", "milanesa de pollo (horno)"],
    calorias: 670,
    proteinas: "38g",
    grasas: "18g",
    precio: "S/ 7.80",
    imagen: "imagenes/tallarines_verdes_milanesa.jpg",
  },
  {
    nombre: "Pollo a la jardinera con arroz",
    tipo: "almuerzo",
    ingredientes: ["pechuga de pollo", "zanahoria", "arvejas", "choclo", "papa", "arroz"],
    calorias: 610,
    proteinas: "30g",
    grasas: "13g",
    precio: "S/ 6.80",
    imagen: "imagenes/pollo_jardinera.jpg",
  },
  {
    nombre: "Lomo saltado (versión ligera) con papas al horno y arroz",
    tipo: "almuerzo",
    ingredientes: ["lomo de res (magro)", "cebolla", "tomate", "ají amarillo", "papas al horno", "arroz"],
    calorias: 700,
    proteinas: "40g",
    grasas: "18g",
    precio: "S/ 9.00",
    imagen: "imagenes/lomo_saltado_ligero.jpg",
  },
  // --- Cenas ---
  {
    nombre: "Sopa de verduras con huevo duro",
    tipo: "cena",
    ingredientes: ["zanahoria", "apio", "papa", "zapallo", "huevo duro", "caldo de verduras"],
    calorias: 280,
    proteinas: "12g",
    grasas: "6g",
    precio: "S/ 3.00",
    imagen: "imagenes/sopa_verduras.jpg",
  },
  {
    nombre: "Tortilla de espinaca con pan integral",
    tipo: "cena",
    ingredientes: ["huevos", "espinaca", "cebolla", "pan integral"],
    calorias: 350,
    proteinas: "15g",
    grasas: "8g",
    precio: "S/ 3.80",
    imagen: "imagenes/tortilla_espinaca.jpg",
  },
  {
    nombre: "Ensalada de quinua con verduras frescas",
    tipo: "cena",
    ingredientes: ["quinua", "pepino", "tomate", "pimiento", "cebolla roja", "limón", "aceite de oliva"],
    calorias: 320,
    proteinas: "10g",
    grasas: "7g",
    precio: "S/ 4.50",
    imagen: "imagenes/ensalada_quinua.jpg",
  },
  {
    nombre: "Ensalada de atún con lechuga y tomate",
    tipo: "cena",
    ingredientes: ["atún en agua", "lechuga", "tomate", "cebolla", "limón", "aceite de oliva"],
    calorias: 300,
    proteinas: "25g",
    grasas: "8g",
    precio: "S/ 4.00",
    imagen: "imagenes/ensalada_atun.jpg",
  },
  {
    nombre: "Crema de zapallo con crutones",
    tipo: "cena",
    ingredientes: ["zapallo", "cebolla", "caldo de verduras", "crutones integrales"],
    calorias: 270,
    proteinas: "8g",
    grasas: "5g",
    precio: "S/ 3.20",
    imagen: "imagenes/crema_zapallo.jpg",
  },
  {
    nombre: "Wrap de pollo con verduras y tortilla integral",
    tipo: "cena",
    ingredientes: ["pechuga de pollo cocida", "tortilla integral", "lechuga", "zanahoria rallada", "pimiento"],
    calorias: 380,
    proteinas: "20g",
    grasas: "10g",
    precio: "S/ 5.50",
    imagen: "imagenes/wrap_pollo.jpg",
  },
  {
    nombre: "Tostadas de aguacate con huevo poché",
    tipo: "cena",
    ingredientes: ["pan integral", "aguacate", "huevo", "sal", "pimienta"],
    calorias: 330,
    proteinas: "15g",
    grasas: "12g",
    precio: "S/ 4.00",
    imagen: "imagenes/tostadas_aguacate.jpg",
  },
  {
    nombre: "Omelette de claras con champiñones y tostada integral",
    tipo: "cena",
    ingredientes: ["claras de huevo", "champiñones", "cebolla", "pan integral"],
    calorias: 290,
    proteinas: "15g",
    grasas: "6g",
    precio: "S/ 3.60",
    imagen: "imagenes/omelette_champiñones.jpg",
  },
  {
    nombre: "Sopa de lentejas con verduras",
    tipo: "cena",
    ingredientes: ["lentejas", "zanahoria", "apio", "cebolla", "caldo de verduras"],
    calorias: 310,
    proteinas: "14g",
    grasas: "6g",
    precio: "S/ 3.90",
    imagen: "imagenes/sopa_lentejas.jpg",
  },
  {
    nombre: "Ensalada de garbanzos con vegetales frescos",
    tipo: "cena",
    ingredientes: ["garbanzos cocidos", "pimiento", "pepino", "cebolla", "perejil", "limón", "aceite de oliva"],
    calorias: 300,
    proteinas: "12g",
    grasas: "7g",
    precio: "S/ 4.20",
    imagen: "imagenes/ensalada_garbanzos.jpg",
  },
  {
    nombre: "Brochetas de pollo con pimientos y cebolla",
    tipo: "cena",
    ingredientes: ["pechuga de pollo", "pimiento rojo", "pimiento verde", "cebolla", "palitos de brocheta"],
    calorias: 360,
    proteinas: "25g",
    grasas: "9g",
    precio: "S/ 5.00",
    imagen: "imagenes/brochetas_pollo.jpg",
  },
  {
    nombre: "Ensalada César con pollo grillado (sin aderezo cremoso)",
    tipo: "cena",
    ingredientes: ["lechuga romana", "pechuga de pollo grillada", "parmesano (poco)", "crutones integrales", "aderezo ligero"],
    calorias: 390,
    proteinas: "30g",
    grasas: "11g",
    precio: "S/ 5.80",
    imagen: "imagenes/ensalada_cesar_pollo.jpg",
  },
  {
    nombre: "Chupín de pescado y verduras",
    tipo: "cena",
    ingredientes: ["pescado blanco", "papa", "zanahoria", "arvejas", "tomate", "caldo de pescado"],
    calorias: 320,
    proteinas: "20g",
    grasas: "7g",
    precio: "S/ 4.50",
    imagen: "imagenes/chupin_pescado.jpg",
  },
  {
    nombre: "Vegetales asados con pechuga de pollo desmenuzada",
    tipo: "cena",
    ingredientes: ["brócoli", "zanahoria", "calabacín", "pimiento", "pechuga de pollo", "hierbas finas"],
    calorias: 350,
    proteinas: "28g",
    grasas: "9g",
    precio: "S/ 5.20",
    imagen: "imagenes/vegetales_asados_pollo.jpg",
  },
  {
    nombre: "Ensalada de espinacas con huevo cocido y champiñones",
    tipo: "cena",
    ingredientes: ["espinacas frescas", "huevo cocido", "champiñones laminados", "vinagreta ligera"],
    calorias: 290,
    proteinas: "12g",
    grasas: "6g",
    precio: "S/ 3.80",
    imagen: "imagenes/ensalada_espinaca_huevo.jpg",
  },
  {
    nombre: "Sopa de lentejas rojas y vegetales",
    tipo: "cena",
    ingredientes: ["lentejas rojas", "zanahoria", "apio", "tomate", "caldo de verduras"],
    calorias: 300,
    proteinas: "13g",
    grasas: "5g",
    precio: "S/ 3.70",
    imagen: "imagenes/sopa_lentejas_rojas.jpg",
  },
  {
    nombre: "Brócoli al vapor con filete de pescado al horno",
    tipo: "cena",
    ingredientes: ["brócoli", "filete de pescado blanco", "limón", "hierbas finas"],
    calorias: 350,
    proteinas: "28g",
    grasas: "8g",
    precio: "S/ 5.00",
    imagen: "imagenes/brocoli_pescado.jpg",
  },
  {
    nombre: "Ensalada caprese con albahaca y aceite de oliva",
    tipo: "cena",
    ingredientes: ["tomate", "queso mozzarella fresco", "hojas de albahaca", "aceite de oliva extra virgen"],
    calorias: 310,
    proteinas: "10g",
    grasas: "10g",
    precio: "S/ 4.60",
    imagen: "imagenes/ensalada_caprese.jpg",
  },
  {
    nombre: "Crema de champiñones con pan de centeno",
    tipo: "cena",
    ingredientes: ["champiñones", "cebolla", "caldo de verduras", "leche descremada", "pan de centeno"],
    calorias: 280,
    proteinas: "9g",
    grasas: "5g",
    precio: "S/ 3.50",
    imagen: "imagenes/crema_champiñones.jpg",
  },
  {
    nombre: "Ensalada de espárragos y gambas a la plancha",
    tipo: "cena",
    ingredientes: ["espárragos", "gambas (camarones)", "ajo", "limón", "aceite de oliva"],
    calorias: 340,
    proteinas: "25g",
    grasas: "9g",
    precio: "S/ 6.00",
    imagen: "imagenes/esparragos_gambas.jpg",
  },
  {
    nombre: "Sopa de miso con tofu y algas",
    tipo: "cena",
    ingredientes: ["pasta de miso", "tofu firme", "alga nori o wakame", "cebolla china"],
    calorias: 250,
    proteinas: "15g",
    grasas: "7g",
    precio: "S/ 4.20",
    imagen: "imagenes/sopa_miso.jpg",
  },
  {
    nombre: "Ensalada de col morada con manzana y nueces",
    tipo: "cena",
    ingredientes: ["col morada", "manzana verde", "nueces", "aderezo de yogur y limón"],
    calorias: 280,
    proteinas: "7g",
    grasas: "9g",
    precio: "S/ 4.00",
    imagen: "imagenes/ensalada_col_manzana.jpg",
  },
  {
    nombre: "Crema de brócoli con queso bajo en grasa",
    tipo: "cena",
    ingredientes: ["brócoli", "caldo de verduras", "leche descremada", "queso fresco rallado"],
    calorias: 290,
    proteinas: "12g",
    grasas: "6g",
    precio: "S/ 3.60",
    imagen: "imagenes/crema_brocoli.jpg",
  },
  {
    nombre: "Ensalada de beterraga y zanahoria rallada con choclo",
    tipo: "cena",
    ingredientes: ["beterraga", "zanahoria", "choclo desgranado", "perejil", "limón"],
    calorias: 270,
    proteinas: "7g",
    grasas: "4g",
    precio: "S/ 3.50",
    imagen: "imagenes/ensalada_beterraga_choclo.jpg",
  },
  {
    nombre: "Sopa de espárragos con trozos de pan integral",
    tipo: "cena",
    ingredientes: ["espárragos", "caldo de verduras", "cebolla", "trozos de pan integral tostado"],
    calorias: 280,
    proteinas: "9g",
    grasas: "5g",
    precio: "S/ 3.70",
    imagen: "imagenes/sopa_esparragos.jpg",
  },
  {
    nombre: "Ensalada de pollo desmenuzado con palta y choclo",
    tipo: "cena",
    ingredientes: ["pechuga de pollo cocida", "palta", "choclo desgranado", "lechuga", "tomate"],
    calorias: 380,
    proteinas: "25g",
    grasas: "15g",
    precio: "S/ 5.50",
    imagen: "imagenes/ensalada_pollo_palta.jpg",
  },
  {
    nombre: "Vegetales mixtos al vapor con tofu a la plancha",
    tipo: "cena",
    ingredientes: ["tofu firme", "brócoli", "zanahoria", "calabacín", "pimiento", "salsa de soya (baja en sodio)"],
    calorias: 360,
    proteinas: "20g",
    grasas: "10g",
    precio: "S/ 5.80",
    imagen: "imagenes/vegetales_tofu.jpg",
  },
  {
    nombre: "Sopa de tomate con albahaca y tostadas integrales",
    tipo: "cena",
    ingredientes: ["tomates maduros", "albahaca fresca", "caldo de verduras", "pan integral"],
    calorias: 290,
    proteinas: "8g",
    grasas: "6g",
    precio: "S/ 3.90",
    imagen: "imagenes/sopa_tomate.jpg",
  },
  {
    nombre: "Ensalada de lentejas con vegetales asados",
    tipo: "cena",
    ingredientes: ["lentejas cocidas", "calabacín", "berenjena", "pimiento", "cebolla roja (asados)"],
    calorias: 300,
    proteinas: "14g",
    grasas: "7g",
    precio: "S/ 4.30",
    imagen: "imagenes/ensalada_lentejas_asados.jpg",
  },
  {
    nombre: "Sopa de pollo y fideos integrales",
    tipo: "cena",
    ingredientes: ["pechuga de pollo", "fideos integrales", "zanahoria", "apio", "caldo de pollo"],
    calorias: 330,
    proteinas: "20g",
    grasas: "6g",
    precio: "S/ 4.00",
    imagen: "imagenes/sopa_pollo_fideos.jpg",
  },
  {
    nombre: "Pescado al horno con espárragos y papa cocida",
    tipo: "cena",
    ingredientes: ["filete de pescado blanco", "espárragos", "papa cocida", "limón", "hierbas"],
    calorias: 370,
    proteinas: "28g",
    grasas: "8g",
    precio: "S/ 5.80",
    imagen: "imagenes/pescado_esparragos.jpg",
  },
  {
    nombre: "Ensalada de garbanzos con atún y maíz",
    tipo: "cena",
    ingredientes: ["garbanzos cocidos", "atún en agua", "maíz desgranado", "pimiento", "cebolla", "aceite de oliva"],
    calorias: 320,
    proteinas: "20g",
    grasas: "9g",
    precio: "S/ 4.70",
    imagen: "imagenes/ensalada_garbanzos_atun.jpg",
  },
  {
    nombre: "Crema de champiñones y espinaca",
    tipo: "cena",
    ingredientes: ["champiñones", "espinaca", "caldo de verduras", "leche descremada"],
    calorias: 270,
    proteinas: "10g",
    grasas: "5g",
    precio: "S/ 3.80",
    imagen: "imagenes/crema_champi_espinaca.jpg",
  },
  {
    nombre: "Brochetas de cerdo y piña a la plancha",
    tipo: "cena",
    ingredientes: ["lomo de cerdo (magro)", "piña", "pimiento", "cebolla", "salsa de soya (baja en sodio)"],
    calorias: 380,
    proteinas: "28g",
    grasas: "12g",
    precio: "S/ 6.20",
    imagen: "imagenes/brochetas_cerdo_piña.jpg",
  },
  {
    nombre: "Ensalada de pollo grillado con fresas y espinacas",
    tipo: "cena",
    ingredientes: ["pechuga de pollo grillada", "espinacas", "fresas", "nueces", "aderezo balsámico"],
    calorias: 390,
    proteinas: "30g",
    grasas: "12g",
    precio: "S/ 6.00",
    imagen: "imagenes/ensalada_pollo_fresas.jpg",
  },
  {
    nombre: "Sopa de quinua con verduras",
    tipo: "cena",
    ingredientes: ["quinua", "zanahoria", "arvejas", "papa", "caldo de verduras"],
    calorias: 310,
    proteinas: "12g",
    grasas: "6g",
    precio: "S/ 4.00",
    imagen: "imagenes/sopa_quinua_verduras.jpg",
  },
  {
    nombre: "Ensalada de pepino, tomate y queso fresco",
    tipo: "cena",
    ingredientes: ["pepino", "tomate", "queso fresco", "orégano", "aceite de oliva"],
    calorias: 260,
    proteinas: "10g",
    grasas: "7g",
    precio: "S/ 3.20",
    imagen: "imagenes/ensalada_pepino_queso.jpg",
  },
  {
    nombre: "Crema de lentejas con tostadas",
    tipo: "cena",
    ingredientes: ["lentejas", "zanahoria", "cebolla", "ajo", "caldo de verduras", "pan integral tostado"],
    calorias: 300,
    proteinas: "15g",
    grasas: "6g",
    precio: "S/ 3.90",
    imagen: "imagenes/crema_lentejas.jpg",
  },
  {
    nombre: "Ensalada de espinacas, fresas y queso de cabra",
    tipo: "cena",
    ingredientes: ["espinacas frescas", "fresas", "queso de cabra (poco)", "nueces", "vinagreta balsámica"],
    calorias: 340,
    proteinas: "10g",
    grasas: "12g",
    precio: "S/ 5.00",
    imagen: "imagenes/ensalada_espinaca_fresas_cabra.jpg",
  },
  {
    nombre: "Ensalada de atún, huevo y papa cocida",
    tipo: "cena",
    ingredientes: ["atún en agua", "huevo cocido", "papa cocida", "lechuga", "tomate", "mayonesa light (opcional)"],
    calorias: 350,
    proteinas: "25g",
    grasas: "10g",
    precio: "S/ 4.80",
    imagen: "imagenes/ensalada_atun_huevo_papa.jpg",
  },
  {
    nombre: "Vegetales asados con pechuga de pavo",
    tipo: "cena",
    ingredientes: ["pechuga de pavo", "brócoli", "zanahoria", "calabacín", "pimiento", "hierbas finas"],
    calorias: 360,
    proteinas: "30g",
    grasas: "8g",
    precio: "S/ 5.50",
    imagen: "imagenes/vegetales_pavo.jpg",
  },
];

  // Buscar recetas que coincidan al menos con un ingrediente del usuario
  const recetasFiltradas = recetas.filter(receta =>
    receta.ingredientes.some(ing => alimentosUsuario.includes(ing))
  );

  if (recetasFiltradas.length === 0) {
    resultado.innerHTML = `<p><strong>😢 No se encontraron recetas con los ingredientes que escribiste.</strong></p>`;
    return;
  }

  let html = `<h3>🍽️ Plan personalizado con tus alimentos:</h3>`;

  recetasFiltradas.forEach((receta, index) => {
    html += `
      <div class="comida" style="margin-top: 1.5rem;">
        <h4>${index + 1}. ${receta.nombre}</h4>
        <img src="${receta.imagen}" alt="${receta.nombre}" class="comida-img">
        <p><strong>Ingredientes:</strong> ${receta.ingredientes.join(", ")}</p>
        <p><strong>Valor nutricional:</strong></p>
        <ul>
          <li>Calorías: ${receta.calorias} kcal</li>
          <li>Proteínas: ${receta.proteinas}</li>
          <li>Grasas: ${receta.grasas}</li>
        </ul>
        <p><strong>Presupuesto estimado:</strong> ${receta.precio}</p>
      </div>
    `;
  });

  html += `<em>(Basado en: ${lista})</em>`;

  resultado.innerHTML = html;

  // Guardar en localStorage para conservarlo
  localStorage.setItem("nutribot_plan_personalizado", html);
}

// Guardar plan manualmente
function guardarPlanLocal() {
  const contenido = document.getElementById("resultadoPlanPersonalizado").innerText;
  if (!contenido.trim()) {
    alert("Primero debes generar un plan para guardarlo.");
    return;
  }

  localStorage.setItem("nutribot_plan_personalizado", contenido);
  alert("✅ Tu plan ha sido guardado correctamente.");
}

// Descargar como PDF
function descargarPlanPDF() {
  const contenidoHTML = document.getElementById("resultadoPlanPersonalizado");
  if (!contenidoHTML || !contenidoHTML.innerText.trim()) {
    alert("Primero debes generar un plan para descargar.");
    return;
  }

  // Convertimos HTML a texto plano formateado
  const doc = new jspdf.jsPDF();

  // Extraemos el texto visible
  const contenidoTexto = contenidoHTML.innerText;

  // Dividimos el texto en líneas para evitar desbordes
  const lineas = doc.splitTextToSize(contenidoTexto, 180);

  doc.setFont("Helvetica");
  doc.setFontSize(12);
  doc.text(lineas, 15, 20);

  doc.save("plan_nutricional.pdf");
}

// Carrusel de fechas
function generarCarruselFechas() {
  const contenedor = document.getElementById("fechaCarrusel");
  contenedor.innerHTML = "";

  const hoy = new Date();
  for (let i = -3; i <= 3; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);

    const div = document.createElement("div");
    div.className = "fecha-item";
    div.textContent = fecha.toLocaleDateString("es-PE", { weekday: "short", day: "numeric", month: "short" });

    if (i === 0) {
      div.classList.add("hoy");
    }

    contenedor.appendChild(div);
  }
}

// Mostrar gráfico de IMC
function mostrarGraficoIMC() {
  const datos = JSON.parse(localStorage.getItem("nutribot_datos"));
  if (!datos?.imc) return;

  const ctx = document.getElementById("graficoIMC").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Tu IMC"],
      datasets: [{
        label: "Índice de Masa Corporal (IMC)",
        data: [parseFloat(datos.imc)],
        backgroundColor: datos.imc < 18.5 ? "#03a9f4"
                        : datos.imc < 25 ? "#4caf50"
                        : datos.imc < 30 ? "#ffc107"
                        : "#f44336"
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 40
        }
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  generarCarruselFechas();
  mostrarGraficoIMC();
});

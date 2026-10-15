// Variables globales
let currentPage = -1;
const totalPages = 27;
let startX = 0; // Para detección de swipe
let transitionAnimation = 0;
let textSizeMultiplier = 1.0; // Factor para cambiar tamaño del texto
const MIN_TEXT_SIZE = 0.5;
const MAX_TEXT_SIZE = 3.0;
const TEXT_SIZE_STEP = 0.2;

// Variable para rotación de imágenes
let imageRotation = 0; // 0 = normal, 30 = +30°, -30 = -30°

// Variable para el touch
let touchStartClientX = 0;
let swipeStartX = 0;
let swipeStartY = 0;
let swipeDetected = false;
let touchOnControl = false;

// Variables para sonido
let beepSound;
let lastPageWithSound = -1;

// Botones de configuración
let configButtons = [];

// Variable para limitar cambios de página
let lastPageChangeTime = 0;
const PAGE_CHANGE_COOLDOWN = 500; // 500ms de espera

// Definiciones de los conceptos
const concepts = [
    {
        id: 0,
        name: "Exigencia Mental",
        description: "...qué tanta actividad mental o perceptual necesitas para tocar a primera vista."
    },
    {
        id: 1,
        name: "Exigencia Física",
        description: "...qué tanta demanda y habilidad física necesitas para tocar a primera vista."
    },
    {
        id: 2,
        name: "Exigencia Temporal",
        description: "...qué tanta presión percibes mientras tocas a primera vista."
    },
    {
        id: 3,
        name: "Esfuerzo",
        description: "...qué tanta motivación o exigencia general necesitas para tocar a primera vista."
    },
    {
        id: 4,
        name: "Rendimiento o «performance»",
        description: "...qué tanto éxito, confianza o bienestar percibes cuando tocas a primera vista."
    },
    {
        id: 5,
        name: "Nivel de Frustración",
        description: "...qué tanta irritación, enojo o estrés te provoca el tocar a primera vista."
    }
];

// Comparaciones por pares (página 5 a 19)
const comparisons = [
    [3, 4], // Página 5: 3-4
    [2, 5], // Página 6: 2-5
    [2, 3], // Página 7: 2-3
    [1, 5], // Página 8: 1-5
    [4, 5], // Página 9: 4-5
    [1, 2], // Página 10: 1-2
    [1, 4], // Página 11: 1-4
    [2, 0], // Página 12: 2-0
    [5, 3], // Página 13: 5-3
    [4, 0], // Página 14: 4-0
    [4, 2], // Página 15: 4-2
    [0, 3], // Página 16: 0-3
    [0, 1], // Página 17: 0-1
    [3, 1], // Página 18: 3-1
    [5, 0]  // Página 19: 5-0
];

// Variables para página 24 (escalas)
const escalas = [
  { nombre: "Exigencia Mental", bajo: "Baja", alto: "Alta", description: "...qué tanta actividad mental o perceptual necesitas para tocar a primera vista."},
  { nombre: "Exigencia Física", bajo: "Baja", alto: "Alta",description: "...qué tanta demanda y habilidad física necesitas para tocar a primera vista." },
  { nombre: "Exigencia Temporal", bajo: "Baja", alto: "Alta", description: "...qué tanta presión percibes mientras tocas a primera vista." },
  { nombre: "Esfuerzo", bajo: "Bajo", alto: "Alto", description: "...qué tanta motivación o exigencia general necesitas para tocar a primera vista." },
  { nombre: "Rendimiento o «performance»", bajo: "Bajo", alto: "Alto", description: "...qué tanto éxito, confianza o bienestar percibes cuando tocas a primera vista." },
  { nombre: "Nivel de Frustración", bajo: "Baja", alto: "Alta", description: "...qué tanta irritación, enojo o estrés te provoca el tocar a primera vista." }
];
let escalaAncho, margenEscalas, marcas;

// Colores y estilos
const colors = {
    background: 200,
    pageBg: 255,
    text: 0,
    accent: [70, 130, 180],
    buttonBg: [70, 130, 180],
    buttonHover: [50, 110, 160],
    buttonText: 255,
    optionBg: 245,
    optionBorder: 200
};

// Botones de control de texto
let plusButton, minusButton;
const BUTTON_SIZE = 30;
let fullSizeButton;

// Variables para imágenes
let stim1, stim2, stim3, stim4;
let imagesLoaded = false;

async function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.elt.style.touchAction = 'none';
    canvas.elt.setAttribute('tabindex', '0');

    canvas.elt.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.elt.addEventListener('touchend', handleTouchEnd, { passive: false });
  
    textSize(16);
    textAlign(CENTER, CENTER);
    noStroke();

    stim1 = await loadImage('imag/stim-1.png');
    stim2 = await loadImage('imag/stim-2.png');
    stim3 = await loadImage('imag/stim-3.png');
    stim4 = await loadImage('imag/stim-4.png');

    imagesLoaded = true;
    
    // Inicializar sonido (pitido simple)
    initSound();
    
    createTextControlButtons();
    inicializarEscalas();
    createConfigButtons(); // Crear botones de configuración
    
    if ('ontouchstart' in window) {
        document.addEventListener('touchmove', function(e) {
            if (e.scale !== 1) { e.preventDefault(); }
        }, { passive: false });
    }
}

function createConfigButtons() {
    configButtons = [];
    const buttonWidth = 120;
    const buttonHeight = 120;
    const spacing = 40;
    const totalWidth = (buttonWidth * 3) + (spacing * 2);
    const startX = (width - totalWidth) / 2;
    const y = height / 2;
    
    // Botón 1: Normal (0°)
    configButtons.push({
        x: startX,
        y: y,
        width: buttonWidth,
        height: buttonHeight,
        label: "1",
        rotation: 0,
        hover: false
    });
    
    // Botón 2: +30°
    configButtons.push({
        x: startX + buttonWidth + spacing,
        y: y,
        width: buttonWidth,
        height: buttonHeight,
        label: "2",
        rotation: 15,
        hover: false
    });
    
    // Botón 3: -30°
    configButtons.push({
        x: startX + (buttonWidth + spacing) * 2,
        y: y,
        width: buttonWidth,
        height: buttonHeight,
        label: "3",
        rotation: -15,
        hover: false
    });
}

function initSound() {
    beepSound = new p5.Oscillator('sine');
    beepSound.freq(1600);
    beepSound.amp(0);
    beepSound.start();
    beepSound.stop();
}

function playBeep() {
    if (beepSound) {
        try {
            beepSound.freq(1600);
            beepSound.amp(0.5);
            beepSound.start();
            setTimeout(() => {
                beepSound.stop();
            }, 200);
        } catch (e) {
            console.log("Error reproduciendo sonido");
        }
    }
}

function createTextControlButtons() {
    minusButton = {
        x: width - 100,
        y: 25,
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        label: "-",
        hover: false
    };
    
    plusButton = {
        x: width - 60,
        y: 25,
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        label: "+",
        hover: false
    };
  
    fullSizeButton = {
        x: 20,
        y: 25,
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        label: "oO",
        hover: false
    };
}

function inicializarEscalas() {
    margenEscalas = 50;
    escalaAncho = width - margenEscalas * 2;
    
    marcas = [];
    for (let i = 0; i < 21; i++) {
        let x = margenEscalas + (i * escalaAncho) / 20;
        marcas.push(x);
    }
}

function draw() {
    background(colors.background);
    
    if (transitionAnimation !== 0) {
        push();
        translate(transitionAnimation, 0);
        drawPage(currentPage);
        pop();
        
        transitionAnimation *= 0.85;
        if (abs(transitionAnimation) < 0.5) transitionAnimation = 0;
    } else {
        drawPage(currentPage);
    }
    
    // Solo mostrar botones de texto si no estamos en la página de configuración
    if (currentPage !== -1) {
        drawTextControlButtons();
    }
    drawInstructions();
    
    // Reproducir pitido cuando se llega a páginas con imágenes
    if (currentPage === 20 || currentPage === 21 || currentPage === 22 || currentPage === 23) {
        if (lastPageWithSound !== currentPage) {
            playBeep();
            lastPageWithSound = currentPage;
        }
    } else {
        lastPageWithSound = -1;
    }
}

function drawConfigPage() {
    // Página vacía excepto los botones
    fill(colors.text);
    textAlign(CENTER);
    
    // Instrucción simple
    textSize(24 * textSizeMultiplier);
    text("Selecciona cómo se mostrarán las imágenes:", width/2, 150);
    
    // Actualizar estado de hover de botones
    updateConfigButtonsHover();
    
    // Dibujar los 3 botones
    for (let button of configButtons) {
        // Fondo del botón
        fill(button.hover ? colors.buttonHover : colors.buttonBg);
        stroke(colors.optionBorder);
        strokeWeight(2);
        rect(button.x, button.y, button.width, button.height, 20);
        noStroke();
        
        // Número grande
        fill(colors.buttonText);
        textSize(48 * textSizeMultiplier);
        textAlign(CENTER, CENTER);
        text(button.label, button.x + button.width/2, button.y + button.height/2);
    }
}

function updateConfigButtonsHover() {
    for (let button of configButtons) {
        button.hover = (
            mouseX >= button.x && 
            mouseX <= button.x + button.width &&
            mouseY >= button.y && 
            mouseY <= button.y + button.height
        );
    }
}

function drawTextControlButtons() {
    updateButtonHover();
    
    fill(minusButton.hover ? colors.buttonHover : colors.buttonBg);
    rect(minusButton.x, minusButton.y, minusButton.width, minusButton.height, 5);
    fill(colors.buttonText);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(minusButton.label, minusButton.x + minusButton.width/2, minusButton.y + minusButton.height/2);
    
    fill(plusButton.hover ? colors.buttonHover : colors.buttonBg);
    rect(plusButton.x, plusButton.y, plusButton.width, plusButton.height, 5);
    fill(colors.buttonText);
    text(plusButton.label, plusButton.x + plusButton.width/2, plusButton.y + plusButton.height/2);
    
    fill(colors.text);
    textSize(12);
    textAlign(RIGHT);
    text(`${Math.round(textSizeMultiplier * 100)}%`, minusButton.x - 10, minusButton.y + BUTTON_SIZE/2 + 4);
}

function updateButtonHover() {
    minusButton.hover = (
        mouseX >= minusButton.x && 
        mouseX <= minusButton.x + minusButton.width &&
        mouseY >= minusButton.y && 
        mouseY <= minusButton.y + minusButton.height
    );
    
    plusButton.hover = (
        mouseX >= plusButton.x && 
        mouseX <= plusButton.x + plusButton.width &&
        mouseY >= plusButton.y && 
        mouseY <= minusButton.height
    );
}

function drawInstructions() {
    // No mostrar instrucciones en página de configuración
    if (currentPage === -1) return;
    
    fill(colors.text);
    textSize(14 * textSizeMultiplier);
    textStyle(BOLD);
    textAlign(CENTER);
    
    if (currentPage < totalPages - 1) {
        text("Desliza hacia la izquierda", width/2, height - 25);
    } else {
        text("Fin del experimento", width/2, height - 25);
    }
    textStyle(NORMAL);
}

function drawPage(pageNum) {
    // Página especial de configuración (-1)
    if (pageNum === -1) {
        drawConfigPage();
        return;
    }
    
    // Páginas normales (del 0 al 25)
    fill(colors.pageBg);
    rect(10, 10, width - 20, height - 50, 20);
    
    // Ajustar números de página (antes 0-25, ahora 0-26)
    switch(pageNum) {
        case 0:
            drawWelcomePage();
            break;
        case 1:
            drawPage2();
            break;
        case 2:
            drawPage3();
            break;
        case 3:
            drawPage4();
            break;
        case 4: case 5: case 6: case 7: case 8: 
        case 9: case 10: case 11: case 12: case 13:
        case 14: case 15: case 16: case 17: case 18:
            drawComparisonPage(pageNum - 4);
            break;
        case 19:
            drawPage20();
            break;
        case 20:
            drawImagePage(stim1, "Fragmento 1");
            break;
        case 21:
            drawImagePage(stim2, "Fragmento 2");
            break;
        case 22:
            drawImagePage(stim3, "Fragmento 3");
            break;
        case 23:
            drawImagePage(stim4, "Fragmento 4");
            break;
        case 24:
            drawPage24();
            break;
        case 25:
            drawPage25();
            break;
        case 26:
            drawPage26();
            break;
        default:
            fill(colors.text);
            textSize(24 * textSizeMultiplier);
            textAlign(CENTER, CENTER);
            text(`Página ${pageNum + 1}`, width/2, height/2);
    }
}

// FUNCIONES EXISTENTES (sin cambios excepto drawImagePage)
function drawWelcomePage() {
    fill(colors.text);
    textAlign(CENTER);
    textStyle(BOLD);
    
    textSize(32 * textSizeMultiplier);
    text("Bienvenida, Bienvenido.", width/2, 80);
  
    textStyle(NORMAL);
    
    textSize(20 * textSizeMultiplier);
    textAlign(LEFT);
    
    const paragraph1 = "Esta prueba toma alrededor de 30 minutos. Ajusta tu banco y, cuando estés lista o listo, desliza la pantalla hacia la izquierda. \nEsto pasará las páginas del estudio, una a una.\n \nTodo el experimento requiere que des tus respuestas en voz alta.";
    
    const margin = 60;
    const lineHeight = 30 * textSizeMultiplier;
    
    text(paragraph1, margin, 250, width - 2*margin);
}

function drawPage2() {
    // ... (código existente, sin cambios)
    fill(colors.text);
    textAlign(LEFT);
    
    textSize(28 * textSizeMultiplier);
    textAlign(CENTER);
    text("Esta es la Primera sección.", width/2, 80);
    
    textSize(22 * textSizeMultiplier);
    text("Di las respuestas en voz alta por favor.", width/2, 120);
    
    textSize(20 * textSizeMultiplier);
    textAlign(CENTER);
    
    const questions = [
        "¿Cuál es tu edad?",
        "¿Cuál es tu sexo?",
        "¿Qué año de piano cursas y en qué nivel?",
        "¿Con qué profesor estudias?",
        "¿Usas algún tipo de corrección de la vista?",
        "Del 1 al 7 ¿Qué tanta experiencia tienes con lectura a primera vista?"
    ];
    
    const startY = 200;
    const lineHeight = 60 * textSizeMultiplier;
    const margin = 80;
    
    for (let i = 0; i < questions.length; i++) {
        text(questions[i], margin, startY + (i * lineHeight), width - 2*margin);
    }
}

function drawPage3() {
    // ... (código existente, sin cambios)
    fill(colors.text);
    textAlign(LEFT);
    
    textSize(28 * textSizeMultiplier);
    textAlign(CENTER);
    text("Continúa Primera sección.", width/2, 80);
    
    textSize(22 * textSizeMultiplier);
    text("Di las respuestas en voz alta por favor.", width/2, 120);
    
    textSize(20 * textSizeMultiplier);
    
    const questions = [
        "¿Conoces algún tipo de notación experimental?",
        "¿Recibiste algún tipo de educación para interpretar notación experimental?",
        "¿Has interpretado alguna composición que utilice este tipo de notación?",
        "¿Recibiste algún tipo de educación para interpretar música anterior al Barroco?",
        "¿Tocas obras de compositores vivos?"
    ];
    
    const startY = 200;
    const lineHeight = 80 * textSizeMultiplier;
    const margin = 80;
    
    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        push();
        textSize(20 * textSizeMultiplier);
        const questionWidth = textWidth(question);
        
        if (questionWidth > (width - 2*margin)) {
            const words = question.split(' ');
            let currentLine = words[0];
            let lineCount = 0;
            
            for (let j = 1; j < words.length; j++) {
                const testLine = currentLine + ' ' + words[j];
                const testWidth = textWidth(testLine);
                
                if (testWidth <= (width - 2*margin)) {
                    currentLine = testLine;
                } else {
                    text(currentLine, margin, startY + (i * lineHeight) + (lineCount * 25 * textSizeMultiplier), width - 2*margin);
                    currentLine = words[j];
                    lineCount++;
                }
            }
            text(currentLine, margin, startY + (i * lineHeight) + (lineCount * 25 * textSizeMultiplier), width - 2*margin);
        } else {
            text(question, margin, startY + (i * lineHeight), width - 2*margin);
        }
        pop();
    }
}

function drawPage4() {
    // ... (código existente, sin cambios)
    fill(colors.text);
    textAlign(CENTER);
    
    textSize(26 * textSizeMultiplier);
    text("Segunda sección", width/2, 80);
    
    textSize(18 * textSizeMultiplier);
  
    text("Antes de continuar, lee con atención estas definiciones por favor,\n cuando estés lista o listo, desliza para continuar...", width/2, 120);
    
    const margin = 60;
    const itemHeight = 65 * textSizeMultiplier;
    const startY = 180;
    
    for (let i = 0; i < concepts.length; i++) {
        const concept = concepts[i];
        const itemY = startY + (i * itemHeight);
        
        fill(colors.accent);
        textSize(20 * textSizeMultiplier);
        text(`"${concept.name}"`, width/2, itemY);
        
        fill(colors.text);
        textSize(16 * textSizeMultiplier);
        
        const descLines = splitTextToFit(concept.description, width - 2*margin, 16 * textSizeMultiplier);
        const descLineHeight = 18 * textSizeMultiplier;
        
        for (let j = 0; j < descLines.length; j++) {
            text(descLines[j], width/2, itemY + 20 + (j * descLineHeight));
        }
    }
}

function drawComparisonPage(comparisonIndex) {
    // ... (código existente, sin cambios)
    if (comparisonIndex >= comparisons.length) return;
    
    const [conceptA, conceptB] = comparisons[comparisonIndex];
    const concept1 = concepts[conceptA];
    const concept2 = concepts[conceptB];
    
    fill(colors.text);
    textAlign(CENTER);
    
    textSize(28 * textSizeMultiplier);
    text("¿Qué es más importante?", width/2, 60);
    
    textSize(18 * textSizeMultiplier);
    fill(colors.accent);
    text("Menciona tu elección en voz alta", width/2, 95);
    
    const margin = 60;
    const centerX = width / 2;
    const optionWidth = (width - 3 * margin) / 2;
    const optionHeight = 280;
    
    drawOption(concept1, margin, 120, optionWidth, optionHeight);
    
    textSize(32 * textSizeMultiplier);
    fill(0);
    text("o", centerX, 120 + optionHeight/2);
    
    drawOption(concept2, margin + optionWidth + margin, 120, optionWidth, optionHeight);
    
    textSize(16 * textSizeMultiplier);
    fill(colors.text);
    text(`Comparación ${comparisonIndex + 1} de ${comparisons.length}`, width/2, height - 80);
}

function drawOption(concept, x, y, w, h) {
    // ... (código existente, sin cambios)
    fill(colors.optionBg);
    stroke(colors.optionBorder);
    strokeWeight(1);
    rect(x, y, w, h, 10);
    noStroke();
    
    fill(colors.accent);
    textSize(22 * textSizeMultiplier);
    textAlign(CENTER);
    text(`"${concept.name}"`, x + w/2, y + 40);
    
    fill(colors.text);
    textSize(18 * textSizeMultiplier);
    textAlign(CENTER);
    
    const descLines = splitTextToFit(concept.description, w - 40, 18 * textSizeMultiplier);
    const lineHeight = 26 * textSizeMultiplier;
    const startY = y + 90;
    
    for (let i = 0; i < descLines.length; i++) {
        text(descLines[i], x + w/2, startY + (i * lineHeight));
    }
}

function drawPage20() {
    // ... (código existente, sin cambios)
    fill(colors.text);
    textAlign(CENTER);
    
    textSize(28 * textSizeMultiplier);
    text("Tercera sección.", width/2, 80);
    
    textSize(22 * textSizeMultiplier);
    
    const lines = [
        "A continuación, se te mostrarán unos fragmentos de partitura.",
        "\n Obsérvalos el tiempo que necesites y, cuando estés lista o listo,\n tócalos.\n\n Ninguna modificación del fragmento es un error,\n todo tiene un propósito."
    ];
    
    const lineHeight = 70 * textSizeMultiplier;
    const startY = 250;
    
    for (let i = 0; i < lines.length; i++) {
        text(lines[i], width/2, startY + (i * lineHeight));
    }
    
    textSize(15 * textSizeMultiplier);
    fill(colors.accent);
    text("Desliza para ver el primer fragmento →", width/2, height - 100);
}

// ==================== DIBUJAR IMAGEN CON ROTACIÓN ====================
function drawImagePage(img, title) {
    fill(colors.text);
    textAlign(CENTER);
    
    textSize(26 * textSizeMultiplier);
    text(title, width/2, 60);
    
    textSize(18 * textSizeMultiplier);
    fill(colors.accent);
    text("Observa el fragmento y tócalo", width/2, 95);
    
    if (img && img.width > 0) {
        const maxWidth = width - 100;
        const maxHeight = height - 150;
        
        const imgRatio = img.width / img.height;
        const maxRatio = maxWidth / maxHeight;
        
        let imgDisplayWidth, imgDisplayHeight;
        
        if (imgRatio > maxRatio) {
            imgDisplayWidth = min(img.width, maxWidth);
            imgDisplayHeight = imgDisplayWidth / imgRatio;
        } else {
            imgDisplayHeight = min(img.height, maxHeight);
            imgDisplayWidth = imgDisplayHeight * imgRatio;
        }
        
        const x = width / 2 - imgDisplayWidth / 2;
        const y = 120 + (maxHeight - imgDisplayHeight) / 2;
        
        // DIBUJAR CON ROTACIÓN SI ESTÁ CONFIGURADA
        push();
        if (imageRotation !== 0) {
            translate(x + imgDisplayWidth/2, y + imgDisplayHeight/2);
            rotate(radians(imageRotation));
            image(img, -imgDisplayWidth/2, -imgDisplayHeight/2, imgDisplayWidth, imgDisplayHeight);
        } else {
            image(img, x, y, imgDisplayWidth, imgDisplayHeight);
        }
        pop();
        
    } else {
        textSize(20 * textSizeMultiplier);
        fill(colors.accent);
        text("Imagen no encontrada", width/2, height/2 - 30);
        textSize(16 * textSizeMultiplier);
        fill(colors.text);
        text("Asegúrate de que el archivo exista en la carpeta /imgs/", width/2, height/2 + 20);
    }
}

// ==================== PÁGINA 24 - VERSIÓN MODIFICADA ====================
function drawPage24() {
    // ... (código existente, sin cambios)
    fill(colors.text);
    textAlign(CENTER);
    
    textSize(28 * textSizeMultiplier);
    text("Esta es la Cuarta sección.", width/2, 50);
    
    textSize(15 * textSizeMultiplier);
    text("Con un número del 0 al 100,\n indica en voz alta qué calificación le das a cada ítem.", width/2, 85);
    
    const alturaPorEscala = 75;
    const espacioEntre = 20; 
    const startY = 125;
    
    for (let i = 0; i < escalas.length; i++) {
        let y = startY + i * (alturaPorEscala + espacioEntre);
        dibujarEscalaModificada(i, y);
    }
}

function dibujarEscalaModificada(index, yBase) {
    // ... (código existente, sin cambios)
    let yNombre = yBase;
    let yLinea = yBase + 35;
    let yEtiquetas = yBase + 55;
    
    fill(colors.text);
    textSize(16 * textSizeMultiplier);
    textAlign(LEFT);
    text(`${index + 1}. ${escalas[index].nombre}`, margenEscalas, yNombre);
  
    fill(colors.text);
    textSize(10 * textSizeMultiplier);
    textAlign(LEFT);
    text(`${escalas[index].description}`, margenEscalas, yNombre + 17);
    
    stroke(colors.text);
    strokeWeight(1.5);
    line(margenEscalas, yLinea, margenEscalas + escalaAncho, yLinea);
    
    let medioX = margenEscalas + escalaAncho / 2;
    stroke(colors.text);
    strokeWeight(1.5);
    line(medioX, yLinea - 15, medioX, yLinea + 15);
    
    strokeWeight(1);
    for (let i = 0; i < marcas.length; i++) {
        let x = marcas[i];
        
        if (i === 10) continue;
        
        stroke(colors.text);
        
        if (i % 5 === 0) {
            line(x, yLinea - 10, x, yLinea + 10);
        } else {
            line(x, yLinea - 5, x, yLinea + 5);
        }
    }
    
    noStroke();
    fill(colors.text);
    textSize(14 * textSizeMultiplier);
    
    textAlign(LEFT);
    text(escalas[index].bajo, margenEscalas, yEtiquetas);
    
    textAlign(RIGHT);
    text(escalas[index].alto, margenEscalas + escalaAncho, yEtiquetas);
}

// ==================== PÁGINA 25 - PREGUNTAS FINALES ====================
function drawPage25() {
    // ... (código existente, sin cambios)
    fill(colors.text);
    textAlign(CENTER);
    
    textSize(28 * textSizeMultiplier);
    text("Esta es la Quinta y última sección,\n necesitamos tu opinión.", width/2, 100);
    
    textSize(22 * textSizeMultiplier);
    text("Por favor, responde estas preguntas en voz alta.", width/2, 180);

    textSize(20 * textSizeMultiplier);
    textAlign(LEFT);
    
    const preguntas = [
        "¿Qué estrategia utilizaste para interpretar los fragmentos?",
        "¿Qué tipo de dificultades encontraste?",
        "¿Qué indicaciones crees que te hubiera dado el compositor de los fragmentos?"
    ];

    const startY = 250;
    const lineHeight = 80 * textSizeMultiplier;
    const margin = 70;
    const espacioRespuesta = 45 * textSizeMultiplier;
    
    for (let i = 0; i < preguntas.length; i++) {
        let preguntaY = startY + (i * lineHeight);
        
        fill(colors.text);
        textSize(20 * textSizeMultiplier);
        
        const pregunta = preguntas[i];
        const preguntaWidth = textWidth(pregunta);
        
        if (preguntaWidth > (width - 2*margin)) {
            const words = pregunta.split(' ');
            let currentLine = words[0];
            let lineCount = 0;
            
            for (let j = 1; j < words.length; j++) {
                const testLine = currentLine + ' ' + words[j];
                const testWidth = textWidth(testLine);
                
                if (testWidth <= (width - 2*margin)) {
                    currentLine = testLine;
                } else {
                    text(currentLine, margin, preguntaY + (lineCount * 28 * textSizeMultiplier), width - 2*margin);
                    currentLine = words[j];
                    lineCount++;
                }
            }
            text(currentLine, margin, preguntaY + (lineCount * 28 * textSizeMultiplier), width - 2*margin);
            
            let lineaY = preguntaY + (lineCount * 28 * textSizeMultiplier) + 40;
            stroke(180);
            strokeWeight(1);
            drawingContext.setLineDash([5, 5]);
            line(margin, lineaY, width - margin, lineaY);
            drawingContext.setLineDash([]);
            noStroke();
        } else {
            text(pregunta, margin, preguntaY, width - 2*margin);
            
            stroke(180);
            strokeWeight(1);
            drawingContext.setLineDash([5, 5]);
            line(margin, preguntaY + espacioRespuesta, width - margin, preguntaY + espacioRespuesta);
            drawingContext.setLineDash([]);
            noStroke();
        }
    }
}

// ==================== PÁGINA 26 - PÁGINA FINAL ====================
function drawPage26() {
    // ... (código existente, sin cambios)
    fill(colors.text);
    textAlign(CENTER);
    
    textSize(36 * textSizeMultiplier);
    text("¡Gracias!", width/2, height/2 - 80);
    
    textSize(28 * textSizeMultiplier);
    text("Tu ayuda es muy importante", width/2, height/2);
    
    textSize(22 * textSizeMultiplier);
    fill(colors.accent);
    text("Experimento completado", width/2, height/2 + 100);
}

// ==================== FUNCIONES AUXILIARES ====================
function splitTextToFit(text, maxWidth, fontSize) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    
    push();
    textSize(fontSize);
    
    for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const testWidth = textWidth(testLine);
        
        if (testWidth <= maxWidth) {
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }
    lines.push(currentLine);
    
    pop();
    
    return lines;
}

function keyPressed(event) {
    if (event.code === 'ArrowRight' || event.code === 'KeyS') {
        nextPage();
        return false;
    }

    if (event.code === 'ArrowLeft') {
        prevPage();
        return false;
    }
}

function mousePressed() {
    startX = mouseX;
    
    // VERIFICAR CLIC EN BOTONES DE CONFIGURACIÓN
    if (currentPage === -1) {
        for (let button of configButtons) {
            if (button.hover) {
                imageRotation = button.rotation;
                console.log(`Imágenes configuradas: ${button.rotation}° (Botón ${button.label})`);
                nextPage(); // Ir a la página de bienvenida
                return false;
            }
        }
    }
    
    if (minusButton.hover) {
        decreaseTextSize();
        return false;
    }
    
    if (plusButton.hover) {
        increaseTextSize();
        return false;
    }
    
    return true;
}

function mouseReleased() {
    if (mouseButton.left) {
        let endX = mouseX;
        let diffX = startX - endX;
        let threshold = 50;
        
        if (diffX > threshold) {
            nextPage();
        } else if (diffX < -threshold) {
            prevPage();
        }
    }
}

function increaseTextSize() {
    if (textSizeMultiplier < MAX_TEXT_SIZE) {
        textSizeMultiplier += TEXT_SIZE_STEP;
        inicializarEscalas();
    }
}

function decreaseTextSize() {
    if (textSizeMultiplier > MIN_TEXT_SIZE) {
        textSizeMultiplier -= TEXT_SIZE_STEP;
        inicializarEscalas();
    }
}

// ==================== FUNCIONES DE CAMBIO DE PÁGINA CON COOLDOWN ====================
function nextPage() {
    const now = millis();
    if (now - lastPageChangeTime < PAGE_CHANGE_COOLDOWN) {
        return; // Ignorar si no ha pasado el tiempo de cooldown
    }
    
    if (currentPage < totalPages - 1) {
        currentPage++;
        transitionAnimation = width;
        lastPageChangeTime = now;
    }
}

function prevPage() {
    const now = millis();
    if (now - lastPageChangeTime < PAGE_CHANGE_COOLDOWN) {
        return; // Ignorar si no ha pasado el tiempo de cooldown
    }
    
    if (currentPage > -1) { // Permitir volver desde página 0
        currentPage--;
        transitionAnimation = -width;
        lastPageChangeTime = now;
    }
}

function touchStarted(event) {
    if (event.changedTouches && event.changedTouches.length > 0) {
        touchStartClientX = event.changedTouches[0].clientX;
    } else {
        touchStartClientX = mouseX;
    }

    // Mantener la selección de botones de configuración.
    if (currentPage === -1) {
        for (let button of configButtons) {
            if (
                mouseX >= button.x &&
                mouseX <= button.x + button.width &&
                mouseY >= button.y &&
                mouseY <= button.y + button.height
            ) {
                imageRotation = button.rotation;
                nextPage();
                return false;
            }
        }
    }

    // Mantener los controles de tamaño de texto.
    if (
        currentPage !== -1 &&
        mouseX >= minusButton.x &&
        mouseX <= minusButton.x + minusButton.width &&
        mouseY >= minusButton.y &&
        mouseY <= minusButton.y + minusButton.height
    ) {
        decreaseTextSize();
        return false;
    }

    if (
        currentPage !== -1 &&
        mouseX >= plusButton.x &&
        mouseX <= plusButton.x + plusButton.width &&
        mouseY >= plusButton.y &&
        mouseY <= plusButton.y + plusButton.height
    ) {
        increaseTextSize();
        return false;
    }

    return false;
}

function touchEnded(event) {
    let endX;

    if (event.changedTouches && event.changedTouches.length > 0) {
        endX = event.changedTouches[0].clientX;
        const diffX = touchStartClientX - endX;

        if (diffX > 50) {
            nextPage();
        } else if (diffX < -50) {
            prevPage();
        }
    } else {
        const diffX = startX - mouseX;

        if (diffX > 50) {
            nextPage();
        } else if (diffX < -50) {
            prevPage();
        }
    }

    return false;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    createTextControlButtons();
    createConfigButtons();
    inicializarEscalas();
}

function handleImage(loadedImg) {
  loadedImg.resize(windowHeight, 0);
}

function handleTouchStart(event) {
    if (event.touches.length !== 1) return;

    const ect = event.currentTarget.getBoundingClientRect();
    swipeStartX = event.touches[0].clientX - ect.left;
    swipeStartY = event.touches[0].clientY - ect.top;
    swipeDetected = false;

    touchOnControl =
        currentPage === -1 ||
        (
            currentPage !== -1 &&
            (
                (
                    swipeStartX >= minusButton.x &&
                    swipeStartX <= minusButton.x + minusButton.width &&
                    swipeStartY >= minusButton.y &&
                    swipeStartY <= minusButton.y + minusButton.height
                ) ||
                (
                    swipeStartX >= plusButton.x &&
                    swipeStartX <= plusButton.x + plusButton.width &&
                    swipeStartY >= plusButton.y &&
                    swipeStartY <= plusButton.y + plusButton.height
                )
            )
        );

    event.preventDefault();
}

function handleTouchEnd(event) {
    if (event.changedTouches.length !== 1) return;
    if (touchOnControl) return;

    const ect = event.currentTarget.getBoundingClientRect();
    const endX = event.changedTouches[0].clientX - ect.left;
    const endY = event.changedTouches[0].clientY - ect.top;

    const diffX = swipeStartX - endX;
    const diffY = Math.abs(swipeStartY - endY);

    if (Math.abs(diffX) > 50 && Math.abs(diffX) > diffY * 1.2) {
        if (diffX > 0) {
            nextPage();
        } else {
            prevPage();
        }
    }

    event.preventDefault();
    touchOnControl = false;
}

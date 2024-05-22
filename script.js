document.addEventListener('DOMContentLoaded', function() {
    fetch('datos_encuesta.json')
        .then(response => response.json())
        .then(data => {
            window.encuestas = data;
            generarListaDesplegable();
            configurarFiltros();
        })
        .catch(error => console.error('Error al cargar los datos del JSON:', error));
});

function generarListaDesplegable() {
    const select = document.getElementById('encuestados');
    select.innerHTML = '';

    const filtroSexo = document.getElementById('filtro-sexo').value;
    const filtroGrado = document.getElementById('filtro-grado').value;
    const filtroEdad = document.getElementById('filtro-edad').value;

    const encuestasFiltradas = encuestas.filter(encuesta => {
        return (filtroSexo === 'Todos' || encuesta['Sexo'] === filtroSexo) &&
               (filtroGrado === 'Todos' || encuesta['Grado'] === filtroGrado) &&
               (filtroEdad === 'Todos' || encuesta['Edad'] === filtroEdad);
    });

    encuestasFiltradas.forEach(encuesta => {
        const option = document.createElement('option');
        option.value = encuesta.Nombre;
        option.textContent = encuesta.Nombre;
        select.appendChild(option);
    });

    select.addEventListener('change', mostrarResultados);

    if (encuestasFiltradas.length > 0) {
        select.value = encuestasFiltradas[0].Nombre;
        mostrarResultados();
    } else {
        document.getElementById('resultados-individuales').innerHTML = '<p>No hay resultados para los filtros seleccionados.</p>';
        document.getElementById('resultados-medios').innerHTML = '';
    }

    calcularMedias(encuestasFiltradas);
}

function configurarFiltros() {
    const filtroSexo = document.getElementById('filtro-sexo');
    const filtroGrado = document.getElementById('filtro-grado');
    const filtroEdad = document.getElementById('filtro-edad');

    filtroSexo.addEventListener('change', generarListaDesplegable);
    filtroGrado.addEventListener('change', generarListaDesplegable);
    filtroEdad.addEventListener('change', generarListaDesplegable);
}

function mostrarResultados() {
    const nombreSeleccionado = document.getElementById('encuestados').value;
    const encuestaSeleccionada = encuestas.find(encuesta => encuesta.Nombre === nombreSeleccionado);
    mostrarResultadosIndividuales(encuestaSeleccionada);
}

function mostrarResultadosIndividuales(encuesta) {
    const resultadosContainer = document.getElementById('resultados-individuales');
    resultadosContainer.innerHTML = '';

    const titulo = document.createElement('h2');
    titulo.textContent = `Resultados de ${encuesta.Nombre}`;
    resultadosContainer.appendChild(titulo);

    const listaResultados = document.createElement('ul');
    for (const pregunta in encuesta) {
        if (pregunta !== 'Nombre' && pregunta !== 'Marca temporal') {
            const respuesta = encuesta[pregunta];
            const item = document.createElement('li');

            const spanPregunta = document.createElement('span');
            spanPregunta.classList.add('pregunta');
            spanPregunta.textContent = pregunta + ': ';

            const spanRespuesta = document.createElement('span');
            spanRespuesta.classList.add('respuesta');
            spanRespuesta.textContent = respuesta;

            item.appendChild(spanPregunta);
            item.appendChild(spanRespuesta);
            listaResultados.appendChild(item);
        }
    }
    resultadosContainer.appendChild(listaResultados);
}

function calcularMedias(encuestas) {
    if (encuestas.length === 0) {
        mostrarMedias(null, null);
        return;
    }

    const horarios = encuestas.map(encuesta => encuesta['¿A qué hora sueles irte a dormir?']);
    const siestas = encuestas.map(encuesta => encuesta['¿Cuántas veces a la semana duermes la siesta?']);

    const mediaHorarios = calcularFrecuenciaHorarios(horarios);
    const mediaSiestas = calcularFrecuenciaSiestas(siestas);

    mostrarMedias(mediaHorarios, mediaSiestas);
}

function calcularFrecuenciaHorarios(horarios) {
    const conteo = {
        '19:00 - 21:00': 0,
        '21:00 - 00:00': 0,
        '00:00 en adelante': 0
    };

    horarios.forEach(horario => {
        if (conteo.hasOwnProperty(horario)) {
            conteo[horario]++;
        }
    });

    const total = horarios.length;
    return {
        '19:00 - 21:00': (conteo['19:00 - 21:00'] / total) * 100,
        '21:00 - 00:00': (conteo['21:00 - 00:00'] / total) * 100,
        '00:00 en adelante': (conteo['00:00 en adelante'] / total) * 100
    };
}

function calcularFrecuenciaSiestas(siestas) {
    const conteo = {
        'No sé que es eso': 0,
        '1 vez por semana': 0,
        '2-5 veces por semana': 0,
        'Todos los días': 0
    };

    siestas.forEach(siesta => {
        if (conteo.hasOwnProperty(siesta)) {
            conteo[siesta]++;
        }
    });

    const total = siestas.length;
    return {
        'No sé que es eso': (conteo['No sé que es eso'] / total) * 100,
        '1 vez por semana': (conteo['1 vez por semana'] / total) * 100,
        '2-5 veces por semana': (conteo['2-5 veces por semana'] / total) * 100,
        'Todos los días': (conteo['Todos los días'] / total) * 100
    };
}

function mostrarMedias(mediaHorarios, mediaSiestas) {
    const resultadosMediosContainer = document.getElementById('resultados-medios');
    resultadosMediosContainer.innerHTML = '';

    const titulo = document.createElement('h2');
    titulo.textContent = 'Resultados Medios';
    resultadosMediosContainer.appendChild(titulo);

    if (mediaHorarios !== null && mediaSiestas !== null) {
        const listaMedias = document.createElement('ul');

        const itemHorario1 = document.createElement('li');
        itemHorario1.textContent = `Porcentaje que se va a dormir entre 19:00 - 21:00: ${mediaHorarios['19:00 - 21:00'].toFixed(2)}%`;
        listaMedias.appendChild(itemHorario1);

        const itemHorario2 = document.createElement('li');
        itemHorario2.textContent = `Porcentaje que se va a dormir entre 21:00 - 00:00: ${mediaHorarios['21:00 - 00:00'].toFixed(2)}%`;
        listaMedias.appendChild(itemHorario2);

        const itemHorario3 = document.createElement('li');
        itemHorario3.textContent = `Porcentaje que se va a dormir después de las 00:00: ${mediaHorarios['00:00 en adelante'].toFixed(2)}%`;
        listaMedias.appendChild(itemHorario3);

        const itemSiesta1 = document.createElement('li');
        itemSiesta1.textContent = `Porcentaje que no duerme siesta: ${mediaSiestas['No sé que es eso'].toFixed(2)}%`;
        listaMedias.appendChild(itemSiesta1);

        const itemSiesta2 = document.createElement('li');
        itemSiesta2.textContent = `Porcentaje que duerme siesta 1 vez por semana: ${mediaSiestas['1 vez por semana'].toFixed(2)}%`;
        listaMedias.appendChild(itemSiesta2);

        const itemSiesta3 = document.createElement('li');
        itemSiesta3.textContent = `Porcentaje que duerme siesta 2-5 veces por semana: ${mediaSiestas['2-5 veces por semana'].toFixed(2)}%`;
        listaMedias.appendChild(itemSiesta3);

        const itemSiesta4 = document.createElement('li');
        itemSiesta4.textContent = `Porcentaje que duerme siesta todos los días: ${mediaSiestas['Todos los días'].toFixed(2)}%`;
        listaMedias.appendChild(itemSiesta4);

        resultadosMediosContainer.appendChild(listaMedias);
    } else {
        resultadosMediosContainer.textContent = 'No hay datos disponibles para calcular las medias.';
    }
}

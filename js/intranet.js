// ===== 1. SELECCIÓN DEL DOM: busca en el árbol los elementos por su id =====
const form = document.getElementById('formEstudiante');
const tabla = document.getElementById('tablaEstudiantes');
const buscador = document.getElementById('buscador');
const btnGuardar = document.getElementById('btnGuardar');
const btnCancelar = document.getElementById('btnCancelar');
let idEditando = null; // null = estamos agregando; un número = estamos editando ese estudiante

// ===== 2. DATOS: leer de localStorage (JSON → arreglo) =====
let estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];

function guardarEstudiantes() {
  localStorage.setItem('estudiantes', JSON.stringify(estudiantes));
}

// ===== 3. ALTA Y EDICIÓN: al enviar el formulario capturo el evento submit,
// evito la recarga, armo un objeto con los datos ingresados, lo valido y, si es correcto,
// lo agrego (o lo actualizo si estoy editando), lo guardo en localStorage y actualizo la tabla =====
form.addEventListener('submit', function (event) {
  event.preventDefault(); // Evita la recarga de la página

  const nuevoEstudiante = {
    id: Date.now(),
    apellido: document.getElementById('apellido').value.trim(),
    nombre: document.getElementById('nombre').value.trim(),
    dni: document.getElementById('dni').value.trim(),
    curso: document.getElementById('curso').value.trim()
  };

  // Validaciones: campos vacíos, DNI válido y DNI no repetido
  if (!nuevoEstudiante.apellido || !nuevoEstudiante.nombre || !nuevoEstudiante.dni || !nuevoEstudiante.curso) {
    alert('Por favor, completa todos los campos.');
    return;
  }
  if (nuevoEstudiante.dni.length < 7 || nuevoEstudiante.dni.length > 8 || isNaN(nuevoEstudiante.dni)) {
    alert('Por favor, ingresa un DNI válido (7 u 8 dígitos).');
    return;
  }
  // Al editar, se excluye al mismo estudiante para que no se compare consigo mismo
  if (estudiantes.some(est => est.dni === nuevoEstudiante.dni && est.id !== idEditando)) {
    alert('Ya existe un estudiante con ese DNI.');
    return;
  }

  if (idEditando === null) {
    estudiantes.push(nuevoEstudiante); // ALTA
  } else {
    nuevoEstudiante.id = idEditando; // EDICIÓN: mantiene su id original
    estudiantes = estudiantes.map(est => est.id === idEditando ? nuevoEstudiante : est);
  }

  guardarEstudiantes();
  salirDeEdicion(); // limpia el formulario y actualiza la tabla
});

// ===== 4. MOSTRAR TABLA: recibe la lista que tiene que mostrar =====
function actualizarTabla(lista) {
  tabla.innerHTML = ''; // Limpia la tabla antes de actualizarla

  if (lista.length === 0) {
    tabla.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay estudiantes registrados.</td></tr>';
    return;
  }

  lista.forEach(estudiante => {
    tabla.innerHTML += `
      <tr>
        <td>${estudiante.apellido}</td>
        <td>${estudiante.nombre}</td>
        <td>${estudiante.dni}</td>
        <td>${estudiante.curso}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1" onclick="editarEstudiante(${estudiante.id})">Editar</button>
          <button class="btn btn-sm btn-outline-danger" onclick="eliminarEstudiante(${estudiante.id})">Eliminar</button>
        </td>
      </tr>`;
  });
}

// ===== 5. ELIMINAR (evento click) =====
function eliminarEstudiante(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este estudiante?')) return;

  estudiantes = estudiantes.filter(est => est.id !== id); // nos quedamos con todos menos ese
  guardarEstudiantes();
  actualizarTabla(estudiantes);
}

// ===== 6. EDITAR (evento click) =====
function editarEstudiante(id) {
  const est = estudiantes.find(e => e.id === id); // buscamos el estudiante por su id
  if (!est) return;

  // Cargamos sus datos en el formulario
  document.getElementById('apellido').value = est.apellido;
  document.getElementById('nombre').value = est.nombre;
  document.getElementById('dni').value = est.dni;
  document.getElementById('curso').value = est.curso;

  idEditando = id;
  btnGuardar.innerHTML = '<i class="bi bi-check-lg me-1"></i>Guardar cambios';
  btnCancelar.classList.remove('d-none'); // mostramos Cancelar
  form.scrollIntoView({ behavior: 'smooth' }); // subimos al formulario
}

function salirDeEdicion() {
  idEditando = null;
  form.reset();
  btnGuardar.innerHTML = '<i class="bi bi-plus-lg me-1"></i>Agregar';
  btnCancelar.classList.add('d-none'); // ocultamos Cancelar
  actualizarTabla(estudiantes);
}

btnCancelar.addEventListener('click', salirDeEdicion);

// ===== 7. BUSCAR (evento input) =====
buscador.addEventListener('input', function () {
  const texto = buscador.value.toLowerCase();
  const filtrados = estudiantes.filter(est =>
    est.apellido.toLowerCase().includes(texto) ||
    est.nombre.toLowerCase().includes(texto) ||
    est.dni.includes(texto)
  );
  actualizarTabla(filtrados);
});

// ===== 8. NAVEGACIÓN DEL MENÚ LATERAL (evento click) =====
const enlacesMenu = document.querySelectorAll('[data-seccion]');

enlacesMenu.forEach(enlace => {
  enlace.addEventListener('click', function (event) {
    event.preventDefault(); // evita que el link "#" suba la página
    mostrarSeccion(enlace.dataset.seccion);
  });
});

function mostrarSeccion(idSeccion) {
  // Ocultamos todas las secciones y mostramos solo la elegida
  document.querySelectorAll('main > section').forEach(s => s.classList.add('d-none'));
  document.getElementById(idSeccion).classList.remove('d-none');

  // Marcamos como activo solo el link elegido
  enlacesMenu.forEach(a => {
    a.classList.remove('active');
    a.classList.add('link-dark');
  });
  const activo = document.querySelector(`[data-seccion="${idSeccion}"]`);
  activo.classList.add('active');
  activo.classList.remove('link-dark');

  // Al entrar a Notas, actualizamos los combos con los datos actuales
  if (idSeccion === 'seccion-notas') {
    llenarSelectsNotas();
    actualizarTablaNotas();
  }
}

// ===== 9. MATERIAS: alta, listado y eliminación =====
const formMateria = document.getElementById('formMateria');
const tablaMaterias = document.getElementById('tablaMaterias');
let materias = JSON.parse(localStorage.getItem('materias')) || [];

function guardarMaterias() {
  localStorage.setItem('materias', JSON.stringify(materias));
}

formMateria.addEventListener('submit', function (event) {
  event.preventDefault();
  const nombre = document.getElementById('nombreMateria').value.trim();

  // Validaciones: vacío y repetido (sin importar mayúsculas)
  if (!nombre) {
    alert('Escribí el nombre de la materia.');
    return;
  }
  if (materias.some(m => m.nombre.toLowerCase() === nombre.toLowerCase())) {
    alert('Esa materia ya existe.');
    return;
  }

  materias.push({ id: Date.now(), nombre: nombre });
  guardarMaterias();
  actualizarTablaMaterias();
  formMateria.reset();
});

function actualizarTablaMaterias() {
  tablaMaterias.innerHTML = '';

  if (materias.length === 0) {
    tablaMaterias.innerHTML = '<tr><td colspan="2" class="text-center text-muted">No hay materias cargadas.</td></tr>';
    return;
  }

  materias.forEach(m => {
    tablaMaterias.innerHTML += `
      <tr>
        <td>${m.nombre}</td>
        <td>
          <button class="btn btn-sm btn-outline-danger" onclick="eliminarMateria(${m.id})">Eliminar</button>
        </td>
      </tr>`;
  });
}

function eliminarMateria(id) {
  if (!confirm('¿Eliminar esta materia?')) return;
  materias = materias.filter(m => m.id !== id);
  guardarMaterias();
  actualizarTablaMaterias();
}

// ===== 10. NOTAS Y PROMEDIOS =====
const formNota = document.getElementById('formNota');
const selectNotaEstudiante = document.getElementById('notaEstudiante');
const selectNotaMateria = document.getElementById('notaMateria');
const tablaNotas = document.getElementById('tablaNotas');
const tablaPromedios = document.getElementById('tablaPromedios');
let notas = JSON.parse(localStorage.getItem('notas')) || [];

function guardarNotas() {
  localStorage.setItem('notas', JSON.stringify(notas));
}

// Llena los combos con los estudiantes y materias actuales
function llenarSelectsNotas() {
  selectNotaEstudiante.innerHTML = '<option value="">Elegí un estudiante...</option>';
  estudiantes.forEach(e => {
    selectNotaEstudiante.innerHTML += `<option value="${e.id}">${e.apellido}, ${e.nombre}</option>`;
  });

  selectNotaMateria.innerHTML = '<option value="">Elegí una materia...</option>';
  materias.forEach(m => {
    selectNotaMateria.innerHTML += `<option value="${m.id}">${m.nombre}</option>`;
  });
}

// Promedio de una materia: (nota1 + nota2) / 2
function calcularPromedio(nota) {
  return (nota.nota1 + nota.nota2) / 2;
}

formNota.addEventListener('submit', function (event) {
  event.preventDefault();

  const estudianteId = Number(selectNotaEstudiante.value); // el value del select es texto: lo pasamos a número
  const materiaId = Number(selectNotaMateria.value);
  const nota1 = parseFloat(document.getElementById('nota1').value);
  const nota2 = parseFloat(document.getElementById('nota2').value);

  // Validaciones
  if (!estudianteId || !materiaId) {
    alert('Elegí un estudiante y una materia.');
    return;
  }
  if (isNaN(nota1) || isNaN(nota2) || nota1 < 1 || nota1 > 10 || nota2 < 1 || nota2 > 10) {
    alert('Las notas deben ser números entre 1 y 10.');
    return;
  }

  // Si ya tiene nota en esa materia, la actualizamos; si no, la agregamos
  const existente = notas.find(n => n.estudianteId === estudianteId && n.materiaId === materiaId);
  if (existente) {
    existente.nota1 = nota1;
    existente.nota2 = nota2;
  } else {
    notas.push({ id: Date.now(), estudianteId, materiaId, nota1, nota2 });
  }

  guardarNotas();
  actualizarTablaNotas();
  formNota.reset();
});

function actualizarTablaNotas() {
  tablaNotas.innerHTML = '';

  if (notas.length === 0) {
    tablaNotas.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay notas cargadas.</td></tr>';
  }

  notas.forEach(n => {
    // Buscamos nombre del estudiante y de la materia por su id
    const est = estudiantes.find(e => e.id === n.estudianteId);
    const mat = materias.find(m => m.id === n.materiaId);
    const prom = calcularPromedio(n);

    tablaNotas.innerHTML += `
      <tr>
        <td>${est ? est.apellido + ', ' + est.nombre : '(estudiante eliminado)'}</td>
        <td>${mat ? mat.nombre : '(materia eliminada)'}</td>
        <td>${n.nota1}</td>
        <td>${n.nota2}</td>
        <td><span class="badge ${prom >= 6 ? 'bg-success' : 'bg-danger'}">${prom.toFixed(2)}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-danger" onclick="eliminarNota(${n.id})">Eliminar</button>
        </td>
      </tr>`;
  });

  actualizarPromedios();
}

function actualizarPromedios() {
  tablaPromedios.innerHTML = '';
  let hayAlguno = false;

  estudiantes.forEach(e => {
    const susNotas = notas.filter(n => n.estudianteId === e.id); // notas de este estudiante
    if (susNotas.length === 0) return; // sin notas: no lo mostramos

    // reduce suma todos los promedios por materia; después dividimos por la cantidad
    const suma = susNotas.reduce((acumulado, n) => acumulado + calcularPromedio(n), 0);
    const general = suma / susNotas.length;
    hayAlguno = true;

    tablaPromedios.innerHTML += `
      <tr>
        <td>${e.apellido}, ${e.nombre}</td>
        <td>${susNotas.length}</td>
        <td><span class="badge ${general >= 6 ? 'bg-success' : 'bg-danger'}">${general.toFixed(2)}</span></td>
      </tr>`;
  });

  if (!hayAlguno) {
    tablaPromedios.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Todavía no hay promedios para mostrar.</td></tr>';
  }
}

function eliminarNota(id) {
  if (!confirm('¿Eliminar esta nota?')) return;
  notas = notas.filter(n => n.id !== id);
  guardarNotas();
  actualizarTablaNotas();
}

// ===== 11. AL CARGAR LA PÁGINA: carga turnos, cursos, estudiantes y materias desde datos.json (fetch + async/await) =====
async function obtenerDatos() {
  const response = await fetch('json/datos.json');
  if (!response.ok) throw new Error('Error al cargar los datos: ' + response.statusText);
  return await response.json();
}

function mostrarCursos(cursos, turnos) {
  const selectCurso = document.getElementById('curso');
  selectCurso.innerHTML = '<option value="">Elegí un curso...</option>'; // Opción por defecto

  cursos.forEach(curso => {
    // Buscamos el turno cuyo id coincide con el turnoId del curso
    const turno = turnos.find(t => t.id === curso.turnoId);
    const nombreTurno = turno ? turno.nombre : 'Sin turno';
    selectCurso.innerHTML += `<option value="${curso.nombre}">${curso.nombre} (${nombreTurno})</option>`;
  });
}

async function cargarEstudiantesIniciales() {
  try {
    const datos = await obtenerDatos();

    // Validamos el formato del JSON
    if (!Array.isArray(datos.estudiantes) || !Array.isArray(datos.cursos) || !Array.isArray(datos.turnos)) {
      throw new Error('Formato de datos inválido');
    }

    // Descartamos cursos incompletos y los mostramos en el select
    const cursosValidos = datos.cursos.filter(c => c.id && c.nombre);
    mostrarCursos(cursosValidos, datos.turnos);

    // Datos iniciales: solo si no hay nada guardado en localStorage
    if (estudiantes.length === 0) {
      estudiantes = datos.estudiantes;
      guardarEstudiantes();
    }
    if (Array.isArray(datos.materias) && materias.length === 0) {
      materias = datos.materias;
      guardarMaterias();
    }
  } catch (error) {
    console.error(error); // detalle técnico para el programador
    document.getElementById('error').textContent = 'Error al cargar los datos. Por favor, intenta nuevamente más tarde.';
  }

  // Siempre mostramos las tablas al final
  actualizarTabla(estudiantes);
  actualizarTablaMaterias();
  actualizarTablaNotas();
}

// Arranque: se ejecuta cuando ya están definidas todas las funciones y variables
cargarEstudiantesIniciales();
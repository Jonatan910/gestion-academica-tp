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

// ===== 8. AL CARGAR LA PÁGINA: carga cursos y estudiantes desde datos.json (fetch + async/await) =====
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

    // Solo agregamos los estudiantes iniciales si no hay estudiantes en localStorage
    if (estudiantes.length === 0) {
      estudiantes = datos.estudiantes;
      guardarEstudiantes();
    }
  } catch (error) {
    console.error(error); // detalle técnico para el programador
    document.getElementById('error').textContent = 'Error al cargar los datos. Por favor, intenta nuevamente más tarde.';
  }

  actualizarTabla(estudiantes); // siempre muestra la tabla al final
}

cargarEstudiantesIniciales();
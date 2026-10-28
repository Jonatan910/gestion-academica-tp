const form = document.getElementById("formEstudiante");
const tabla = document.getElementById("tablaEstudiantes");
const estudiantes = [];

form.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const estudiante = {
    id: Date.now(),
    apellido: document.getElementById("apellido").value.trim(),
    nombre: document.getElementById("nombre").value.trim(),
    dni: document.getElementById("dni").value.trim(),
    curso: document.getElementById("curso").value,
    turno: document.getElementById("turno").value
  };

  if (!estudiante.apellido || !estudiante.nombre || !estudiante.dni ||
      !estudiante.curso || !estudiante.turno) {
    alert("Completá todos los campos.");
    return;
  }

  if (!/^\d{7,8}$/.test(estudiante.dni)) {
    alert("El DNI debe tener 7 u 8 números.");
    return;
  }

  if (estudiantes.some(e => e.dni === estudiante.dni)) {
    alert("Ya existe un estudiante con ese DNI.");
    return;
  }

  estudiantes.push(estudiante);
  mostrarEstudiantes();
  form.reset();
});

function mostrarEstudiantes() {
  tabla.replaceChildren();

  estudiantes.forEach(function (estudiante) {
    const fila = tabla.insertRow();
    [estudiante.apellido, estudiante.nombre, estudiante.dni,
      estudiante.curso, estudiante.turno].forEach(function (dato) {
      fila.insertCell().textContent = dato;
    });

    const acciones = fila.insertCell();
    const estado = document.createElement("span");
    estado.className = "text-muted";
    estado.textContent = "Próximamente";
    acciones.appendChild(estado);
  });
}

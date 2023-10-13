        // guardo las datos de los alumnos
        let notas = [];

        // obtengo los datos mediante el Dom
        const nombreInput = document.getElementById("nombre");
        const nota1Input = document.getElementById("nota1");
        const nota2Input = document.getElementById("nota2");
        const calcularBtn = document.getElementById("calcularBtn");
        const mostrarBtn = document.getElementById("mostrarBtn");
        const mostrarAprobadosBtn = document.getElementById("mostrarAprobadosBtn");
        const buscarBtn = document.getElementById("buscarBtn");
        const obtenerNombresBtn = document.getElementById("obtenerNombresBtn");
        const resultadoUl = document.getElementById("resultado");
        const aprobadosUl = document.getElementById("aprobados");
        const promedioP = document.getElementById("promedio");
        const busquedaResultadoP = document.getElementById("busquedaResultado");
        const tablaAlumnos = document.getElementById("tablaAlumnos").getElementsByTagName('tbody')[0];

        // cargo los datos desde localStorage
        function cargarDatosDesdeLocalStorage() {
            if (localStorage.getItem("notas")) {
                notas = JSON.parse(localStorage.getItem("notas"));
                actualizarTablaAlumnos();
            }
        }

        // fetch para obtener los datos del archivo JSON
        fetch('../alumnos.json')
          .then(response => response.json())
          .then(data => {
            // compruebo si los datos son un  arreglo antes de meterlos a notas
            if (Array.isArray(data)) {
              // agrego los datos del JSON al arreglo de notas
              notas = data;

              // calculo la nota final
              notas.forEach(function(alumno) {
                  alumno.notaFinal = (alumno.nota1 + alumno.nota2) / 2;
              });

              // actualizo la tabla de alumnos con los nuevos datos
              actualizarTablaAlumnos();

              // guardo los datos en localStorage
              localStorage.setItem("notas", JSON.stringify(notas));
            } else {
              console.error('Los datos del JSON no son un arreglo válido.');
            }
          })
          .catch(error => {
            console.error('Error al obtener los datos:', error);
          });

        // calculo la nota final de los alumnos
        function calcularNotaFinal() {
            const nombre = nombreInput.value;
            const nota1 = parseFloat(nota1Input.value);
            const nota2 = parseFloat(nota2Input.value);

            if (isNaN(nota1) || isNaN(nota2)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Por favor, ingrese notas válidas.'
                });
                return;
            }

            const notaFinal = (nota1 + nota2) / 2;

            const alumno = {
                nombre: nombre,
                nota1: nota1,
                nota2: nota2,
                notaFinal: notaFinal
            };

            notas.push(alumno);

            // guardo los datos en localStorage
            localStorage.setItem("notas", JSON.stringify(notas));

            nombreInput.value = "";
            nota1Input.value = "";
            nota2Input.value = "";

            // actualizo la tabla de los alumnos
            actualizarTablaAlumnos();
        }

        // muestro las notas finales de los alumnos
        function mostrarResultado() {
            resultadoUl.innerHTML = "";
            notas.forEach(function(alumno) {
                const li = document.createElement("li");
                li.textContent = alumno.nombre + ": Nota Final = " + alumno.notaFinal;
                resultadoUl.appendChild(li);
            });
        }

        // muestro los alumnos probados
        function mostrarAprobados() {
            aprobadosUl.innerHTML = "";
            const aprobados = notas.filter(function(alumno) {
                return alumno.notaFinal >= 3;
            });
            aprobados.forEach(function(alumno) {
                const li = document.createElement("li");
                li.textContent = alumno.nombre + ": Aprobado";
                aprobadosUl.appendChild(li);
            });
        }

        //  funcion para buscar alumnos por nombre
        function encontrarAlumno() {
            const nombreBuscado = nombreInput.value.toLowerCase(); // Convertir a minúsculas
            const resultado = notas.find(function(alumno) {
                return alumno.nombre.toLowerCase() === nombreBuscado;
            });

            if (resultado) {
                busquedaResultadoP.textContent = resultado.nombre + ": Nota Final = " + resultado.notaFinal;
            } else {
                busquedaResultadoP.textContent = "Alumno no encontrado.";
            }
        }

        // obtengo los nombres de todos los alumnos
        function obtenerNombres() {
            const nombres = notas.map(function(alumno) {
                return alumno.nombre;
            });

            const nombresUl = document.createElement("ul");
            nombres.forEach(function(nombre) {
                const li = document.createElement("li");
                li.textContent = nombre;
                nombresUl.appendChild(li);
            });

            resultadoUl.innerHTML = "";
            resultadoUl.appendChild(nombresUl);
        }

        // actualizo la tabla de los alumnos
        function actualizarTablaAlumnos() {
            tablaAlumnos.innerHTML = "";
            notas.forEach(function(alumno, index) {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td contenteditable="true">${alumno.nombre}</td>
                    <td contenteditable="true">${alumno.nota1}</td>
                    <td contenteditable="true">${alumno.nota2}</td>
                    <td>${alumno.notaFinal}</td>
                    <td>
                        <button onclick="guardarCambios(${index})">Guardar</button>
                        <button onclick="eliminarAlumno('${alumno.nombre}')">Eliminar</button>
                    </td>
                `;
                tablaAlumnos.appendChild(fila);
            });

            // llamo a las funciones para actuliazar y calcular los promedios
            mostrarResultado();
            mostrarAprobados();
        }

        // guardo los cambios en la tabla
        function guardarCambios(index) {
            const fila = tablaAlumnos.rows[index];
            const nombreEditado = fila.cells[0].textContent;
            const nota1Editada = parseFloat(fila.cells[1].textContent);
            const nota2Editada = parseFloat(fila.cells[2].textContent);

            if (isNaN(nota1Editada) || isNaN(nota2Editada)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Por favor, ingrese notas válidas.'
                });
                return;
            }

            notas[index].nombre = nombreEditado;
            notas[index].nota1 = nota1Editada;
            notas[index].nota2 = nota2Editada;
            notas[index].notaFinal = (nota1Editada + nota2Editada) / 2;

            // gurado los datos actualizados en el localStorage
            localStorage.setItem("notas", JSON.stringify(notas));

            // actualizo la tabla 
            actualizarTablaAlumnos();
        }

        // aqui elimino a un alumno
        function eliminarAlumno(nombre) {
            const indice = notas.findIndex(function(alumno) {
                return alumno.nombre === nombre;
            });

            if (indice !== -1) {
                notas.splice(indice, 1);
                // gurado los datos actualizados en el localStorage
                localStorage.setItem("notas", JSON.stringify(notas));
                // actualizo la tabla
                actualizarTablaAlumnos();
            }
        }

        // eventListeners para los botones
        calcularBtn.addEventListener("click", calcularNotaFinal);
        mostrarBtn.addEventListener("click", mostrarResultado);
        mostrarAprobadosBtn.addEventListener("click", mostrarAprobados);
        buscarBtn.addEventListener("click", encontrarAlumno);
        obtenerNombresBtn.addEventListener("click", obtenerNombres);

        // cargo los datos desde localStorage al cargar la página
        cargarDatosDesdeLocalStorage();
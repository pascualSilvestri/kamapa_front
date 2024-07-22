'use client';
import { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Form, Button, Table } from "react-bootstrap";
import { Curso, User, Nota, Periodo } from "model/types"; // Asegúrate de que 'User', 'Curso' y 'Nota' estén definidos en 'model/types'
import { Environment } from "utils/EnviromenManager";
import { useUserContext } from "context/userContext";
import { useCicloLectivo } from "context/CicloLectivoContext";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AddNotasAlumno = ({ params }: { params: { id: string } }) => {
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string>("");
  const [asignatura, setAsignatura] = useState<string>("");
  const [periodo, setPeriodo] = useState<string>("");
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [asignaturas, setAsignaturas] = useState<Curso[]>([]);
  const [alumnos, setAlumnos] = useState<User[]>([]);
  const [nota, setNota] = useState<{ [key: string]: string }>({});
  const [recuperacionNota, setRecuperacionNota] = useState<{ [key: string]: string; }>({});
  const [user, setUser] = useUserContext();
  const [cicloLectivo, setCicloLectivo] = useCicloLectivo();
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [editingNote, setEditingNote] = useState<{ [key: string]: boolean }>({});
  const [editingValues, setEditingValues] = useState<{ [key: string]: { [key: string]: string } }>({});
  const [editingRecuperacion, setEditingRecuperacion] = useState<{ [key: string]: string }>({});
  const pdfRef = useRef(null);

  const [cursoNombre, setCursoNombre] = useState<string>("");
  const [asignaturaNombre, setAsignaturaNombre] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");

  useEffect(() => {
    fetchCursos();
    fetchPeriodos();
    setFecha(new Date().toLocaleDateString());
  }, []);

  useEffect(() => {
    if (asignatura && cursoSeleccionado) {
      fetchAlumnos();
      const selectedCurso = cursos.find(curso => curso.id === Number(cursoSeleccionado));
      if (selectedCurso) {
        setCursoNombre(selectedCurso.nombre);
      }
      const selectedAsignatura = asignaturas.find(asig => asig.id === Number(asignatura));
      if (selectedAsignatura) {
        setAsignaturaNombre(selectedAsignatura.nombre);
      }
    }
  }, [asignatura, cursoSeleccionado]);

  useEffect(() => {
    if (periodo) {
      fetchAlumnos();
    }
  }, [periodo]);

  const fetchCursos = async () => {
    const response = await fetch(
      `${Environment.getEndPoint(Environment.endPoint.getCursosForUsuario)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuarioId: user.id,
          cicloLectivoId: cicloLectivo.id,
        }),
      }
    );
    const data = await response.json();
    setCursos(Array.isArray(data) ? data : []);
  };

  const fetchPeriodos = async () => {
    const response = await fetch(
      `${Environment.getEndPoint(
        Environment.endPoint.getPeriodosByCicloElectivo
      )}${cicloLectivo.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    setPeriodos(data);
  };

  const fetchAsignaturas = async (cursoId: string) => {
    const response = await fetch(
      `${Environment.getEndPoint(
        Environment.endPoint.getAsignaturaByCurso
      )}${Number(cursoId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    const asig = data[0].asignaturas;

    setAsignaturas(Array.isArray(asig) ? asig : []);
  };

  const fetchAlumnos = async () => {
    try {
      const response = await fetch(
        `${Environment.getEndPoint(Environment.endPoint.getNotasByAsignatura)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            asignaturaId: Number(asignatura),
            cursoId: Number(cursoSeleccionado),
            cicloLectivoId: Number(cicloLectivo.id),
          }),
        }
      );
      const data = await response.json();
      const alumnosOrdenados = Array.isArray(data)
        ? data.map((a) => a.usuario).sort((a, b) => a.apellido.localeCompare(b.apellido))
        : [];
      setAlumnos(alumnosOrdenados);
      const recuperacionNotas = {};
      alumnosOrdenados.forEach(alumno => {
        const notaRecup = getNotaRecuperacion(alumno);
        recuperacionNotas[alumno.id] = notaRecup ? notaRecup.toString() : "";
      });
      setRecuperacionNota(recuperacionNotas);
    } catch (error) {
      console.error("Error fetching alumnos:", error);
      setAlumnos([]); // Ensure alumnos is an array in case of error
    }
  };

  const handleAddNota = async (alumnoId: number) => {
    const response = await fetch(
      `${Environment.getEndPoint(Environment.endPoint.createNota)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          asignaturaId: Number(asignatura),
          alumnoId: Number(alumnoId),
          nota: Number(nota[alumnoId]),
          periodoId: Number(periodo),
          institucionId: params.id,
        }),
      }
    );
    const data = await response.json();
    console.log(data);
    setNota({ ...nota, [alumnoId]: '' }); // Vaciar el campo de nota después de agregar la nota
    fetchAlumnos();
  };

  const handleAddRecuperacionNota = async (alumnoId: number) => {
    const notaValor = recuperacionNota[alumnoId];

    const response = await fetch(
      `${Environment.getEndPoint(Environment.endPoint.createNota)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          asignaturaId: Number(asignatura),
          alumnoId: Number(alumnoId),
          nota: notaValor,
          periodoId: Number(periodo),
          institucionId: params.id,
          tipoNotaId: 2,
        }),
      }
    );
    const data = await response.json();
    console.log(data);
    fetchAlumnos();
  };

  const calcularPromedio = (alumnoNotas: Nota[]) => {
    const total = alumnoNotas.reduce((acc, nota) => acc + (nota.nota || 0), 0);
    return (total / alumnoNotas.length).toFixed(2);
  };

  const getNotasPorPeriodo = (alumno: User) => {
    return (alumno.notas || [])
      .filter(
        (nota) =>
          nota.periodoId === Number(periodo) &&
          nota.asignaturaId === Number(asignatura)
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  };

  const getNotaRecuperacion = (alumno: User) => {
    const nota = alumno.notas.find((n) => n.tipoNotaId === 2 && n.periodoId === Number(periodo));
    return nota ? nota.nota : null;
  };

  const exportToPDF = async () => {
    const input = pdfRef.current;
    if (!input) return;

    // Ocultar columnas de Nota y Acción
    const accionColumn = input.querySelectorAll('.accion-column');
    accionColumn.forEach(col => (col as HTMLElement).style.display = 'none');

    // Añadir encabezado
    const header = document.createElement('div');
    const cursoSelectPdf = cursos.find(select => select.id === Number(cursoSeleccionado));
    const asignaturaSelectPdf = asignaturas.find(select => select.id === Number(asignatura));
    header.innerHTML = `<h3>Curso: ${cursoSelectPdf.nombre}</h3><h3>Asignatura: ${asignaturaSelectPdf.nombre}</h3><h3>Fecha: ${fecha}</h3>`;
    input.insertBefore(header, input.firstChild);

    // Generar PDF
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Notas.pdf");

    // Restaurar columnas
    accionColumn.forEach(col => (col as HTMLElement).style.display = '');

    // Eliminar encabezado
    input.removeChild(header);
  };

  const handleEditNota = (alumnoId: string) => {
    setEditingNote({ ...editingNote, [alumnoId]: true });
    const currentNotas = getNotasPorPeriodo(alumnos.find(a => a.id === Number(alumnoId))!);
    const notasValues = {};
    currentNotas.forEach((nota, index) => {
      notasValues[`Nota${index + 1}`] = nota.nota || "";
    });
    setEditingValues({ ...editingValues, [alumnoId]: notasValues });
    setEditingRecuperacion({ ...editingRecuperacion, [alumnoId]: recuperacionNota[alumnoId] || "" });
  };

  const handleSaveNota = (alumnoId: string) => {
    const notas = editingValues[alumnoId];
    const currentNotas = getNotasPorPeriodo(alumnos.find(a => a.id === Number(alumnoId))!);
    Object.keys(notas).forEach((key, index) => {
      const notaValue = notas[key];
      const currentNota = currentNotas[index];
      console.log(`Nota ID: ${currentNota.id}, Nota Actual: ${notaValue}, Alumno ID: ${alumnoId}, Asignatura ID: ${asignatura}, Periodo ID: ${periodo}, Ciclo Lectivo ID: ${cicloLectivo.id}`);
    });
    const recuperacionValue = editingRecuperacion[alumnoId];
    console.log(`Recuperación Nota: ${recuperacionValue}, Alumno ID: ${alumnoId}`);
    setEditingNote({ ...editingNote, [alumnoId]: false });
  };

  const handleNotaChange = (alumnoId: string, key: string, value: string) => {
    setEditingValues({
      ...editingValues,
      [alumnoId]: {
        ...editingValues[alumnoId],
        [key]: value,
      },
    });
  };

  const handleRecuperacionChange = (alumnoId: string, value: string) => {
    setEditingRecuperacion({
      ...editingRecuperacion,
      [alumnoId]: value,
    });
  };

  return (
    <Container>
      <Row>
        <Col md={12}>
          <h1>Agregar Notas a Alumnos</h1>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Curso</Form.Label>
                <Form.Control
                  as="select"
                  value={cursoSeleccionado}
                  onChange={(e) => {
                    setCursoSeleccionado(e.target.value);
                    fetchAsignaturas(e.target.value);
                  }}
                >
                  <option value="">Seleccionar curso</option>
                  {cursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nombre}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Asignatura</Form.Label>
                <Form.Control
                  as="select"
                  value={asignatura}
                  onChange={(e) => setAsignatura(e.target.value)}
                  disabled={!cursoSeleccionado}
                >
                  <option value="">Seleccionar asignatura</option>
                  {asignaturas.map((asignatura) => (
                    <option key={asignatura.id} value={asignatura.id}>
                      {asignatura.nombre}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Periodo Lectivo</Form.Label>
                <Form.Control
                  as="select"
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                >
                  <option value="">Seleccionar periodo</option>
                  {periodos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <h2>Alumnos</h2>
          <div ref={pdfRef} style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", width: "100%", scrollbarWidth: "auto" }}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th className="accion-column">Acción</th>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <th key={idx}>{`Nota ${idx + 1}`}</th>
                  ))}
                  <th>Promedio</th>
                  <th>Periodo de Recuperación</th>
                  <th>Calificación Parcial</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(alumnos) &&
                  alumnos.map((alumno) => {
                    const promedio = calcularPromedio(
                      getNotasPorPeriodo(alumno)
                    );
                    const notaRecuperacion = getNotaRecuperacion(
                      alumno
                    );
                    const notasPorPeriodo = getNotasPorPeriodo(alumno);
                    return (
                      <tr key={alumno.id}>
                        <td>{alumno.nombre}</td>
                        <td>{alumno.apellido}</td>
                        <td className="accion-column">
                          {editingNote[alumno.id] ? (
                            <Button
                              onClick={() => handleSaveNota(alumno.id.toString())}
                              style={{
                                backgroundColor: "purple",
                                color: "white",
                                padding: "0.4rem 1rem",
                                fontSize: "1rem",
                                transition: "all 0.3s ease",
                                marginBottom: "10px",
                                border: "2px solid purple",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "white";
                                e.currentTarget.style.color = "black";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "purple";
                                e.currentTarget.style.color = "white";
                              }}
                            >
                              Aceptar
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleEditNota(alumno.id.toString())}
                              style={{
                                backgroundColor: "purple",
                                color: "white",
                                padding: "0.4rem 1rem",
                                fontSize: "1rem",
                                transition: "all 0.3s ease",
                                marginBottom: "10px",
                                border: "2px solid purple",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "white";
                                e.currentTarget.style.color = "black";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "purple";
                                e.currentTarget.style.color = "white";
                              }}
                            >
                              Modificar
                            </Button>
                          )}
                        </td>
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <td key={idx}>
                            {editingNote[alumno.id] ? (
                              <Form.Control
                                type="number"
                                min="0"
                                max="10"
                                value={editingValues[alumno.id]?.[`Nota${idx + 1}`] || ""}
                                onChange={(e) => handleNotaChange(alumno.id.toString(), `Nota${idx + 1}`, e.target.value)}
                              />
                            ) : (
                              notasPorPeriodo[idx]
                                ? notasPorPeriodo[idx].nota
                                : ""
                            )}
                          </td>
                        ))}
                        <td>{promedio}</td>
                        <td>
                          {editingNote[alumno.id] ? (
                            <Form.Control
                              type="number"
                              min="0"
                              max="10"
                              value={editingRecuperacion[alumno.id] || ""}
                              onChange={(e) => handleRecuperacionChange(alumno.id.toString(), e.target.value)}
                            />
                          ) : (
                            notaRecuperacion !== null ? notaRecuperacion : ""
                          )}
                        </td>
                        {Number(promedio) < 6 ? (
                          <>
                            <td>{notaRecuperacion !== null ? notaRecuperacion : ""}</td>
                          </>
                        ) : (
                          <>
                            <td>{promedio}</td>
                          </>
                        )}
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
      <Row className="justify-content-center mb-4">
        <Col xs="auto">
          <Button
            variant="purple"
            className="mx-2"
            onClick={exportToPDF}
            style={{
              backgroundColor: "purple",
              color: "white",
              padding: "0.4rem 1rem",
              fontSize: "1rem",
              transition: "all 0.3s ease",
              marginBottom: "10px",
              border: "2px solid purple",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.color = "black";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "purple";
              e.currentTarget.style.color = "white";
            }}
          >
            Exportar a PDF
          </Button>
        </Col>
      </Row>
      <Row>
        <h3>* El Valor 0 es el equivalente a AUS</h3>
        <h3>* El valor menor a 6 en Calificación Parcial es Ad</h3>
      </Row>
    </Container>
  );
};

export default AddNotasAlumno;

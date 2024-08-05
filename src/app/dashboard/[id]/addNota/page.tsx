'use client';
import { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Form, Button, Table, InputGroup } from "react-bootstrap";
import { Curso, User, Nota, Periodo } from "model/types"; // Asegúrate de que 'User', 'Curso' y 'Nota' estén definidos en 'model/types'
import { Environment } from "utils/EnviromenManager";
import { useUserContext, useInstitucionSelectedContext } from "context/userContext";
import { useCicloLectivo } from "context/CicloLectivoContext";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BsChevronDown } from "react-icons/bs";


const AddNotasAlumno = ({ params }: { params: { id: string } }) => {
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string>("");
  const [institucionSelected] = useInstitucionSelectedContext();

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
        Environment.endPoint.getAsignaturaForCursoByProfesor
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuarioId: user.id,
          institucionId: params.id,
          cursoId: Number(cursoId),
        }),
      }
    );
    const data = await response.json();
    setAsignaturas(Array.isArray(data) ? data : []);
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
    } catch (error) {
      console.error("Error fetching alumnos:", error);
      setAlumnos([]); // Ensure alumnos is an array in case of error
    }
  };

  const handleAddNota = async (alumnoId: number | string) => {
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

  const handleAddRecuperacionNota = async (alumnoId: number | string) => {
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
    const notasColumn = input.querySelectorAll('.notas-column');
    const accionColumn = input.querySelectorAll('.accion-column');
    notasColumn.forEach(col => (col as HTMLElement).style.display = 'none');
    accionColumn.forEach(col => (col as HTMLElement).style.display = 'none');

    // Añadir encabezado con el nombre y logo de la institución
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.marginBottom = '20px'; // Espacio entre el encabezado y el contenido

    const logoContainer = document.createElement('div');
    logoContainer.style.marginRight = '10px';
    const logoImage = document.createElement('img');
    logoImage.src = institucionSelected.logo;
    logoImage.width = 50; // Ajusta el tamaño según sea necesario
    logoImage.height = 50; // Ajusta el tamaño según sea necesario
    logoContainer.appendChild(logoImage);
    header.appendChild(logoContainer);

    const cursoSelectPdf = cursos.find(select => select.id === Number(cursoSeleccionado));
    const asignaturaSelectPdf = asignaturas.find(select => select.id === Number(asignatura));
    const headerText = document.createElement('div');
    headerText.innerHTML = `<h2>${institucionSelected.nombre}</h2>
                            <h3>Curso: ${cursoSelectPdf?.nombre}</h3>
                    
                            <h3>Asignatura: ${asignaturaSelectPdf?.nombre}</h3>
                            <h3>Fecha: ${fecha}</h3>`;
    header.appendChild(headerText);

    input.insertBefore(header, input.firstChild);

    // Generar PDF
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const margin = 10; // 10 mm margin (1 cm)
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth - 2 * margin;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    let heightLeft = imgHeight;
    let position = margin; // Start position with the margin

    pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
    heightLeft -= pageHeight - 2 * margin;

    while (heightLeft > 0) {
      if (heightLeft < imgHeight) {
        position = heightLeft + margin; // Adjust to start with margin
        heightLeft -= pageHeight;
      } else {
        position = margin; // Reset to top margin for new page
        heightLeft -= pageHeight - 2 * margin;
      }
      pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
    }

    pdf.save("Notas.pdf");

    // Restaurar columnas
    notasColumn.forEach(col => (col as HTMLElement).style.display = '');
    accionColumn.forEach(col => (col as HTMLElement).style.display = '');

    // Eliminar encabezado
    input.removeChild(header);
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
                <InputGroup>
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
                  <InputGroup.Text>
                    <BsChevronDown />
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Asignatura</Form.Label>
                <InputGroup>
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
                  <InputGroup.Text>
                    <BsChevronDown />
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Periodo Lectivo</Form.Label>
                <InputGroup>
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
                  <InputGroup.Text>
                    <BsChevronDown />
                  </InputGroup.Text>
                </InputGroup>
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
                  <th className="notas-column">Nota</th>
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
                    const notasDeshabilitadas = notasPorPeriodo.length >= 5;
                    return (
                      <tr key={alumno.id}>
                        <td>{alumno.nombre}</td>
                        <td>{alumno.apellido}</td>
                        <td className="notas-column">
                          <Form.Control
                            className="m-3"
                            style={{ width: '70px' }}
                            type="number"
                            min="0"
                            max="10"
                            value={nota[alumno.id] || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (
                                value === "" ||
                                (Number(value) >= 0 && Number(value) <= 10)
                              ) {
                                setNota({ ...nota, [alumno.id]: value });
                              }
                            }}
                            disabled={notasDeshabilitadas}
                          />
                        </td>
                        <td className="accion-column">
                          <Button
                            onClick={() => handleAddNota(alumno.id)}
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
                            disabled={notasDeshabilitadas}
                          >
                            Agregar Nota
                          </Button>
                        </td>
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <td key={idx}>
                            {notasPorPeriodo[idx]
                              ? notasPorPeriodo[idx].nota
                              : ""}
                          </td>
                        ))}
                        <td>{promedio}</td>
                        {Number(promedio) < 6 ? (
                          <>
                            <td>
                              {notaRecuperacion !== null ? (
                                notaRecuperacion
                              ) : (
                                <>
                                  <Form.Control
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={recuperacionNota[alumno.id] || ""}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (
                                        value === "" ||
                                        (Number(value) >= 0 &&
                                          Number(value) <= 10)
                                      ) {
                                        setRecuperacionNota({
                                          ...recuperacionNota,
                                          [alumno.id]: value,
                                        });
                                      }
                                    }}
                                  />
                                  <Button
                                    onClick={() =>
                                      handleAddRecuperacionNota(
                                        alumno.id
                                      )
                                    }
                                    style={{
                                      backgroundColor: "purple",
                                      color: "white",
                                      padding: "0.4rem 1rem",
                                      fontSize: "1rem",
                                      transition: "all 0.3s ease",
                                      marginBottom: "10px",
                                      border: "2px solid purple",
                                      cursor: "pointer",
                                      marginTop: "10px",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "white";
                                      e.currentTarget.style.color = "black";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "purple";
                                      e.currentTarget.style.color = "white";
                                    }}
                                  >
                                    Agregar Recuperación
                                  </Button>
                                </>
                              )}
                            </td>
                            <td>{notaRecuperacion !== null ? notaRecuperacion : ''}</td>
                          </>
                        ) : (
                          <>
                            <td></td>
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

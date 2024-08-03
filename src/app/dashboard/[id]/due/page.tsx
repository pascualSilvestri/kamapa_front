'use client';
import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Form, Button, ButtonProps } from "react-bootstrap";
import { Asignatura, Nota, Periodo, CicloLectivo } from "model/types";
import { useUserContext, useInstitucionSelectedContext } from "context/userContext";
import { useCicloLectivo } from "context/CicloLectivoContext";
import styled from "styled-components";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Environment } from "utils/EnviromenManager";

interface PDFContentProps {
  user: any;
  institucionSelected: any;
  asignaturas: Asignatura[];
  periodos: Periodo[];
}

const Due = ({ params }: { params: { id: string } }) => {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [ciclosLectivos, setCiclosLectivos] = useState<CicloLectivo[]>([]);
  const [user] = useUserContext();
  const [institucionSelected] = useInstitucionSelectedContext();
  const [cicloLectivo, setCicloLectivo] = useCicloLectivo();
  const [selectedCicloLectivo, setSelectedCicloLectivo] = useState<string>(
    cicloLectivo ? cicloLectivo.id.toString() : ""
  );
  const pdfRef = useRef(null);

  useEffect(() => {
    fetchCiclosLectivos();
  }, []);

  console.log(user);
  useEffect(() => {
    if (selectedCicloLectivo) {
      fetchAsignaturasYNotas();
    }
  }, [selectedCicloLectivo]);

  const fetchCiclosLectivos = async () => {
    try {
      const response = await fetch(
        `${Environment.getEndPoint(Environment.endPoint.getAllCicloLectivo)}${params.id}`
      );
      const data = await response.json();
      setCiclosLectivos(data);
      const activeCiclo = data.find((ciclo: CicloLectivo) => ciclo.isActive);
      if (activeCiclo) {
        setSelectedCicloLectivo(activeCiclo.id.toString());
      }
    } catch (error) {
      console.error("Error fetching ciclos lectivos:", error);
    }
  };

  const fetchAsignaturasYNotas = async () => {
    try {
      const response = await fetch(
        `${Environment.getEndPoint(Environment.endPoint.getNotasByAlumnoForCicloElectivo)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            alumnoId: user.id,
            cicloLectivoId: selectedCicloLectivo,
          }),
        }
      );
      const data = await response.json();
      console.log("Fetched data:", data);

      const periodosUnicos: Periodo[] = [];
      data.forEach((item: { asignatura: Asignatura; notas: Nota[] }) => {
        item.notas.forEach((nota: Nota) => {
          if (
            nota.periodo &&
            !periodosUnicos.find((periodo) => periodo.id === nota.periodo.id)
          ) {
            periodosUnicos.push(nota.periodo);
          }
        });
      });

      // Ordenar periodos por fecha de creación
      periodosUnicos.sort(
        (a, b) =>
          new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()
      );

      setPeriodos(periodosUnicos);

      const asignaturasConNotas = data.map(
        (item: { asignatura: Asignatura; notas: Nota[] }) => {
          const notasPorPeriodo: { [key: number]: Nota[] } = {};
          const notasExtraordinarias: Nota[] = [];
          periodosUnicos.forEach((periodo) => {
            notasPorPeriodo[periodo.id] = item.notas.filter(
              (nota) => nota.periodo?.id === periodo.id
            );
          });
          item.notas.forEach((nota) => {
            if (nota.tipoNota?.id === 3 || nota.tipoNota?.id === 4) {
              notasExtraordinarias.push(nota);
            }
          });
          return { ...item.asignatura, notasPorPeriodo, notasExtraordinarias };
        }
      );

      setAsignaturas(asignaturasConNotas);
    } catch (error) {
      console.error("Error fetching asignaturas y notas:", error);
    }
  };

  const calcularPromedioPorPeriodo = (notas: Nota[]) => {
    const evaluaciones = notas.filter((nota) => nota.tipoNota?.id === 1);
    if (evaluaciones.length === 0) return "-";
    const total = evaluaciones.reduce((acc, nota) => acc + nota.nota, 0);
    return (total / evaluaciones.length).toFixed(2);
  };

  const calcularPromedioGeneral = (notasPorPeriodo: { [key: number]: Nota[] }) => {
    const todasLasNotas = Object.values(notasPorPeriodo).flat();
    const evaluaciones = todasLasNotas.filter(
      (nota) => nota.tipoNota?.id === 1
    );
    if (evaluaciones.length === 0) return "-";
    const total = evaluaciones.reduce((acc, nota) => acc + nota.nota, 0);
    return (total / evaluaciones.length).toFixed(2);
  };

  const getNotaExtraordinaria = (notasExtraordinarias: Nota[], tipoNotaId: number) => {
    const nota = notasExtraordinarias.find((n) => n.tipoNota.id === tipoNotaId);
    return nota ? nota.nota : null;
  };

  const calcularCalificacionFinal = (
    notasPorPeriodo: { [key: number]: Nota[] },
    reDiciembre: number | null,
    reFebrero: number | null
  ) => {
    if (reFebrero !== null) {
      return reFebrero.toFixed(2);
    } else if (reDiciembre !== null) {
      const promedios = Object.values(notasPorPeriodo)
        .map((notas) => calcularPromedioPorPeriodo(notas))
        .filter((promedio) => promedio !== "-")
        .map(Number);

      const maxPromedio = promedios.length > 0 ? Math.max(...promedios) : 0;
      const final = (reDiciembre + maxPromedio) / 2;
      return final.toFixed(2);
    } else {
      return "-";
    }
  };

  const PDFContent = React.forwardRef<HTMLDivElement, PDFContentProps>(
    ({ user, institucionSelected, asignaturas, periodos }, ref) => (
      <div ref={ref} style={{ padding: "20px", border: "1px solid #000" }}>
        {/* Header Section */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <img
                src={institucionSelected.logo || "/Logo.png"}
                alt="Logo"
                style={{ maxWidth: "100px", height: "auto" }}
              />
            </div>
            <div>
              <h1
                style={{
                  textAlign: "start",
                  fontWeight: "bold",
                  fontSize: "20px",
                  padding: "5px",
                }}
              >
                Educación Secundaria
              </h1>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "flex-end",
                flexDirection: "column",
              }}
            >
              <p
                style={{
                  textAlign: "start",
                  fontWeight: "bold",
                  fontSize: "14px",
                  padding: "5px",
                }}
              >
                LIBRO MATRIZ N&#176;:______________
              </p>
              <p
                style={{
                  textAlign: "start",
                  fontWeight: "bold",
                  fontSize: "14px",
                  padding: "5px",
                }}
              >
                FOLIO N&#176;:_____________________
              </p>
            </div>
          </div>
          <div>
            <p
              style={{
                textAlign: "start",
                fontWeight: "bold",
                fontSize: "14px",
                padding: "5px",
              }}
            >
              Escuela:{" "}
              <span
                style={{ fontWeight: "normal", borderBottom: "2px solid #000" }}
              >
                {institucionSelected.nombre}
              </span>
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <p
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "14px",
                  padding: "5px",
                }}
              >
                Alumno:{" "}
                <span
                  style={{
                    fontWeight: "normal",
                    borderBottom: "2px solid #000",
                  }}
                >
                  {user.nombre} {user.apellido}
                </span>
              </p>
              <p
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "14px",
                  padding: "5px",
                }}
              >
                CUIL:{" "}
                <span
                  style={{
                    fontWeight: "normal",
                    borderBottom: "2px solid #000",
                  }}
                >
                  {user.cuil}
                </span>
              </p>
            </div>
            <p
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "14px",
                padding: "5px",
              }}
            >
              A&#241;o lectivo:{" "}
              <span
                style={{ fontWeight: "normal", borderBottom: "2px solid #000" }}
              >
                {cicloLectivo?.nombre}
              </span>
            </p>
          </div>
        </div>

        {/* Table Section */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px",
                  backgroundColor: "#f2f2f2",
                }}
              >
                Asignatura
              </th>
              {periodos.map((periodo) => (
                <th
                  key={periodo.id}
                  style={{
                    border: "1px solid #000",
                    padding: "5px",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  {periodo.nombre}
                </th>
              ))}
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px",
                  backgroundColor: "#f2f2f2",
                }}
              >
                Promedio
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px",
                  backgroundColor: "#f2f2f2",
                }}
              >
                Diciembre
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px",
                  backgroundColor: "#f2f2f2",
                }}
              >
                Febrero
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px",
                  backgroundColor: "#f2f2f2",
                }}
              >
                Calificaci&#243;n Final
              </th>
            </tr>
          </thead>
          <tbody>
            {asignaturas.map((asignatura) => (
              <tr key={asignatura.id}>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px",
                  }}
                >
                  {asignatura.nombre}
                </td>
                {periodos.map((periodo) => (
                  <td
                    key={periodo.id}
                    style={{
                      border: "1px solid #000",
                      padding: "5px",
                    }}
                  >
                    {calcularPromedioPorPeriodo(
                      asignatura.notasPorPeriodo[periodo.id]
                    )}
                  </td>
                ))}
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px",
                  }}
                >
                  {calcularPromedioGeneral(asignatura.notasPorPeriodo)}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px",
                  }}
                >
                  {getNotaExtraordinaria(asignatura.notasExtraordinarias, 3) ||
                    "-"}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px",
                  }}
                >
                  {getNotaExtraordinaria(asignatura.notasExtraordinarias, 4) ||
                    "-"}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px",
                  }}
                >
                  {calcularCalificacionFinal(
                    asignatura.notasPorPeriodo,
                    getNotaExtraordinaria(asignatura.notasExtraordinarias, 3),
                    getNotaExtraordinaria(asignatura.notasExtraordinarias, 4)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  );

  const handleDownloadPDF = () => {
    if (pdfRef.current) {
      html2canvas(pdfRef.current).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("DUE.pdf");
      });
    }
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1 className="text-center">Documentaci&#243;n Unica del Estudiante (DUE)</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Group controlId="formCicloLectivo">
            <Form.Label>Ciclo Lectivo</Form.Label>
            <Form.Control
              as="select"
              value={selectedCicloLectivo}
              onChange={(e) => setSelectedCicloLectivo(e.target.value)}
            >
              {ciclosLectivos.map((ciclo) => (
                <option key={ciclo.id} value={ciclo.id}>
                  {ciclo.nombre}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <div ref={pdfRef}>
            <PDFContent
              user={user}
              institucionSelected={institucionSelected}
              asignaturas={asignaturas}
              periodos={periodos}
            />
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button onClick={handleDownloadPDF}>Descargar PDF</Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Due;

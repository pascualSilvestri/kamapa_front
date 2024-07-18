"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  ButtonProps,
} from "react-bootstrap";
import { Asignatura, Nota, Periodo, CicloLectivo } from "model/types";
import {
  useUserContext,
  useInstitucionSelectedContext,
} from "context/userContext";
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
        `${Environment.getEndPoint(Environment.endPoint.getAllCicloLectivo)}${
          params.id
        }`
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
        `${Environment.getEndPoint(
          Environment.endPoint.getNotasByAlumnoForCicloElectivo
        )}`,
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

  const calcularPromedioGeneral = (notasPorPeriodo: {
    [key: number]: Nota[];
  }) => {
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
                LIBRO MATRIZ N°:______________
              </p>
              <p
                style={{
                  textAlign: "start",
                  fontWeight: "bold",
                  fontSize: "14px",
                  padding: "5px",
                }}
              >
                FOLIO N°:_____________________
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
                  {user.apellido} {user.nombre}
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
                DNI:{" "}
                <span
                  style={{
                    fontWeight: "normal",
                    borderBottom: "2px solid #000",
                  }}
                >
                  {user.dni}
                </span>
              </p>
            </div>
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
                Año:{" "}
                <span
                  style={{
                    fontWeight: "normal",
                    borderBottom: "2px solid #000",
                  }}
                >
                  20{new Date().getFullYear().toString().slice(-2)}
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
                Div:{" "}
                <span
                  style={{
                    fontWeight: "normal",
                    borderBottom: "2px solid #000",
                  }}
                >
                  Segundo
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
                Modalidad:{" "}
                <span
                  style={{
                    fontWeight: "normal",
                    borderBottom: "2px solid #000",
                  }}
                >
                  Segundo
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
                Ciclo Lectivo:{" "}
                <span
                  style={{
                    fontWeight: "normal",
                    borderBottom: "2px solid #000",
                  }}
                >
                  20{new Date().getFullYear().toString().slice(-2)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid black",
                  padding: "5px",
                  textAlign: "center",
                }}
                rowSpan={2}
              >
                Espacios Curriculares
              </th>
              {periodos.map((periodo) => (
                <th
                  key={periodo.id}
                  style={{
                    border: "1px solid black",
                    padding: "5px",
                    textAlign: "center",
                  }}
                  rowSpan={2}
                >
                  {periodo.nombre}
                </th>
              ))}
              <th
                style={{
                  border: "1px solid black",
                  padding: "5px",
                  textAlign: "center",
                }}
                rowSpan={2}
              >
                Calificación Final
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "5px",
                  textAlign: "center",
                }}
                colSpan={2}
              >
                Periodo de Evaluación de Diciembre
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "5px",
                  textAlign: "center",
                }}
                colSpan={2}
              >
                Evaluación Ante Comisión de Febrero
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "5px",
                  textAlign: "center",
                }}
                rowSpan={2}
              >
                Calificación Final
              </th>
            </tr>
            <tr>
              <th
                style={{
                  border: "1px solid black",
                  padding: "5px",
                  textAlign: "center",
                }}
              >
                Calificaciones
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "5px",
                  textAlign: "center",
                }}
              >
                Firma Profesor
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "5px",
                  textAlign: "center",
                }}
              >
                Calificaciones
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "5px",
                  textAlign: "center",
                }}
              >
                Firma Profesor
              </th>
            </tr>
          </thead>
          <tbody>
            {asignaturas.map((asignatura) => {
              const reDiciembre = getNotaExtraordinaria(
                asignatura.notasExtraordinarias,
                3
              ); // Nota reDiciembre
              const reFebrero = getNotaExtraordinaria(
                asignatura.notasExtraordinarias,
                4
              ); // Nota reFebrero
              const calificacionFinal = calcularCalificacionFinal(
                asignatura.notasPorPeriodo,
                reDiciembre,
                reFebrero
              );

              return (
                <tr key={asignatura.id}>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    {asignatura.nombre}
                  </td>
                  {periodos.map((periodo) => (
                    <td
                      key={periodo.id}
                      style={{
                        border: "1px solid black",
                        padding: "5px",
                        textAlign: "center",
                      }}
                    >
                      {calcularPromedioPorPeriodo(
                        asignatura.notasPorPeriodo[periodo.id]
                      )}
                    </td>
                  ))}
                  <td
                    style={{
                      border: "1px solid black",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    {calcularPromedioGeneral(asignatura.notasPorPeriodo)}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    {reDiciembre !== null ? reDiciembre.toFixed(2) : ""}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  ></td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    {reFebrero !== null ? reFebrero.toFixed(2) : ""}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  ></td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    {calificacionFinal}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )
  );

  const exportToPDF = async () => {
    const input = pdfRef.current;
    if (!input) return;

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
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Consulta de Notas</h1>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group controlId="selectCicloLectivo">
            <Form.Label>Seleccionar Ciclo Lectivo</Form.Label>
            <Form.Control
              as="select"
              value={selectedCicloLectivo}
              onChange={async (e) => {
                const cicloId = e.target.value;
                setSelectedCicloLectivo(cicloId);
                const ciclo =
                  ciclosLectivos.find(
                    (ciclo) => ciclo.id.toString() === cicloId
                  ) || null;
                setCicloLectivo(ciclo);
              }}
            >
              {ciclosLectivos.length > 0 &&
                ciclosLectivos.map((ciclo) => (
                  <option key={ciclo.id} value={ciclo.id}>
                    {ciclo.nombre}
                  </option>
                ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>
      <div ref={pdfRef}>
        <PDFContent
          user={user}
          institucionSelected={institucionSelected}
          asignaturas={asignaturas}
          periodos={periodos}
        />
      </div>
      <Row className="justify-content-center mb-4">
        <Col xs="auto">
          <StyledButton variant="purple" className="mx-2" onClick={exportToPDF}>
            Generar PDF
          </StyledButton>
        </Col>
      </Row>
    </Container>
  );
};

interface StyledButtonProps extends ButtonProps {
  variant: "purple";
}

const StyledButton = styled(Button)<StyledButtonProps>`
  background-color: purple;
  border-color: purple;
  color: white;
  margin-top: 1rem;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
    background-color: white;
    color: purple;
    border-color: purple;
  }
`;

export default Due;

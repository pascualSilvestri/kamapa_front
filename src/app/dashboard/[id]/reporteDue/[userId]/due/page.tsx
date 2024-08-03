"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
} from "react-bootstrap";
import { Asignatura, Nota, Periodo, CicloLectivo, User, Curso } from "model/types";
import {
  useUserContext,
  useInstitucionSelectedContext,
} from "context/userContext";
import { useCicloLectivo } from "context/CicloLectivoContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Environment } from "utils/EnviromenManager";
import CursosAlumnos from "app/dashboard/[id]/curso_alumno/page";

interface PDFContentProps {
  user: any;
  institucionSelected: any;
  asignaturas: Asignatura[];
  periodos: Periodo[];
}

const Due = ({ params }: { params: { id: string, userId: string } }) => {
  const { id, userId } = params;
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [ciclosLectivos, setCiclosLectivos] = useState<CicloLectivo[]>([]);
  const [user, setUser] = useState<User[]>([]);
  const [curso, serCurso] = useState<Curso[]>([])
  const [institucionSelected] = useInstitucionSelectedContext();
  const [cicloLectivo, setCicloLectivo] = useCicloLectivo();
  const [selectedCicloLectivo, setSelectedCicloLectivo] = useState<string>(
    cicloLectivo ? cicloLectivo.id.toString() : ""
  );
  const pdfRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    fethdata();
  }, []);


  useEffect(() => {
    if (selectedCicloLectivo) {
      fetchAsignaturasYNotas();
    }
  }, [selectedCicloLectivo]);

  const fethdata = async () => {
    await fetchGetUser();
    await fetchCiclosLectivos();
  }

  const fetchCiclosLectivos = async () => {
    try {
      const response = await fetch(
        `${Environment.getEndPoint(Environment.endPoint.getAllCicloLectivo)}${params.id
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
            alumnoId: userId,
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

  const fetchGetUser = async () => {
    try {
      const response = await fetch(
        `${Environment.getEndPoint(
          Environment.endPoint.getUsuarioById
        )}${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      setUser(data.usuarios[0]);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching user:", error.message);
      } else {
        console.error("Error fetching user:", error);
      }
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
      <div
        ref={ref}
        style={{
          padding: "10px",
          border: "1px solid #000",
          width: "297mm", // Ancho de A4 en mm
          height: "210mm", // Alto de A4 en mm
          margin: "0 auto",
          boxSizing: "border-box",
          overflow: "hidden",
          fontSize: "8px", // Reducir aún más el tamaño de fuente
        }}
      >
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <img
              src={institucionSelected.logo || "/Logo.png"}
              alt="Logo"
              style={{ maxWidth: "50px", height: "auto" }}
            />
            <div>
              <h1>EDUCACIÓN SECUNDARIA
              </h1>
            </div>
            <div>
              <p style={{ margin: "2px 0", fontSize: "10px" }}>
                LIBRO MATRIZ N°:______________
              </p>
              <p style={{ margin: "2px 0", fontSize: "10px" }}>
                FOLIO N°:_____________________
              </p>
            </div>
          </div>
          <h2>{institucionSelected.nombre}</h2>
          <h3>INFORME DE CALIFICACIONES</h3>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <p style={{ margin: "2px 0" }}>Nombre del Alumno: {user.firstName} {user.lastName}</p>
          <p style={{ margin: "2px 0" }}>DNI: {user.dni}</p>
          <p style={{ margin: "2px 0" }}>Ciclo Lectivo: {cicloLectivo && cicloLectivo.nombre}</p>
        </div>

        {/* Table Section */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8px" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid black", padding: "2px" }}>Asignaturas</th>
              {periodos.map((periodo) => (
                <th key={periodo.id} style={{ border: "1px solid black", padding: "2px" }}>
                  {periodo.nombre}
                </th>
              ))}
              <th style={{ border: "1px solid black", padding: "2px" }}>Promedio General</th>
              <th style={{ border: "1px solid black", padding: "2px" }}>reDiciembre</th>
              <th style={{ border: "1px solid black", padding: "2px" }}>reFebrero</th>
              <th style={{ border: "1px solid black", padding: "2px" }}>Calificación Final</th>
            </tr>
          </thead>
          <tbody>
            {asignaturas.map((asignatura) => {
              const notasExtraordinarias = asignatura.notasExtraordinarias || [];
              const reDiciembre = getNotaExtraordinaria(notasExtraordinarias, 3);
              const reFebrero = getNotaExtraordinaria(notasExtraordinarias, 4);
              return (
                <tr key={asignatura.id}>
                  <td style={{ border: "1px solid black", padding: "2px" }}>{asignatura.nombre}</td>
                  {periodos.map((periodo) => (
                    <td
                      key={periodo.id}
                      style={{ border: "1px solid black", padding: "2px" }}
                    >
                      {calcularPromedioPorPeriodo(
                        asignatura.notasPorPeriodo[periodo.id] || []
                      )}
                    </td>
                  ))}
                  <td style={{ border: "1px solid black", padding: "2px" }}>
                    {calcularPromedioGeneral(asignatura.notasPorPeriodo)}
                  </td>
                  <td style={{ border: "1px solid black", padding: "2px" }}>
                    {reDiciembre !== null ? reDiciembre.toFixed(2) : "-"}
                  </td>
                  <td style={{ border: "1px solid black", padding: "2px" }}>
                    {reFebrero !== null ? reFebrero.toFixed(2) : "-"}
                  </td>
                  <td style={{ border: "1px solid black", padding: "2px" }}>
                    {calcularCalificacionFinal(
                      asignatura.notasPorPeriodo,
                      reDiciembre,
                      reFebrero
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer Section */}
        <div style={{ marginTop: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p style={{ fontSize: "10px" }}>Fecha de Emisión: {new Date().toLocaleDateString()}</p>
            <p style={{ fontSize: "10px" }}>Firma del Director: _____________________</p>
          </div>
        </div>
      </div>
    )
  );

  const handleGeneratePDF = async () => {
    if (!pdfRef.current) {
      console.error("pdfRef.current is null or undefined");
      return;
    }

    const input = pdfRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("reporte.pdf");
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Due Report</h1>
          <Form.Group controlId="cicloLectivo">
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
          <Button variant="primary" onClick={handleGeneratePDF}>
            Generar PDF
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <div style={{ overflow: "auto", height: "700px" }}>
            <PDFContent
              ref={pdfRef}
              user={user}
              institucionSelected={institucionSelected}
              asignaturas={asignaturas}
              periodos={periodos}
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Due;

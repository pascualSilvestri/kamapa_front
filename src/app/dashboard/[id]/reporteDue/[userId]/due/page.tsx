"use client";

import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Asignatura, Nota, Periodo, CicloLectivo, User, Curso } from "model/types";
import { useUserContext, useInstitucionSelectedContext } from "context/userContext";
import { useCicloLectivo } from "context/CicloLectivoContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Environment } from "utils/EnviromenManager";

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
  const [user, setUser] = useState<User | null>(null);
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
  };

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
        `${Environment.getEndPoint(Environment.endPoint.getUsuarioById)}${userId}`,
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
              <h1>EDUCACIÓN SECUNDARIA</h1>
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
          <p style={{ margin: "2px 0", fontSize: "10px" }}>
            <strong>Nombre:</strong> {user.nombre} {user.apellido}
          </p>
          <p style={{ margin: "2px 0", fontSize: "10px" }}>
            AÑO: {user.cursoId || "_______"} DIVISIÓN: {user.cursoId || "_______"} MODALIDAD: _____________________________{" "}
            <span style={{ margin: "2px 0", fontSize: "10px" }}>
              <strong>CICLO LECTIVO:</strong>{" "}
              {ciclosLectivos.find(
                (ciclo: CicloLectivo) => ciclo.id.toString() === selectedCicloLectivo
              )?.nombre || ""}
            </span>
          </p>
        </div>

        {/* Grades Table Section */}
        <div style={{ width: "100%", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid black", padding: "4px" }}>Asignaturas</th>
                {periodos.map((periodo) => (
                  <th key={periodo.id} style={{ border: "1px solid black", padding: "4px" }}>
                    {periodo.nombre}
                  </th>
                ))}
                <th style={{ border: "1px solid black", padding: "4px" }}>Promedio Anual</th>
                <th style={{ border: "1px solid black", padding: "4px" }}>Recu. Diciembre</th>
                <th style={{ border: "1px solid black", padding: "4px" }}>Recu. Febrero</th>
                <th style={{ border: "1px solid black", padding: "4px" }}>Calificación Final</th>
              </tr>
            </thead>
            <tbody>
              {asignaturas.map((asignatura) => (
                <tr key={asignatura.id}>
                  <td style={{ border: "1px solid black", padding: "4px" }}>
                    {asignatura.nombre}
                  </td>
                  {periodos.map((periodo) => (
                    <td
                      key={periodo.id}
                      style={{
                        border: "1px solid black",
                        padding: "4px",
                        textAlign: "center",
                      }}
                    >
                      {calcularPromedioPorPeriodo(
                        asignatura.notasPorPeriodo[periodo.id] || []
                      )}
                    </td>
                  ))}
                  <td style={{ border: "1px solid black", padding: "4px", textAlign: "center" }}>
                    {calcularPromedioGeneral(asignatura.notasPorPeriodo)}
                  </td>
                  <td style={{ border: "1px solid black", padding: "4px", textAlign: "center" }}>
                    {getNotaExtraordinaria(asignatura.notasExtraordinarias, 3)}
                  </td>
                  <td style={{ border: "1px solid black", padding: "4px", textAlign: "center" }}>
                    {getNotaExtraordinaria(asignatura.notasExtraordinarias, 4)}
                  </td>
                  <td style={{ border: "1px solid black", padding: "4px", textAlign: "center" }}>
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

        {/* Signature Section */}
        <div style={{ marginTop: "20px", textAlign: "right" }}>
          <p style={{ margin: "2px 0", fontSize: "10px" }}>
            ______________________________
          </p>
          <p style={{ margin: "2px 0", fontSize: "10px" }}>Firma del Director/Secretario</p>
        </div>
      </div>
    )
  );

  PDFContent.displayName = "PDFContent";

  const handleDownloadPDF = async () => {
    if (pdfRef.current) {
      const input = pdfRef.current;

      // Capturar el tamaño completo del contenido
      const canvas = await html2canvas(input, {
        scale: 2, // Escalar para mayor resolución
        useCORS: true,
        logging: true,
        scrollX: 0,
        scrollY: -window.scrollY, // Ajustar el desplazamiento vertical
        width: input.scrollWidth, // Capturar el ancho completo
        height: input.scrollHeight, // Capturar el alto completo
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [canvas.width * 0.264583, canvas.height * 0.264583], // Convertir píxeles a milímetros
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calcular el tamaño de la imagen para ajustarla al tamaño de la página del PDF
      const imgWidth = canvas.width * 0.264583;
      const imgHeight = canvas.height * 0.264583;
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);

      const width = imgWidth * ratio;
      const height = imgHeight * ratio;

      const xOffset = (pageWidth - width) / 2;
      const yOffset = (pageHeight - height) / 2;

      // Añadir la imagen al PDF
      pdf.addImage(imgData, "PNG", xOffset, yOffset, width, height);
      pdf.save("reporteDUE.pdf");
    }
  };

  return (
    <Container>
      <Row className="mb-3">
        <Col>
          <Form.Label>Ciclo Lectivo</Form.Label>
          <Form.Control
            as="select"
            value={selectedCicloLectivo}
            onChange={(e) => setSelectedCicloLectivo(e.target.value)}
          >
            {ciclosLectivos.map((ciclo: CicloLectivo) => (
              <option key={ciclo.id} value={ciclo.id.toString()}>
                {ciclo.nombre}
              </option>
            ))}
          </Form.Control>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button onClick={handleDownloadPDF}>Descargar PDF</Button>
        </Col>
      </Row>
      <Row>
        <Col className="container">
          <div style={{ maxWidth: "100%", overflowX: "auto" }}>
            <div ref={pdfRef}>
              <PDFContent
                user={user}
                institucionSelected={institucionSelected}
                asignaturas={asignaturas}
                periodos={periodos}
              />
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Due;

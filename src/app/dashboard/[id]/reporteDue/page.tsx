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
import {
    Asignatura,
    Nota,
    Periodo,
    CicloLectivo,
    Curso,
    Alumno,
} from "model/types";
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
    user: Alumno;
    institucionSelected: any;
    asignaturas: Asignatura[];
    periodos: Periodo[];
}

const reporteDue = ({ params }: { params: { id: string } }) => {
    const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [ciclosLectivos, setCiclosLectivos] = useState<CicloLectivo[]>([]);
    const [cursos, setCursos] = useState<any[]>([]);
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [selectedCurso, setSelectedCurso] = useState<string>("");
    const [selectedAlumno, setSelectedAlumno] = useState<string>("");
    const [user, setUser] = useState<Alumno | null>(null);
    const [institucionSelected] = useInstitucionSelectedContext();
    const [cicloLectivo, setCicloLectivo] = useCicloLectivo();
    const [selectedCicloLectivo, setSelectedCicloLectivo] = useState<string>(
        cicloLectivo ? cicloLectivo.id.toString() : ""
    );
    const pdfRef = useRef(null);

    useEffect(() => {
        fetchCiclosLectivos();
    }, []);

    useEffect(() => {
        if (selectedCicloLectivo) {
            fetchCursosYAlumnos();
        }
    }, [selectedCicloLectivo]);

    useEffect(() => {
        if (selectedAlumno) {
            fetchAsignaturasYNotas();
        }
    }, [selectedAlumno]);

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

    const fetchCursosYAlumnos = async () => {
        try {
            const response = await fetch(
                `${Environment.getEndPoint(Environment.endPoint.getNotasByCurso)}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        cicloLectivoId: selectedCicloLectivo,
                    }),
                }
            );
            const data = await response.json();
            setCursos(data.ciclosLectivo.cursos);
            setAlumnos(data.ciclosLectivo.cursos.flatMap((curso: Curso) => curso.alumnos));
        } catch (error) {
            console.error("Error fetching cursos y alumnos:", error);
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
                        alumnoId: selectedAlumno,
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
            const selectedUser = alumnos.find(alumno => alumno.id.toString() === selectedAlumno);
            setUser(selectedUser || null);
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
                                textAlign: "end",
                                fontSize: "14px",
                                padding: "5px",
                            }}
                        >
                            <p>La Carlota</p>
                            <p>{institucionSelected.direccion}</p>
                            <p>{institucionSelected.telefono}</p>
                        </div>
                    </div>
                    <h2
                        style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "24px",
                            margin: "20px 0",
                        }}
                    >
                        Informe de Calificaciones
                    </h2>
                </div>

                {/* Student Information Section */}
                <div style={{ textAlign: "left", marginBottom: "20px" }}>
                    <p>
                        <strong>Alumno:</strong> {user?.nombre} {user?.apellido}
                    </p>
                    <p>
                        <strong>Curso:</strong> {user?.curso?.nombre} (
                        {user?.curso?.division})
                    </p>
                    <p>
                        <strong>Ciclo Lectivo:</strong> {selectedCicloLectivo}
                    </p>
                </div>

                {/* Grades Table Section */}
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={{ border: "1px solid #000", padding: "5px" }}>
                                Asignaturas
                            </th>
                            {periodos.map((periodo) => (
                                <th
                                    key={periodo.id}
                                    style={{ border: "1px solid #000", padding: "5px" }}
                                >
                                    {periodo.nombre}
                                </th>
                            ))}
                            <th style={{ border: "1px solid #000", padding: "5px" }}>
                                Promedio
                            </th>
                            <th style={{ border: "1px solid #000", padding: "5px" }}>
                                Diciembre
                            </th>
                            <th style={{ border: "1px solid #000", padding: "5px" }}>
                                Febrero
                            </th>
                            <th style={{ border: "1px solid #000", padding: "5px" }}>
                                Calificación Final
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {asignaturas.map((asignatura) => {
                            const reDiciembre = getNotaExtraordinaria(
                                asignatura.notasExtraordinarias,
                                3
                            );
                            const reFebrero = getNotaExtraordinaria(
                                asignatura.notasExtraordinarias,
                                4
                            );
                            return (
                                <tr key={asignatura.id}>
                                    <td
                                        style={{
                                            border: "1px solid #000",
                                            padding: "5px",
                                            textAlign: "left",
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
                                                textAlign: "center",
                                            }}
                                        >
                                            {calcularPromedioPorPeriodo(
                                                asignatura.notasPorPeriodo[periodo.id] || []
                                            )}
                                        </td>
                                    ))}
                                    <td
                                        style={{
                                            border: "1px solid #000",
                                            padding: "5px",
                                            textAlign: "center",
                                        }}
                                    >
                                        {calcularPromedioGeneral(asignatura.notasPorPeriodo)}
                                    </td>
                                    <td
                                        style={{
                                            border: "1px solid #000",
                                            padding: "5px",
                                            textAlign: "center",
                                        }}
                                    >
                                        {reDiciembre !== null ? reDiciembre.toFixed(2) : "-"}
                                    </td>
                                    <td
                                        style={{
                                            border: "1px solid #000",
                                            padding: "5px",
                                            textAlign: "center",
                                        }}
                                    >
                                        {reFebrero !== null ? reFebrero.toFixed(2) : "-"}
                                    </td>
                                    <td
                                        style={{
                                            border: "1px solid #000",
                                            padding: "5px",
                                            textAlign: "center",
                                        }}
                                    >
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
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                    <p>_________________________</p>
                    <p>Firma del Director</p>
                </div>
            </div>
        )
    );

    PDFContent.displayName = "PDFContent";

    const handleDownloadPDF = async () => {
        const pdf = new jsPDF();

        if (pdfRef.current) {
            const canvas = await html2canvas(pdfRef.current);
            const imgData = canvas.toDataURL("image/png");

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save("informe-calificaciones.pdf");
        }
    };

    return (
        <Container>
            <Row className="my-3">
                <Col>
                    <h1 className="text-center">Generar Informe de Calificaciones</h1>
                </Col>
            </Row>

            <Form>
                <Row className="mb-3">
                    <Col>
                        <Form.Group controlId="cicloLectivo">
                            <Form.Label>Ciclo Lectivo</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedCicloLectivo}
                                onChange={(e) => setSelectedCicloLectivo(e.target.value)}
                            >
                                <option value="">Seleccionar Ciclo Lectivo</option>
                                {ciclosLectivos.map((ciclo) => (
                                    <option key={ciclo.id} value={ciclo.id}>
                                        {ciclo.nombre}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col>
                        <Form.Group controlId="curso">
                            <Form.Label>Curso</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedCurso}
                                onChange={(e) => setSelectedCurso(e.target.value)}
                            >
                                <option value="">Seleccionar Curso</option>
                                {cursos.map((curso) => (
                                    <option key={curso.id} value={curso.id}>
                                        {curso.nombre}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col>
                        <Form.Group controlId="alumno">
                            <Form.Label>Alumno</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedAlumno}
                                onChange={(e) => setSelectedAlumno(e.target.value)}
                            >
                                <option value="">Seleccionar Alumno</option>
                                {alumnos.map((alumno) => (
                                    <option key={alumno.id} value={alumno.id}>
                                        {alumno.nombre} {alumno.apellido}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>

            <Row className="my-3">
                <Col>
                    <Button onClick={handleDownloadPDF} disabled={!user}>
                        Descargar PDF
                    </Button>
                </Col>
            </Row>

            <div className="d-none">
                <PDFContent
                    ref={pdfRef}
                    user={user!}
                    institucionSelected={institucionSelected}
                    asignaturas={asignaturas}
                    periodos={periodos}
                />
            </div>
        </Container>
    );
};

export default reporteDue;

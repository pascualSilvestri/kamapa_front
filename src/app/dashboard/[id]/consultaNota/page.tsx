'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Form, Table, Button, ButtonProps } from 'react-bootstrap';
import { Asignatura, Nota, Periodo, CicloLectivo } from 'model/types';
import { useUserContext, useInstitucionSelectedContext } from 'context/userContext';
import { useCicloLectivo } from 'context/CicloLectivoContext';
import styled from 'styled-components';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Environment } from 'utils/EnviromenManager';

const ConsultaNota = ({ params }: { params: { id: string } }) => {
    const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [ciclosLectivos, setCiclosLectivos] = useState<CicloLectivo[]>([]);
    const [user] = useUserContext();
    const [institucionSelected] = useInstitucionSelectedContext();
    const [cicloLectivo, setCicloLectivo] = useCicloLectivo();
    const [selectedCicloLectivo, setSelectedCicloLectivo] = useState<string>(cicloLectivo ? cicloLectivo.id.toString() : '');
    const pdfRef = useRef(null);

    useEffect(() => {
        fetchCiclosLectivos();
    }, []);

    useEffect(() => {
        if (selectedCicloLectivo) {
            fetchAsignaturasYNotas();
        }
    }, [selectedCicloLectivo]);

    const fetchCiclosLectivos = async () => {
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getAllCicloLectivo)}${params.id}`);
            const data = await response.json();
            setCiclosLectivos(data);
            const activeCiclo = data.find((ciclo: CicloLectivo) => ciclo.isActive);
            if (activeCiclo) {
                setSelectedCicloLectivo(activeCiclo.id.toString());
            }
        } catch (error) {
            console.error('Error fetching ciclos lectivos:', error);
        }
    };

    const fetchAsignaturasYNotas = async () => {
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getNotasByAlumnoForCicloElectivo)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    alumnoId: user.id,
                    cicloLectivoId: selectedCicloLectivo,
                })
            });
            const data = await response.json();
            console.log('Fetched data:', data);

            const periodosUnicos: Periodo[] = [];
            data.forEach((item: { asignatura: Asignatura, notas: Nota[] }) => {
                item.notas.forEach((nota: Nota) => {
                    if (nota.periodo && !periodosUnicos.find(periodo => periodo.id === nota.periodo?.id)) {
                        periodosUnicos.push(nota.periodo);
                    }
                });
            });

            // Ordenar periodos por fecha de creación
            periodosUnicos.sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());

            setPeriodos(periodosUnicos);

            const asignaturasConNotas = data.map((item: { asignatura: Asignatura, notas: Nota[] }) => {
                const notasPorPeriodo: { [key: number]: Nota[] } = {};
                const notasExtraordinarias: Nota[] = [];
                periodosUnicos.forEach(periodo => {
                    notasPorPeriodo[periodo.id] = item.notas.filter(nota => nota.periodo?.id === periodo.id);
                });
                item.notas.forEach((nota) => {
                    if (nota.tipoNota?.id === 3 || nota.tipoNota?.id === 4) {
                        notasExtraordinarias.push(nota);
                    }
                });
                return { ...item.asignatura, notasPorPeriodo, notasExtraordinarias };
            });

            setAsignaturas(asignaturasConNotas);
        } catch (error) {
            console.error('Error fetching asignaturas y notas:', error);
        }
    };

    const calcularPromedioPorPeriodo = (notas: Nota[]) => {
        const evaluaciones = notas.filter(nota => nota.tipoNota?.id === 1);
        if (evaluaciones.length === 0) return '-';
        const total = evaluaciones.reduce((acc, nota) => acc + nota.nota, 0);
        return (total / evaluaciones.length).toFixed(2);
    };

    const calcularPromedioGeneral = (notasPorPeriodo: { [key: number]: Nota[] }) => {
        const todasLasNotas = Object.values(notasPorPeriodo).flat();
        const evaluaciones = todasLasNotas.filter(nota => nota.tipoNota?.id === 1);
        if (evaluaciones.length === 0) return '-';
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

            const maxPromedio = Math.max(...promedios);
            const final = (reDiciembre + maxPromedio) / 2;
            return final.toFixed(2);
        } else {
            return "-";
        }
    };

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
                    {/* aquí se puede poner el nombre de curso y división a la que pertenecen estas notas */}
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
                                const ciclo = ciclosLectivos.find(ciclo => ciclo.id.toString() === cicloId) || null;
                                setCicloLectivo(ciclo);
                            }}
                        >
                            {ciclosLectivos.length > 0 && ciclosLectivos.map(ciclo => (
                                <option key={ciclo.id} value={ciclo.id}>
                                    {ciclo.nombre}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Col>
            </Row>
            <div ref={pdfRef}>
                <Row>
                    <Col>
                        <h2>Asignaturas y Notas</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <Table responsive striped bordered hover>
                                <thead>
                                    <tr>
                                        <th style={{ backgroundColor: 'purple', color: 'white' }}>Asignatura</th>
                                        {periodos.map(periodo => (
                                            <th style={{ backgroundColor: 'purple', color: 'white' }} colSpan={7} key={periodo.id}>
                                                {periodo.nombre}
                                            </th>
                                        ))}
                                        <th style={{ backgroundColor: 'purple', color: 'white' }}>Promedio General</th>
                                        <th style={{ backgroundColor: 'purple', color: 'white' }}>Periodo de Evaluación de Diciembre</th>
                                        <th style={{ backgroundColor: 'purple', color: 'white' }}>Evaluación Ante Comisión de Febrero</th>
                                        <th style={{ backgroundColor: 'purple', color: 'white' }}>Calificación Final</th>
                                    </tr>
                                    <tr>
                                        <th></th>
                                        {periodos.flatMap(periodo => [
                                            <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N1`}>N1</th>,
                                            <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N2`}>N2</th>,
                                            <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N3`}>N3</th>,
                                            <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N4`}>N4</th>,
                                            <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N5`}>N5</th>,
                                            <th style={{ backgroundColor: 'red', color: 'white' }} key={`${periodo.id}-Coloquio`}>Coloquio</th>,
                                            <th style={{ backgroundColor: 'lightgreen' }} key={`${periodo.id}-Promedio`}>Promedio</th>
                                        ])}
                                        <th></th>
                                        <th></th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {asignaturas.map(asignatura => {
                                        const reDiciembre = getNotaExtraordinaria(asignatura.notasExtraordinarias, 3); // Nota reDiciembre
                                        const reFebrero = getNotaExtraordinaria(asignatura.notasExtraordinarias, 4); // Nota reFebrero
                                        const calificacionFinal = calcularCalificacionFinal(asignatura.notasPorPeriodo, reDiciembre, reFebrero);
                                        return (
                                            <tr key={asignatura.id}>
                                                <td>{asignatura.nombre}</td>
                                                {periodos.flatMap(periodo => {
                                                    const notas = asignatura.notasPorPeriodo[periodo.id] || [];
                                                    const coloquioNota = notas.find(nota => nota.tipoNota?.id === 2);
                                                    const promedio = calcularPromedioPorPeriodo(notas);
                                                    return (
                                                        <>
                                                            {notas.filter(nota => nota.tipoNota?.id === 1).map((nota, idx) => (
                                                                <td key={`${asignatura.id}-${periodo.id}-N${idx + 1}`}>{nota.nota}</td>
                                                            ))}
                                                            {new Array(5 - notas.filter(nota => nota.tipoNota?.id === 1).length).fill(null).map((_, idx) => (
                                                                <td key={`${asignatura.id}-${periodo.id}-empty-${idx}`}>-</td>
                                                            ))}
                                                            <td key={`${asignatura.id}-${periodo.id}-Coloquio`} style={{ backgroundColor: 'red', color: 'white' }}>{coloquioNota ? coloquioNota.nota : '-'}</td>
                                                            <td key={`${asignatura.id}-${periodo.id}-Promedio`} style={{ backgroundColor: 'lightgreen' }}>{promedio}</td>
                                                        </>
                                                    );
                                                })}
                                                <td style={{ backgroundColor: 'purple', color: 'white' }}>{calcularPromedioGeneral(asignatura.notasPorPeriodo)}</td>
                                                <td>{reDiciembre !== null ? reDiciembre.toFixed(2) : ''}</td>
                                                <td>{reFebrero !== null ? reFebrero.toFixed(2) : ''}</td>
                                                <td style={{ backgroundColor: 'purple', color: 'white' }}>{calificacionFinal}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h2>Asignaturas a Recuperar en Diciembre</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <Table responsive striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Asignatura</th>
                                        <th>Promedio General</th>
                                        <th style={{ backgroundColor: 'purple', color: 'white', textAlign: 'center' }}>Nota Final</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {asignaturas.filter(asignatura => {
                                        return Object.values(asignatura.notasPorPeriodo).some(notas =>
                                            notas.some(nota => nota.nota < 6)
                                        );
                                    }).map(asignatura => (
                                        <tr key={asignatura.id}>
                                            <td>{asignatura.nombre}</td>
                                            <td>{calcularPromedioGeneral(asignatura.notasPorPeriodo)}</td>
                                            <td style={{ backgroundColor: 'purple', color: 'white', textAlign: 'center' }}>
                                                {asignatura.notasPorPeriodo[periodos[0].id]?.[0]?.nota || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                </Row>
            </div>
            <Row className="justify-content-center mb-4">
                <Col xs="auto">
                    <StyledButton variant="purple" className="mx-2" onClick={exportToPDF}>
                        Visualizar PDF Analítico Provisorio
                    </StyledButton>
                </Col>
            </Row>
        </Container>
    );
};

interface StyledButtonProps extends ButtonProps {
    variant: 'purple';
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

export default ConsultaNota;

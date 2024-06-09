'use client';

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Table, Button, ButtonProps } from 'react-bootstrap';
import { Asignatura, Nota, Periodo, CicloLectivo } from 'model/types';
import { useUserContext, useInstitucionSelectedContext } from 'context/userContext';
import { useCicloLectivo } from 'context/CicloLectivoContext';
import styled from 'styled-components';

const ConsultaNota = () => {
    const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [ciclosLectivos, setCiclosLectivos] = useState<CicloLectivo[]>([]);
    const [user] = useUserContext();
    const [institucionSelected] = useInstitucionSelectedContext();
    const [cicloLectivo, setCicloLectivo] = useCicloLectivo();
    const [selectedCicloLectivo, setSelectedCicloLectivo] = useState<string>(cicloLectivo ? cicloLectivo.id.toString() : '');


    useEffect(() => {
        simulateFetchCiclosLectivos();
    }, []);

    useEffect(() => {
        if (selectedCicloLectivo) {
            simulateFetchAsignaturasYNotas();
        }
    }, [selectedCicloLectivo]);

    // Simulación de datos de ciclos lectivos
    const simulateFetchCiclosLectivos = () => {
        const ciclosSimulados: CicloLectivo[] = [
            { id: 1, nombre: '2023', fechaInicio: '2023-01-01', fechaFin: '2023-12-31', isActive: true, Periodos: [] },
            { id: 2, nombre: '2024', fechaInicio: '2024-01-01', fechaFin: '2024-12-31', isActive: false, Periodos: [] }
        ];
        setCiclosLectivos(ciclosSimulados);
    };

    // Simulación de datos de asignaturas y notas
    const simulateFetchAsignaturasYNotas = () => {
        const periodosSimulados: Periodo[] = [
            { id: 1, nombre: 'Primer Trimestre' },
            { id: 2, nombre: 'Segundo Trimestre' },
            { id: 3, nombre: 'Tercer Trimestre' }
        ];
        const asignaturasSimuladas: Asignatura[] = [
            {
                id: 1,
                nombre: 'Matemáticas',
                notas: [
                    { periodoId: 1, nota: 7 },
                    { periodoId: 1, nota: 6 },
                    { periodoId: 1, nota: 8 },
                    { periodoId: 1, nota: 5 },
                    { periodoId: 1, nota: 9 },
                    { periodoId: 2, nota: 4 },
                    { periodoId: 2, nota: 5 },
                    { periodoId: 2, nota: 6 },
                    { periodoId: 2, nota: 3 },
                    { periodoId: 2, nota: 7 },
                    { periodoId: 3, nota: 8 },
                    { periodoId: 3, nota: 7 },
                    { periodoId: 3, nota: 6 },
                    { periodoId: 3, nota: 9 },
                    { periodoId: 3, nota: 8 },
                ]
            },
            {
                id: 2,
                nombre: 'Historia',
                notas: [
                    { periodoId: 1, nota: 5 },
                    { periodoId: 1, nota: 6 },
                    { periodoId: 1, nota: 7 },
                    { periodoId: 1, nota: 6 },
                    { periodoId: 1, nota: 6 },
                    { periodoId: 2, nota: 5 },
                    { periodoId: 2, nota: 6 },
                    { periodoId: 2, nota: 7 },
                    { periodoId: 2, nota: 4 },
                    { periodoId: 2, nota: 6 },
                    { periodoId: 3, nota: 7 },
                    { periodoId: 3, nota: 8 },
                    { periodoId: 3, nota: 9 },
                    { periodoId: 3, nota: 6 },
                    { periodoId: 3, nota: 7 },
                ]
            },
            {
                id: 3,
                nombre: 'Ciencias',
                notas: [
                    { periodoId: 1, nota: 5 },
                    { periodoId: 1, nota: 6 },
                    { periodoId: 1, nota: 5 },
                    { periodoId: 1, nota: 5 },
                    { periodoId: 1, nota: 5 },
                    { periodoId: 2, nota: 4 },
                    { periodoId: 2, nota: 4 },
                    { periodoId: 2, nota: 5 },
                    { periodoId: 2, nota: 4 },
                    { periodoId: 2, nota: 6 },
                    { periodoId: 3, nota: 7 },
                    { periodoId: 3, nota: 6 },
                    { periodoId: 3, nota: 6 },
                    { periodoId: 3, nota: 5 },
                    { periodoId: 3, nota: 6 },
                ]
            }
        ];
        setPeriodos(periodosSimulados);
        setAsignaturas(asignaturasSimuladas);
    };

    const calcularPromedioPorPeriodo = (notas: Nota[], periodoId: number) => {
        const notasDelPeriodo = notas.filter(nota => nota.periodoId === periodoId);
        if (notasDelPeriodo.length === 0) return '-';
        const total = notasDelPeriodo.reduce((acc, nota) => acc + nota.nota, 0);
        return (total / notasDelPeriodo.length).toFixed(2);
    };

    const calcularPromedioGeneral = (notas: Nota[]) => {
        if (notas.length === 0) return '-';
        const notasAPromediadas = notas.map(nota => {
            const periodoRecuperado = periodos.find(periodo => periodo.id === nota.periodoId && calcularPromedioPorPeriodo([nota], periodo.id) < 6);
            return periodoRecuperado ? periodoRecuperado.notaRecuperacion || nota.nota : nota.nota;
        });
        const total = notasAPromediadas.reduce((acc, nota) => acc + nota, 0);
        return (total / notasAPromediadas.length).toFixed(2);
    };

    const asignaturasARecuperar = asignaturas.filter(asignatura =>
        periodos.some(periodo => calcularPromedioPorPeriodo(asignatura.notas, periodo.id) < 6)
    );

    return (
        <Container>
            {/* ... (código anterior) */}
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
                            onChange={(e) => {
                                setSelectedCicloLectivo(e.target.value);
                                const ciclo = ciclosLectivos.find(ciclo => ciclo.id.toString() === e.target.value) || null;
                                setCicloLectivo(ciclo);
                            }}
                        >
                            {ciclosLectivos.map(ciclo => (
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
                                </tr>
                                <tr>
                                    <th style={{ backgroundColor: 'purple', color: 'white' }}></th>
                                    {periodos.flatMap(periodo => [
                                        <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N1`}>N1</th>,
                                        <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N2`}>N2</th>,
                                        <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N3`}>N3</th>,
                                        <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N4`}>N4</th>,
                                        <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N5`}>N5</th>,
                                        <th style={{ backgroundColor: 'red', color: 'white' }} key={`${periodo.id}-PR`}>PR</th>,
                                        <th style={{ backgroundColor: 'lightgreen' }} key={`${periodo.id}-promedio`}>Promedio</th>
                                    ])}
                                    <th style={{ backgroundColor: 'purple', color: 'white' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {asignaturas.map(asignatura => (
                                    <tr key={asignatura.id}>
                                        <td>{asignatura.nombre}</td>
                                        {periodos.flatMap((periodo, index) => [
                                            <td key={`${asignatura.id}-${periodo.id}-nota1`}>{asignatura.notas[index * 5]?.nota ?? '-'}</td>,
                                            <td key={`${asignatura.id}-${periodo.id}-nota2`}>{asignatura.notas[index * 5 + 1]?.nota ?? '-'}</td>,
                                            <td key={`${asignatura.id}-${periodo.id}-nota3`}>{asignatura.notas[index * 5 + 2]?.nota ?? '-'}</td>,
                                            <td key={`${asignatura.id}-${periodo.id}-nota4`}>{asignatura.notas[index * 5 + 3]?.nota ?? '-'}</td>,
                                            <td key={`${asignatura.id}-${periodo.id}-nota5`}>{asignatura.notas[index * 5 + 4]?.nota ?? '-'}</td>,
                                            <td style={{ backgroundColor: 'red', color: 'white' }} key={`${asignatura.id}-${periodo.id}-PR`}>{calcularPromedioPorPeriodo(asignatura.notas, periodo.id) < 6 ? asignatura.notas.find(nota => nota.periodoId === periodo.id)?.nota || '-' : '-'}</td>,
                                            <td style={{ backgroundColor: 'lightgreen' }} key={`${asignatura.id}-${periodo.id}-promedio`}>{calcularPromedioPorPeriodo(asignatura.notas, periodo.id) < 6 ? asignatura.notas.find(nota => nota.periodoId === periodo.id)?.nota || '-' : calcularPromedioPorPeriodo(asignatura.notas, periodo.id)}</td>
                                        ])}
                                        <td style={{ backgroundColor: 'purple', color: 'white' }}>{calcularPromedioGeneral(asignatura.notas)}</td>
                                    </tr>
                                ))}
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
                                {asignaturas.filter(asignatura => calcularPromedioGeneral(asignatura.notas) < 6).map(asignatura => (
                                    <tr key={asignatura.id}>
                                        <td>{asignatura.nombre}</td>
                                        <td>{calcularPromedioGeneral(asignatura.notas)}</td>
                                        <td style={{ backgroundColor: 'purple', color: 'white', textAlign: 'center' }}>{asignatura.notaFinal || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Col>
            </Row>
            <Row className="justify-content-center mb-4">
                <Col xs="auto">
                    <StyledButton variant="purple" className="mx-2">
                        Visualizar PDF Analítico Provisorio
                    </StyledButton>
                </Col>
                <Col xs="auto">
                    <StyledButton variant="purple" className="mx-2">
                        Visualizar PDF DUE
                    </StyledButton>
                </Col>
            </Row>
        </Container>
    );


};



interface StyledButtonProps extends ButtonProps {
    variant: 'purple';
}

const StyledButton = styled(Button) <StyledButtonProps>`
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
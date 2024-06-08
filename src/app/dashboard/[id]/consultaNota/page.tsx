'use client';

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Table } from 'react-bootstrap';
import { Asignatura, Nota, Periodo, CicloLectivo } from 'model/types';  // Asegúrate de que estos tipos estén definidos en 'model/types'
import { Environment } from 'utils/EnviromenManager';
import { useUserContext } from 'context/userContext';
import { useCicloLectivo } from 'context/CicloLectivoContext';

const ConsultaNota = () => {
    const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [ciclosLectivos, setCiclosLectivos] = useState<CicloLectivo[]>([]);
    const [user] = useUserContext();
    const [cicloLectivo, setCicloLectivo] = useCicloLectivo();
    const [selectedCicloLectivo, setSelectedCicloLectivo] = useState<string>(cicloLectivo ? cicloLectivo.id.toString() : '');

    useEffect(() => {
        fetchCiclosLectivos();
    }, []);

    useEffect(() => {
        if (selectedCicloLectivo) {
            fetchAsignaturasYNotas();
        }
    }, [selectedCicloLectivo]);

    const fetchCiclosLectivos = async () => {
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getCiclosLectivos)}`);
        const data = await response.json();
        setCiclosLectivos(data);
    };

    const fetchAsignaturasYNotas = async () => {
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getAsignaturasYNotas)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuarioId: user.id,
                cicloLectivoId: selectedCicloLectivo
            })
        });
        const data = await response.json();
        setAsignaturas(data.asignaturas);
        setPeriodos(data.periodos);
    };

    const calcularPromedioPorPeriodo = (notas: Nota[], periodoId: number) => {
        const notasDelPeriodo = notas.filter(nota => nota.periodoId === periodoId);
        if (notasDelPeriodo.length === 0) return '-';
        const total = notasDelPeriodo.reduce((acc, nota) => acc + nota.nota, 0);
        return (total / notasDelPeriodo.length).toFixed(2);
    };

    const calcularPromedioGeneral = (notas: Nota[]) => {
        if (notas.length === 0) return '-';
        const total = notas.reduce((acc, nota) => acc + nota.nota, 0);
        return (total / notas.length).toFixed(2);
    };

    const asignaturasARecuperar = asignaturas.filter(asignatura =>
        periodos.some(periodo => calcularPromedioPorPeriodo(asignatura.notas, periodo.id) < 6)
    );

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
                            onChange={(e) => {
                                setSelectedCicloLectivo(e.target.value);
                                setCicloLectivo(ciclosLectivos.find(ciclo => ciclo.id.toString() === e.target.value) || null);
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
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Asignatura</th>
                                {periodos.map(periodo => (
                                    <th key={periodo.id}>{periodo.nombre}</th>
                                ))}
                                <th>Promedio General</th>
                            </tr>
                        </thead>
                        <tbody>
                            {asignaturas.map(asignatura => (
                                <tr key={asignatura.id}>
                                    <td>{asignatura.nombre}</td>
                                    {periodos.map(periodo => (
                                        <td key={periodo.id}>{calcularPromedioPorPeriodo(asignatura.notas, periodo.id)}</td>
                                    ))}
                                    <td>{calcularPromedioGeneral(asignatura.notas)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h2>Asignaturas a Recuperar</h2>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Asignatura</th>
                                {periodos.map(periodo => (
                                    <th key={periodo.id}>{periodo.nombre}</th>
                                ))}
                                <th>Recuperar</th>
                                <th>Promedio General</th>
                            </tr>
                        </thead>
                        <tbody>
                            {asignaturasARecuperar.map(asignatura => (
                                <tr key={asignatura.id}>
                                    <td>{asignatura.nombre}</td>
                                    {periodos.map(periodo => (
                                        <td key={periodo.id}>{calcularPromedioPorPeriodo(asignatura.notas, periodo.id)}</td>
                                    ))}
                                    <td></td> {/* Casillero vacío para la nota de recuperación */}
                                    <td>{calcularPromedioGeneral(asignatura.notas)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
};

export default ConsultaNota;

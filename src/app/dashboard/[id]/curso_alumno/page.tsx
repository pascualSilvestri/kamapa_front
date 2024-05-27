'use client'
import React, { useState } from 'react';
import { Container, Row, Col, Table, Form } from 'react-bootstrap';

interface Curso {
    curso: string;
    alumnos: string[]; // Aquí podrías usar tipos más complejos si es necesario, como objetos de alumno con más detalles
}

const CursosAlumnos = () => {
    const cursos: Curso[] = [
        { curso: 'Curso 1', alumnos: ['Alumno 1', 'Alumno 2'] },
        { curso: 'Curso 2', alumnos: ['Alumno 3', 'Alumno 4'] },
    ];

    const [filtroAlumno, setFiltroAlumno] = useState<string>('');

    const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroAlumno(e.target.value);
    };

    const filtrarAlumnos = (alumnos: string[], filtro: string): string[] => {
        return alumnos.filter(alumno =>
            alumno.toLowerCase().includes(filtro.toLowerCase())
        );
    };

    return (
        <Container>
            <h1>Visualizar Cursos y Alumnos</h1>
            <Row>
                <Col>
                    <Form.Group>
                        <Form.Control
                            type="text"
                            placeholder="Buscar Alumno..."
                            value={filtroAlumno}
                            onChange={handleFiltroChange}
                        />
                    </Form.Group>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Curso</th>
                                <th>Alumnos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cursos.map((curso, index) => (
                                <tr key={index}>
                                    <td>{curso.curso}</td>
                                    <td>
                                        <ul>
                                            {filtrarAlumnos(curso.alumnos, filtroAlumno).map(
                                                (alumno, idx) => (
                                                    <li key={idx}>{alumno}</li>
                                                )
                                            )}
                                        </ul>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
};

export default CursosAlumnos;

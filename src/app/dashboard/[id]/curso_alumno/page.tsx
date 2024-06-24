'use client'
import { Curso, User } from 'model/types';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Form, Button } from 'react-bootstrap';
import { Environment } from '../../../../utils/EnviromenManager';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useInstitucionSelectedContext } from 'context/userContext';

const CursosAlumnos = ({ params }: { params: { id: string } }) => {
    const [cursos, setCursos] = useState<Curso[]>([]); // Asegúrate de que cursos se inicialice como un array vacío
    const [filtroAlumno, setFiltroAlumno] = useState<string>('');
    const [institucionSelected] = useInstitucionSelectedContext();

    useEffect(() => {
        fetchCursosAndAlumnos(); // Llama a la función correcta fetchCursosAndAlumnos en useEffect
    }, []);

    async function fetchCursosAndAlumnos() {
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getCursosAllAlumnosByCicloLectivoActivo)}${params.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            // Verifica si data es un array antes de establecerlo en cursos
            if (Array.isArray(data)) {
                setCursos(data); // Establece cursos con los datos recibidos
            } else {
                console.error("Error: Data received is not an array");
                // Podrías manejar el error aquí, por ejemplo, mostrando un mensaje al usuario
            }
        } catch (error) {
            console.error("Error fetching courses and students:", error);
            // Podrías manejar el error aquí, por ejemplo, mostrando un mensaje al usuario
        }
    }

    const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroAlumno(e.target.value);
    };

    const filtrarAlumnos = (alumnos: User[], filtro: string): User[] => {
        return alumnos.filter(alumno =>
            alumno.nombre.toLowerCase().includes(filtro.toLowerCase())
        );
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        const fecha = new Date().toLocaleDateString();

        cursos.forEach((curso, index) => {
            if (index > 0) doc.addPage();
            doc.setFontSize(18);
            doc.text(institucionSelected.nombre, 10, 20);
            doc.setFontSize(12);
            doc.text(`Fecha: ${fecha}`, 10, 30);
            doc.text(`Curso: ${curso.nombre}`, 10, 50);
            autoTable(doc, {
                startY: 60,
                head: [['Nombre']],
                body: filtrarAlumnos(curso.cursosUsuario, filtroAlumno).map(alumno => [alumno.nombre])
            });
        });
        doc.save('cursos_alumnos.pdf');
    };

    const exportExcel = () => {
        const wb = XLSX.utils.book_new();
        cursos.forEach(curso => {
            const wsData = [
                [`Curso: ${curso.nombre}`],
                ['Nombre'],
                ...filtrarAlumnos(curso.cursosUsuario, filtroAlumno).map(alumno => [alumno.nombre]),
                ['']
            ];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, curso.nombre);
        });
        XLSX.writeFile(wb, 'cursos_alumnos.xlsx');
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
                    <Button variant="primary" onClick={exportPDF} style={{ margin: '10px' }}>
                        Exportar a PDF
                    </Button>
                    <Button variant="success" onClick={exportExcel} style={{ margin: '10px' }}>
                        Exportar a Excel
                    </Button>
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
                                    <td>{curso.nombre}</td>
                                    <td>
                                        <ul>
                                            {filtrarAlumnos(curso.cursosUsuario, filtroAlumno).map(
                                                (alumno, idx) => (
                                                    <li key={idx}>{alumno.nombre}</li>
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

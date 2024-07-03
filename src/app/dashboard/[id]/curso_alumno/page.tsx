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
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [filtroAlumno, setFiltroAlumno] = useState<string>('');
    const [institucionSelected] = useInstitucionSelectedContext();

    useEffect(() => {
        fetchCursosAndAlumnos();
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
            if (Array.isArray(data)) {
                setCursos(data.sort((a, b) => a.nombre.localeCompare(b.nombre)));
            } else {
                console.error("Error: Data received is not an array");
            }
        } catch (error) {
            console.error("Error fetching courses and students:", error);
        }
    }

    const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroAlumno(e.target.value);
    };

    const filtrarAlumnos = (alumnos: User[], filtro: string): User[] => {
        return alumnos.filter(alumno =>
            alumno.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
            alumno.apellido.toLowerCase().includes(filtro.toLowerCase())
        );
    };

    const exportPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        const fecha = new Date().toLocaleDateString();
        const mes = new Date().toLocaleString('default', { month: 'long' });
        const dias = Array.from({ length: 31 }, (_, i) => i + 1);

        cursos.forEach((curso, index) => {
            if (index > 0) doc.addPage();
            doc.setFontSize(18);
            doc.text(institucionSelected.nombre, 10, 20);
            doc.setFontSize(12);
            doc.text(`Fecha: ${fecha}`, 10, 30);
            doc.text(`Curso: ${curso.nombre}`, 10, 40);
            doc.text(`Mes: ${mes}`, 10, 50);

            const head = [['Apellido', 'Nombre', ...dias.map(dia => dia.toString())]];
            const body = filtrarAlumnos(curso.cursosUsuario, filtroAlumno).map(alumno => [
                alumno.apellido.toUpperCase(),
                alumno.nombre,
                ...dias.map(() => ' ')
            ]);

            autoTable(doc, {
                startY: 60,
                head: head,
                body: body,
                styles: {
                    cellWidth: 'wrap',
                    lineWidth: 0.1,
                    lineColor: [0, 0, 0],
                },
                tableWidth: 'auto'
            });
        });

        doc.save('cursos_alumnos.pdf');
    };

    const exportExcel = () => {
        const wb = XLSX.utils.book_new();
        cursos.forEach(curso => {
            const wsData = [
                [`Curso: ${curso.nombre}`],
                ['Apellido', 'Nombre', ...Array.from({ length: 31 }, (_, i) => (i + 1).toString())],
                ...filtrarAlumnos(curso.cursosUsuario, filtroAlumno).map(alumno => [
                    alumno.apellido.toUpperCase(),
                    alumno.nombre,
                    ...Array.from({ length: 31 }, () => '')
                ]),
                ['']
            ];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, curso.nombre);
        });
        XLSX.writeFile(wb, 'cursos_alumnos.xlsx');
    };

    const exportSimplePDF = () => {
        const doc = new jsPDF();
        const fecha = new Date().toLocaleDateString();

        cursos.forEach((curso, index) => {
            if (index > 0) doc.addPage();
            doc.setFontSize(18);
            doc.text(institucionSelected.nombre, 10, 20);
            doc.setFontSize(12);
            doc.text(`Fecha: ${fecha}`, 10, 30);
            doc.text(`Curso: ${curso.nombre}`, 10, 40);

            const head = [['Apellido', 'Nombre', 'DNI']];
            const body = filtrarAlumnos(curso.cursosUsuario, filtroAlumno).map(alumno => [
                alumno.apellido.toUpperCase(),
                alumno.nombre,
                alumno.dni
            ]);

            autoTable(doc, {
                startY: 60,
                head: head,
                body: body,
            });
        });

        doc.save('cursos_alumnos_simple.pdf');
    };

    const exportSimpleExcel = () => {
        const wb = XLSX.utils.book_new();
        cursos.forEach(curso => {
            const wsData = [
                [`Curso: ${curso.nombre}`],
                ['Apellido', 'Nombre', 'DNI'],
                ...filtrarAlumnos(curso.cursosUsuario, filtroAlumno).map(alumno => [
                    alumno.apellido.toUpperCase(),
                    alumno.nombre,
                    alumno.dni
                ]),
                ['']
            ];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, curso.nombre);
        });
        XLSX.writeFile(wb, 'cursos_alumnos_simple.xlsx');
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
                        Generar planilla de asistencias PDF
                    </Button>
                    <Button variant="success" onClick={exportExcel} style={{ margin: '10px' }}>
                        Generar planilla de asistencias Excel
                    </Button>
                    <Button variant="info" onClick={exportSimplePDF} style={{ margin: '10px' }}>
                        Lista de alumnos PDF
                    </Button>
                    <Button variant="warning" onClick={exportSimpleExcel} style={{ margin: '10px' }}>
                        Lista de alumnos Excel
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
                                                    <li key={idx}> <span style={{ textTransform: 'uppercase' }}>{alumno.apellido}</span>, <span>{alumno.nombre}</span></li>
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

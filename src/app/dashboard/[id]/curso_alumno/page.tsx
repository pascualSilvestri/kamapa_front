'use client'
import { Curso, User, Genero } from 'model/types';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Form, Button } from 'react-bootstrap';
import { Environment } from '../../../../utils/EnviromenManager';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useInstitucionSelectedContext } from 'context/userContext';
import AddAlumnoCurso from '../addAlumnoCurso/page';

declare module 'jspdf' {
    interface jsPDF {
        lastAutoTable: {
            finalY: number;
        };
    }
}

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
            console.log("Data fetched:", data);
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

    const handleEliminarAlumno = (cursoId: number, alumnoId: any) => {
        console.log(`Curso ID: ${cursoId}, Alumno ID: ${alumnoId}`);
        // Aquí puedes agregar la lógica para eliminar al alumno, como una llamada a la API
    };

    const exportPDF = () => {
        console.log("Exportando a PDF...");
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
            doc.text(`Mes: ${mes.toUpperCase()}`, 10, 50);

            // Filtrar alumnos
            const alumnosFiltrados = filtrarAlumnos(curso.cursosUsuario, filtroAlumno);

            // Función para crear una tabla con encabezados
            const crearTabla = (titulo: string, alumnos: User[], startY: number) => {
                doc.setFontSize(18);
                doc.text(titulo, 10, startY);
                const head = [['Apellido', 'Nombre', ...dias.map(dia => dia.toString())]];
                const body = alumnos.map(alumno => [
                    alumno.apellido.toUpperCase(),
                    alumno.nombre,
                    ...dias.map(() => ' ')
                ]);
                autoTable(doc, {
                    startY: startY + 10, // Posiciona la tabla justo debajo del título
                    head: head,
                    body: body,
                    styles: {
                        cellWidth: 'wrap',
                        lineWidth: 0.1,
                        lineColor: [0, 0, 0],
                    },
                    tableWidth: 'auto'
                });
                return doc.lastAutoTable.finalY; // Devuelve la posición Y donde termina la tabla
            };

            // Ejemplo de cómo podrías implementar el filtrado por género y crear tablas

            let startY = 70;
            const alumnosGenero1 = alumnosFiltrados.filter(alumno => alumno.generoId === 1);
            const alumnosGenero2 = alumnosFiltrados.filter(alumno => alumno.generoId === 2);


            // Ordenar alumnos alfabéticamente por apellido
            alumnosGenero1.sort((a, b) => a.apellido.localeCompare(b.apellido));
            alumnosGenero2.sort((a, b) => a.apellido.localeCompare(b.apellido));


            if (alumnosGenero1.length > 0) {
                startY = crearTabla('Alumnos Varones', alumnosGenero1, startY);
            }

            if (alumnosGenero2.length > 0) {
                startY = crearTabla('Alumnos Mujeres', alumnosGenero2, startY + 20); // Añade espacio entre las tablas
            }

        });

        doc.save('cursos_alumnos.pdf');
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

            // Filtrar alumnos
            const alumnosFiltrados = filtrarAlumnos(curso.cursosUsuario, filtroAlumno);

            // Separar alumnos por género
            const alumnosGenero1 = alumnosFiltrados.filter(alumno => alumno.generoId === 1);
            const alumnosGenero2 = alumnosFiltrados.filter(alumno => alumno.generoId === 2);

            // Ordenar alfabéticamente por apellido
            alumnosGenero1.sort((a, b) => a.apellido.localeCompare(b.apellido));
            alumnosGenero2.sort((a, b) => a.apellido.localeCompare(b.apellido));

            const head = [['Apellido', 'Nombre', 'CUIL', 'Telefono']];

            // Función para agregar tabla de alumnos
            const agregarTabla = (titulo: string, alumnos: User[], startY: number) => {
                doc.setFontSize(14);
                doc.text(titulo, 10, startY);
                const body = alumnos.map(alumno => [
                    alumno.apellido.toUpperCase(),
                    alumno.nombre,
                    alumno.cuil,
                    alumno.telefono,
                ]);
                autoTable(doc, {
                    startY: startY + 10, // Posiciona la tabla justo debajo del título
                    head: head,
                    body: body,
                });
                return doc.lastAutoTable.finalY; // Devuelve la posición Y donde termina la tabla
            };

            // Agregar tablas para cada género
            let startY = 60;
            if (alumnosGenero1.length > 0) {
                startY = agregarTabla('Alumnos Varones', alumnosGenero1, startY);
            }
            if (alumnosGenero2.length > 0) {
                agregarTabla('Alumnas Mujeres', alumnosGenero2, startY + 20); // Añade espacio entre las tablas
            }
        });

        doc.save('cursos_alumnos_simple.pdf');
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
                 
                    <Button variant="info" onClick={exportSimplePDF} style={{ margin: '10px' }}>
                        Lista de alumnos PDF
                    </Button>
           
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Curso</th>
                                <th>Alumnos</th>
                                <th>Acciones</th>
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
                                                    <li key={idx}>
                                                        <span style={{ textTransform: 'uppercase' }}>{alumno.apellido}</span>, <span>{alumno.nombre}</span>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </td>
                                    <td>
                                        <ul>
                                            {filtrarAlumnos(curso.cursosUsuario, filtroAlumno).map(
                                                (alumno, idx) => (
                                                    <li key={idx}>
                                                        <Button variant="danger" size="sm" onClick={() => handleEliminarAlumno(curso.id, alumno.id)}>
                                                            Eliminar
                                                        </Button>
                                                    </li>
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

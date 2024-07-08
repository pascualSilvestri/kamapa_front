'use client';
import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { Curso, User } from 'model/types';  // Asegúrate de que 'User' y 'Curso' estén definidos en 'model/types'
import { Environment } from 'utils/EnviromenManager';
import { useInstitucionSelectedContext, useUserContext } from 'context/userContext';
import { useCicloLectivo } from 'context/CicloLectivoContext';
import { jsPDF } from 'jspdf'; // Importar jsPDF para la exportación a PDF
import autoTable from 'jspdf-autotable'; // Importar autoTable para la exportación a PDF
import * as XLSX from 'xlsx'; // Importar XLSX para la exportación a Excel

const AddNotasAlumno = ({ params }: { params: { id: string } }) => {
    const [cursoSeleccionado, setCursoSeleccionado] = useState<string>('');
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [alumnos, setAlumnos] = useState<User[]>([]);
    const [nombreCursoSeleccionado, setNombreCursoSeleccionado] = useState<string>('');
    const [user] = useUserContext();
    const [cicloLectivo] = useCicloLectivo();
    const [institucionSelected] = useInstitucionSelectedContext();

    useEffect(() => {
        fetchCursos();
    }, []);

    useEffect(() => {
        if (cursoSeleccionado) {
            fetchAlumnos();
            const curso = cursos.find(curso => curso.id === Number(cursoSeleccionado));
            setNombreCursoSeleccionado(curso ? curso.nombre : '');
        }
    }, [cursoSeleccionado]);

    const fetchCursos = async () => {
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getCursosForUsuario)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuarioId: user.id,
                cicloLectivoId: cicloLectivo.id,
            })
        });
        const data = await response.json();
        setCursos(Array.isArray(data) ? data : []);
    };

    const fetchAlumnos = async () => {
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getAlumnosByCurso)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cursoId: Number(cursoSeleccionado),
                    cicloLectivoId: Number(cicloLectivo.id),
                })
            });
            const data = await response.json();
            console.log(data);
            setAlumnos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching alumnos:', error);
            setAlumnos([]);  // Ensure alumnos is an array in case of error
        }
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        const fecha = new Date().toLocaleDateString();

        // Agregar encabezado con nombre de la institución y fecha
        doc.setFontSize(18);
        doc.text(institucionSelected.nombre, 10, 20); // Ajusta la posición del texto según sea necesario
        doc.setFontSize(12);
        doc.text(`Fecha: ${fecha}`, 10, 30); // Ajusta la posición del texto según sea necesario

        doc.text(`Lista de Alumnos - ${nombreCursoSeleccionado}`, 10, 50);
        autoTable(doc, {
            startY: 60,
            head: [['Nombre', 'Apellido', 'DNI']],
            body: alumnos.map(alumno => [alumno.nombre, alumno.apellido, alumno.dni])
        });
        doc.save(`alumnos_${nombreCursoSeleccionado}.pdf`);
    };

    // const exportExcel = () => {
    //     const ws = XLSX.utils.json_to_sheet(alumnos.map(alumno => ({
    //         Nombre: alumno.nombre,
    //         Apellido: alumno.apellido,
    //         DNI: alumno.dni,
    //     })));
    //     const wb = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(wb, ws, `Alumnos_${nombreCursoSeleccionado}`);
    //     XLSX.writeFile(wb, `alumnos_${nombreCursoSeleccionado}.xlsx`);
    // };

    return (
        <Container>
            <Row>
                <Col md={12}>
                    <h1>Lista de Alumnos - {nombreCursoSeleccionado}</h1>
                    <Row>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Curso</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={cursoSeleccionado}
                                    onChange={(e) => setCursoSeleccionado(e.target.value)}
                                >
                                    <option value="">Seleccionar curso</option>
                                    {cursos.map((curso) => (
                                        <option key={curso.id} value={curso.id}>{curso.nombre}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    {alumnos.length > 0 && (
                        <>
                            <Button variant="primary" onClick={exportPDF} style={{ margin: '10px' }}>
                                Exportar a PDF
                            </Button>
                            <Button variant="success" onClick={exportExcel} style={{ margin: '10px' }}>
                                Exportar a Excel
                            </Button>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Apellido</th>
                                        <th>DNI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alumnos.map(alumno => (
                                        <tr key={alumno.id}>
                                            <td>{alumno.nombre}</td>
                                            <td>{alumno.apellido}</td>
                                            <td>{alumno.dni}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default AddNotasAlumno;

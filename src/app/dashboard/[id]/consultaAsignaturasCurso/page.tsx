"use client";

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button, ButtonProps } from 'react-bootstrap';
import { Asignatura, Curso, User } from 'model/types';
import { useUserContext, useInstitucionSelectedContext } from 'context/userContext';
import { Environment } from 'utils/EnviromenManager';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import styled from 'styled-components';

const ConsultaNota = ({ params }: { params: { id: string } }) => {
    const [cursosConAsignaturas, setCursosConAsignaturas] = useState<Curso[]>([]);
    const [user] = useUserContext();
    const [institucionSelected] = useInstitucionSelectedContext();

    useEffect(() => {
        fetchCursosConAsignaturas();
    }, []);

    const fetchCursosConAsignaturas = async () => {
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getCursosAndAsignaturasByInstitucion)}${params.id}`);
            const data = await response.json();
            console.log(data);
            setCursosConAsignaturas(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching cursos con asignaturas:', error);
        }
    };

    const exportToPDF = async () => {
        const input = document.getElementById('exportTable');
        if (!input) return;

        const canvas = await html2canvas(input);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const fecha = new Date().toLocaleDateString();

        // Agregar encabezado con nombre de la institución y fecha
        pdf.setFontSize(18);
        pdf.text(institucionSelected.nombre, 10, 20); // Ajusta la posición del texto según sea necesario
        pdf.setFontSize(12);
        pdf.text(`Fecha: ${fecha}`, 10, 30); // Ajusta la posición del texto según sea necesario

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 40, pdfWidth, pdfHeight);
        pdf.save('Cursos_Asignaturas_Profesores.pdf');
    };

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(cursosConAsignaturas.map(curso => ({
            Curso: curso.nombre,
            Asignatura: curso.cursoAsignaturaProfesorCicloLectivo.map(a => a.asignatura.nombre).join(', '),
            Profesor: curso.cursoAsignaturaProfesorCicloLectivo.map(a => a.usuario ? `${a.usuario.nombre} ${a.usuario.apellido}` : 'No asignado').join(', ')
        })));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, 'Cursos_Asignaturas_Profesores.xlsx');
    };

    return (
        <Container>
            <Row>
                <Col>
                    <h1>Cursos, Asignaturas y Profesores</h1>
                    <Table id="exportTable" striped bordered hover>
                        <thead>
                            <tr>
                                <th>Curso</th>
                                <th>Asignaturas</th>
                                <th>Profesor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cursosConAsignaturas.map((curso) => (
                                <tr key={curso.id}>
                                    <td>{curso.nombre}</td>
                                    <td>
                                        {curso.cursoAsignaturaProfesorCicloLectivo.map((asignatura) => (
                                            <li key={asignatura.asignatura.id}>
                                                {asignatura.asignatura.nombre}
                                            </li>
                                        ))}
                                    </td>
                                    <td>
                                        {curso.cursoAsignaturaProfesorCicloLectivo.map((asignatura) => (
                                            <li key={asignatura.asignatura.id}>
                                                {asignatura.usuario ? `${asignatura.usuario.nombre} ${asignatura.usuario.apellido}` : 'No asignado'}
                                            </li>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Row className="justify-content-center mb-4">
                <Col xs="auto">
                    <StyledButton variant="purple" className="mx-2" onClick={exportToPDF}>
                        Exportar PDF
                    </StyledButton>
                </Col>
                <Col xs="auto">
                    <StyledButton variant="purple" className="mx-2" onClick={exportToExcel}>
                        Exportar Excel
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

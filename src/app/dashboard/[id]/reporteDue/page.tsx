"use client";

import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Table, Button } from "react-bootstrap";
import { Periodo, CicloLectivo, Asignatura, Nota } from "model/types";
import { useUserContext, useInstitucionSelectedContext } from "context/userContext";
import { useCicloLectivo } from "context/CicloLectivoContext";
import { Environment } from "utils/EnviromenManager";
import Link from "next/link";

const DueReport = ({ params }: { params: { id: string } }) => {
  const [cursos, setCursos] = useState<any[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<string>("");
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [ciclosLectivos, setCiclosLectivos] = useState<CicloLectivo[]>([]);
  const [selectedCicloLectivo, setSelectedCicloLectivo] = useState<string>("");
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [user] = useUserContext();
  const [institucionSelected] = useInstitucionSelectedContext();
  const [cicloLectivo, setCicloLectivo] = useCicloLectivo();

  useEffect(() => {
    fetchCiclosLectivos();
  }, []);

  useEffect(() => {
    if (selectedCicloLectivo) {
      fetchCursosYAlumnos();
    }
  }, [selectedCicloLectivo]);

  const fetchCiclosLectivos = async () => {
    try {
      const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getAllCicloLectivo)}${params.id}`
      );
      const data = await response.json();
      setCiclosLectivos(data);
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
      setCursos(data.cursos);
    } catch (error) {
      console.error("Error fetching cursos y alumnos:", error);
    }
  };

  const handleCicloLectivoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCicloLectivo(e.target.value);
    setSelectedCurso("");
    setAlumnos([]);
  };

  const handleCursoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cursoId = e.target.value;
    setSelectedCurso(cursoId);
    const cursoSeleccionado = cursos.find((curso: any) => curso.curso.id.toString() === cursoId);
    if (cursoSeleccionado) {
      setAlumnos(cursoSeleccionado.alumnos);
    }
  };

  return (
    <Container>
      <Row>
        <Col>
          <Form.Group>
            <Form.Label>Seleccione un Ciclo Lectivo</Form.Label>
            <Form.Control
              as="select"
              value={selectedCicloLectivo}
              onChange={handleCicloLectivoChange as any}
            >
              <option value="">Seleccione un ciclo lectivo</option>
              {ciclosLectivos.map((ciclo) => (
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
          <Form.Group>
            <Form.Label>Seleccione un Curso</Form.Label>
            <Form.Control
              as="select"
              value={selectedCurso}
              onChange={handleCursoChange as any}
            >
              <option value="">Seleccione un curso</option>
              {cursos.map((curso) => (
                <option key={curso.curso.id} value={curso.curso.id}>
                  {curso.curso.nombre} {curso.curso.division}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>DNI</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((alumno) => (
                <tr key={alumno.alumno.id}>
                  <td>{alumno.alumno.nombre}</td>
                  <td>{alumno.alumno.apellido}</td>
                  <td>{alumno.alumno.dni}</td>
                  <td>
                    <Link href={`/dashboard/${params.id}/reporteDue/${alumno.alumno.id}/due`}  >
                      <Button variant="primary">DUE</Button>
                    </Link>{" "}
                    <Link href={`/dashboard/${params.id}/reporteDue/${alumno.alumno.id}/planilla`}  >
                      <Button variant="secondary">Analítico Provisorio</Button>
                    </Link>
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

export default DueReport;

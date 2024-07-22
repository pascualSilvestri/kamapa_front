"use client";

import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Table } from "react-bootstrap";
import { CicloLectivo, Asignatura, Nota, Curso } from "model/types";
import { Environment } from "utils/EnviromenManager";

const Due = ({ params }: { params: { id: string } }) => {
  const [cursos, setCursos] = useState<any[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<string>("");
  const [ciclosLectivos, setCiclosLectivos] = useState<CicloLectivo[]>([]);
  const [selectedCicloLectivo, setSelectedCicloLectivo] = useState<string>("");

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
      const response = await fetch(
        `${Environment.getEndPoint(Environment.endPoint.getAllCicloLectivo)}${params.id}`
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
      setCursos(data.ciclosLectivo.cursos);
    } catch (error) {
      console.error("Error fetching cursos y alumnos:", error);
    }
  };

  const handleCicloLectivoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCicloLectivo(e.target.value);
    setSelectedCurso("");
  };

  const calcularPromedio = (notas: Nota[]) => {
    const evaluaciones = notas.filter((nota) => nota.tipoNota?.id === 1);
    if (evaluaciones.length === 0) return 0;
    const total = evaluaciones.reduce((acc, nota) => acc + nota.nota, 0);
    return total / evaluaciones.length;
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
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Curso</th>
                <th>Asignatura</th>
                <th>Cantidad de Alumnos con Promedio  6</th>
              </tr>
            </thead>
            <tbody>
              {cursos.map((curso: any) => (
                <React.Fragment key={curso.curso.id}>
                  {curso.alumnos.flatMap((alumno: any) =>
                    alumno.asignaturas.map((asignatura: any) => (
                      <tr key={asignatura.asignatura.id}>
                        <td>{curso.curso.nombre} {curso.curso.division}</td>
                        <td>{asignatura.asignatura.nombre}</td>
                        <td>
                          {
                            curso.alumnos.filter((alumno: any) =>
                              calcularPromedio(alumno.asignaturas
                                .find((a: any) => a.asignatura.id === asignatura.asignatura.id)?.notas || []
                              ) < 6
                            ).length
                          }
                        </td>
                      </tr>
                    ))
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default Due;

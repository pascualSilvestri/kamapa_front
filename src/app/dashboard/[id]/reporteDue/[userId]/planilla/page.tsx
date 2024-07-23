"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Table,
  Button,
  ButtonProps,
  Row,
  Col,
} from "react-bootstrap";
import { Asignatura, Nota, User } from "model/types";
import { useInstitucionSelectedContext } from "context/userContext";
import { useCicloLectivo } from "context/CicloLectivoContext";
import styled from "styled-components";
import { Environment } from "utils/EnviromenManager";

const Due = ({ params }: { params: { id: string; userId: string } }) => {
  const { id, userId } = params;
  const [data, setData] = useState<any[]>([]);
  const [institucionSelected] = useInstitucionSelectedContext();
  const [cicloLectivo] = useCicloLectivo();
  const [user, setUser] = useState<User>(null);
  const pdfRef = useRef(null);

  useEffect(() => {
    fetchs();
  }, []);

  const fetchs = async () => {
    await fetchGetUser();
    await fetchAsignaturasYNotas();
  };

  const fetchGetUser = async () => {
    try {
      const response = await fetch(
        `${Environment.getEndPoint(
          Environment.endPoint.getUsuarioById
        )}${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      setUser(data.usuarios[0]);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching user:", error.message);
      } else {
        console.error("Error fetching user:", error);
      }
    }
  };

  console.log(user);

  const fetchAsignaturasYNotas = async () => {
    try {
      const response = await fetch(
        `${Environment.getEndPoint(Environment.endPoint.getNotasByAlumno)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            alumnoId: userId,
          }),
        }
      );
      const data = await response.json();
      setData(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching ciclos lectivos:", error.message);
      } else {
        console.error("Error fetching ciclos lectivos:", error);
      }
    }
  };

  const calculateAverage = (notas: Nota[]) => {
    const evaluacionNotas = notas.filter(
      (nota) => nota.tipoNota.tipo === "evaluacion"
    );
    const total = evaluacionNotas.reduce((acc, nota) => acc + nota.nota, 0);
    return evaluacionNotas.length
      ? (total / evaluacionNotas.length).toFixed(2)
      : "N/A";
  };

  const calculateFinalNota = (asignatura: any) => {
    const periodosMap: any = {};
    asignatura.notas.forEach((nota: Nota) => {
      const periodoNombre = nota.periodo?.nombre || "Sin Periodo";
      if (!periodosMap[periodoNombre]) {
        periodosMap[periodoNombre] = { notas: [], recuperatorio: null };
      }
      if (nota.tipoNota.tipo === "recuperatorio") {
        periodosMap[periodoNombre].recuperatorio = nota.nota;
      } else {
        periodosMap[periodoNombre].notas.push(nota);
      }
    });

    const notasEvaluacion = Object.keys(periodosMap).map((periodoNombre) => ({
      nombre: periodoNombre,
      promedio: calculateAverage(periodosMap[periodoNombre].notas),
      recuperatorio: periodosMap[periodoNombre].recuperatorio,
    }));

    const notaFinalParcial =
      notasEvaluacion.reduce(
        (acc, periodo) => acc + parseFloat(periodo.promedio),
        0
      ) / notasEvaluacion.length;
    const notaFinalParcialRedondeada = notaFinalParcial.toFixed(2);

    const reDiciembre =
      asignatura.notas.find(
        (nota: Nota) => nota.tipoNota.tipo === "reDiciembre"
      )?.nota || null;
    const reFebrero =
      asignatura.notas.find((nota: Nota) => nota.tipoNota.tipo === "reFebrero")
        ?.nota || null;

    let notaFinal = notaFinalParcialRedondeada;
    if (notaFinalParcial < 6) {
      if (reDiciembre && reDiciembre >= 6) {
        notaFinal = Math.max(notaFinalParcial, reDiciembre).toFixed(2);
      } else if (reFebrero && reFebrero >= 6) {
        notaFinal = reFebrero.toFixed(2);
      }
    }

    return {
      notasEvaluacion,
      notaFinalParcial: notaFinalParcialRedondeada,
      reDiciembre,
      reFebrero,
      notaFinal,
    };
  };

  console.log(institucionSelected)

  return (
    <Container>
      <Row>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <img
                src={institucionSelected.logo || "/Logo.png"}
                alt="Logo"
                style={{ maxWidth: "100px", height: "auto" }}
              />
            </div>
            <div>
              <h1
                style={{
                  textAlign: "start",
                  fontWeight: "bold",
                  fontSize: "20px",
                  padding: "5px",
                }}
              >
                {institucionSelected.nombre}
              </h1>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "flex-end",
                flexDirection: "column",
              }}
            >
          
            </div>
          </div>
          <div>
            <p
              style={{
                textAlign: "start",
                fontWeight: "bold",
                fontSize: "14px",
                padding: "5px",
              }}
            >
              Escuela:{" "}
              <span
                style={{ fontWeight: "normal", borderBottom: "2px solid #000" }}
              >
                {institucionSelected.nombre}
              </span>
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <p
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "14px",
                  padding: "5px",
                }}
              >
                Alumno:{" "}
                <span
                  style={{
                    fontWeight: "normal",
                    borderBottom: "2px solid #000",
                  }}
                >
                 {user ? `${user.apellido ?? ''} ${user.nombre ?? ''}` : ''}
                </span>
              </p>
              <p
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "14px",
                  padding: "5px",
                }}
              >
                DNI:{" "}
                <span
                  style={{
                    fontWeight: "normal",
                    borderBottom: "2px solid #000",
                  }}
                >
                  {user ? user.dni: ''}
                </span>
              </p>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <p
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "14px",
                  padding: "5px",
                }}
              >
                Año:{" "}
                <span
                  style={{
                    fontWeight: "normal",
                    borderBottom: "2px solid #000",
                  }}
                >
                  20{new Date().getFullYear().toString().slice(-2)}
                </span>
              </p>
            
            
            </div>
          </div>
        </div>
      </Row>
      {data.map((ciclo: any) => {
        const periodos = Array.from(
          new Set(
            ciclo.asignaturas.flatMap((asignatura: any) =>
              asignatura.notas.map(
                (nota: any) => nota.periodo?.nombre || "Sin Periodo"
              )
            )
          )
        );
        return (
          <div key={ciclo.cicloLectivo.id}>
            <h2>{ciclo.cicloLectivo.nombre}</h2>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Asignatura</th>
                  {periodos.map((periodoNombre: string) => (
                    <th key={periodoNombre}>{periodoNombre}</th>
                  ))}
                  <th>Nota Final Parcial</th>
                  <th>ReDiciembre</th>
                  <th>ReFebrero</th>
                  <th>Nota Final</th>
                </tr>
              </thead>
              <tbody>
                {ciclo.asignaturas.map((asignatura: any) => {
                  const finalNotas = calculateFinalNota(asignatura);
                  return (
                    <tr key={asignatura.asignatura.id}>
                      <td>{asignatura.asignatura.nombre}</td>
                      {periodos.map((periodoNombre: string) => {
                        const notaPeriodo = finalNotas.notasEvaluacion.find(
                          (notaEval: any) => notaEval.nombre === periodoNombre
                        );
                        return (
                          <td key={periodoNombre}>
                            {notaPeriodo ? notaPeriodo.promedio : "N/A"}
                          </td>
                        );
                      })}
                      <td>{finalNotas.notaFinalParcial}</td>
                      <td>{finalNotas.reDiciembre}</td>
                      <td>{finalNotas.reFebrero}</td>
                      <td>{finalNotas.notaFinal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        );
      })}
    </Container>
  );
};

interface StyledButtonProps extends ButtonProps {
  variant: "purple";
}

const StyledButton = styled(Button)<StyledButtonProps>`
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

export default Due;

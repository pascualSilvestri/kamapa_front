"use client";

import React, { useEffect, useState } from "react";
import {
  useInstitucionSelectedContext,
  useRolesContext,
  useUserContext,
} from "context/userContext";
import { useCicloLectivo } from "context/CicloLectivoContext";
import { Environment } from "utils/EnviromenManager";
import {
  CicloLectivo,
  Asignatura,
  Nota,
  Periodo,
  User,
  Curso,
} from "model/types";
import { useRouter } from "next/navigation";
import { Row, Col, Card, Spinner } from "react-bootstrap";
import { useSession } from "next-auth/react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

function PageBienvenido({ params }: { params: { id: string } }) {
  const [institucionSelected, setInstitucionSelected] =
    useInstitucionSelectedContext();
  const [rol, setRol] = useRolesContext();
  const [user] = useUserContext();
  const [cicloLectivo, setCicloLectivo] = useCicloLectivo();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [alumnos, setAlumnos] = useState<User[]>([]);
  const [empleados, setEmpleados] = useState<User[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const { data: session, status } = useSession();

  console.log(institucionSelected);

  useEffect(() => {
    fetchDatas();
  }, []);

  useEffect(() => {
    if (!loading && rol.some((r) => r.name === "Alumno")) {
      fetchAsignaturasYNotas();
    }
  }, [loading, rol]);

  const fetchDatas = async () => {
    await fetchCicloLectivoActivo();
    await fetchAlumnos();
    await fetchEmpleados();
    await fetchCursosAndAlumnos();
  };

  const fetchCicloLectivoActivo = async () => {
    try {
      const response = await fetch(
        `${Environment.getEndPoint(Environment.endPoint.getCicloLectivo)}${
          params.id
        }`
      );
      if (response.status !== 200) {
        if (rol.some((rol) => rol.name == "Director")) {
          router.push(`/dashboard/${params.id}/newciclolectivo`);
        } else {
          router.push(`/dashboard/${params.id}/bienvenido`);
        }
        return;
      }
      const data: CicloLectivo = await response.json();
      setCicloLectivo(data);
      console.log(data);
    } catch (error) {
      console.error("Error al obtener el ciclo lectivo:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlumnos = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${Environment.getEndPoint(
          Environment.endPoint.getUsuarioWhereRolIsAlumnoByInstitucion
        )}${params.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log(data);
      setAlumnos(data.alumnos);
    } catch (error) {
      console.error("Error al obtener alumnos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmpleados = async () => {
    try {
      const response = await fetch(
        `${Environment.getEndPoint(
          Environment.endPoint.getUsuarioWhereRolIsNotAlumnoByIntitucion
        )}${params.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Empleados:", data);
      setEmpleados(data.usuarios);
    } catch (error) {
      console.error("Error al obtener empleados:", error.message);
    }
  };

  const fetchCursosAndAlumnos = async () => {
    try {
      const response = await fetch(
        `${Environment.getEndPoint(
          Environment.endPoint.getCursosAllAlumnosByCicloLectivoActivo
        )}${params.id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Data fetched:", data);
      if (Array.isArray(data)) {
        setCursos(data.sort((a, b) => a.id - b.id)); // Ordenar por id
      } else {
        console.error("Error: Data received is not an array");
      }
    } catch (error) {
      console.error("Error fetching courses and students:", error);
    }
  };

  const fetchAsignaturasYNotas = async () => {
    try {
      const response = await fetch(
        `${Environment.getEndPoint(
          Environment.endPoint.getNotasByAlumnoForCicloElectivo
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            alumnoId: user.id,
            cicloLectivoId: cicloLectivo.id,
          }),
        }
      );
      const data = await response.json();

      const periodosUnicos: Periodo[] = [];
      data.forEach((item: { asignatura: Asignatura; notas: Nota[] }) => {
        item.notas.forEach((nota: Nota) => {
          if (
            !periodosUnicos.find((periodo) => periodo.id === nota.periodo.id)
          ) {
            periodosUnicos.push(nota.periodo);
          }
        });
      });

      periodosUnicos.sort(
        (a, b) =>
          new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()
      );

      setPeriodos(periodosUnicos);

      const asignaturasConNotas = data.map(
        (item: { asignatura: Asignatura; notas: Nota[] }) => {
          const notasPorPeriodo: { [key: number]: Nota[] } = {};
          periodosUnicos.forEach((periodo) => {
            notasPorPeriodo[periodo.id] = item.notas.filter(
              (nota) => nota.periodo.id === periodo.id
            );
          });
          return { ...item.asignatura, notasPorPeriodo };
        }
      );

      setAsignaturas(asignaturasConNotas);
    } catch (error) {
      console.error("Error fetching asignaturas y notas:", error);
    }
  };

  const calcularPromedioPorPeriodo = (notas: Nota[]) => {
    const evaluaciones = notas.filter((nota) => nota.tipoNota?.id === 1);
    if (evaluaciones.length === 0) return "-";
    const total = evaluaciones.reduce((acc, nota) => acc + nota.nota, 0);
    return (total / evaluaciones.length).toFixed(2);
  };

  const calcularPromedioGeneral = (notasPorPeriodo: {
    [key: number]: Nota[];
  }) => {
    const todasLasNotas = Object.values(notasPorPeriodo).flat();
    const evaluaciones = todasLasNotas.filter(
      (nota) => nota.tipoNota?.id === 1
    );
    if (evaluaciones.length === 0) return "-";
    const total = evaluaciones.reduce((acc, nota) => acc + nota.nota, 0);
    return (total / evaluaciones.length).toFixed(2);
  };

  const getChartData = () => {
    const labels = cursos.map((curso) => curso.nombre);
    const data = cursos.map((curso) => curso.cursosUsuario.length);

    return {
      labels,
      datasets: [
        {
          label: "Cantidad de alumnos",
          data,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out"
      style={{ backgroundImage: "url('/path/to/background-image.jpg')" }}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white bg-opacity-90 shadow-lg rounded-lg overflow-hidden transform transition duration-500 hover:scale-105">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-4">
            Bienvenido a {institucionSelected.nombre}
          </h1>
          <div className="mt-6">
            <Row className="mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
                Ciclo Lectivo {cicloLectivo.nombre}
              </h2>
            </Row>
            {rol && rol.some((e) => e.name === "Alumno") ? (
              <>
                <Row>
                  <Col xs={12} md={4} className="mb-4">
                    <Card className="text-center shadow-sm border-0">
                      <Card.Header className="text-lg font-bold">
                        Curso
                      </Card.Header>
                      <Card.Body>
                        <Card.Text className="text-xl font-semibold">
                          {cicloLectivo.nombre}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={12} md={4} className="mb-4">
                    <Card className="text-center shadow-sm border-0">
                      <Card.Header className="text-lg font-bold">
                        Materias Asignadas
                      </Card.Header>
                      <Card.Body>
                        {asignaturas.map((asignatura, index) => (
                          <Card.Text
                            key={index}
                            className="text-md font-medium"
                          >
                            {asignatura.nombre} - Promedio:{" "}
                            {calcularPromedioGeneral(
                              asignatura.notasPorPeriodo
                            )}
                          </Card.Text>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={12} md={4} className="mb-4">
                    <Card className="text-center shadow-sm border-0">
                      <Card.Header className="text-lg font-bold">
                        Aula Asignada
                      </Card.Header>
                      <Card.Body>
                        <Card.Text className="text-xl font-semibold">
                          Aula 101
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </>
            ) : (
              <>
                <Row>
                  <Col xs={12} className="mb-4">
                    <Card className="text-center shadow-sm border-0">
                      <Card.Header className="text-lg font-bold">
                        Información Adicional
                      </Card.Header>
                      <Card.Body>
                        <Card.Text className="text-md font-medium">
                          Cantidad de alumnos en la institución:{" "}
                          {alumnos.length}
                        </Card.Text>
                        <Card.Text className="text-md font-medium">
                          Cantidad de personal en la institución:{" "}
                          {empleados.length}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <Card className="shadow-sm border-0">
                      <Card.Header className="text-lg font-bold">
                        Alumnos por Curso
                      </Card.Header>
                      <Card.Body>
                        <Bar data={getChartData()} options={chartOptions} />
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageBienvenido;

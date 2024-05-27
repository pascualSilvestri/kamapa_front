'use client'
import React, { useEffect, useState } from 'react';
import { useInstitucionSelectedContext, useRolesContext } from 'context/userContext';
import { useCicloLectivo } from 'context/CicloLectivoContext';
import { Environment } from 'utils/EnviromenManager';
import { CicloLectivo } from 'model/types';
import { useRouter } from 'next/navigation';

function PageBienvenido({ params }: { params: { id: string } }) {
  const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();
  const [rol, setRol] = useRolesContext();
  const [cicloLectivo, setCicloLectivo] = useCicloLectivo();
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Estado para manejar la carga

  useEffect(() => {
    fetchCicloLectivoActivo();
  }, []);

  const fetchCicloLectivoActivo = async () => {
    const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getCicloLectivo)}${params.id}`);

    console.log(rol);
    
    if (response.status !== 200) {
      if (rol.some(rol => rol.name == 'Director')) {
        router.push(`/dashboard/${params.id}/newciclolectivo`);
      } else {
        router.push(`/dashboard/${params.id}/panel`);
      }
      return; // Asegúrate de no continuar con la ejecución
    }
    const data: CicloLectivo = await response.json();
    setCicloLectivo(data);
    setLoading(false); // Marcar como cargado
  };

  if (loading) {
    return <div>Loading...</div>; // Mostrar un indicador de carga mientras se cargan los datos
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out" style={{ backgroundImage: "url('/path/to/background-image.jpg')" }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white bg-opacity-90 shadow-lg rounded-lg overflow-hidden transform transition duration-500 hover:scale-105">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-4">
            Bienvenido a {institucionSelected.nombre}
          </h1>
          <div className="mt-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                {cicloLectivo.nombre}
              </h2>
              <p className={`mt-1 text-lg sm:text-xl font-semibold ${cicloLectivo.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {cicloLectivo.isActive ? 'Activo' : 'Inactivo'}
              </p>
            </div>
            <div className="mt-4">
              {cicloLectivo.Periodos.map((periodo, index) => (
                <div key={index} className="mt-2 text-center">
                  <span className="text-md sm:text-lg font-medium text-gray-700">{periodo.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageBienvenido;

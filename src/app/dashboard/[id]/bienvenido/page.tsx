'use client'
import React, { useEffect } from 'react'
import { useInstitucionSelectedContext, useRolesContext } from 'context/userContext';
import { useCicloLectivo } from 'context/CicloLectivoContext';
import { Environment } from 'utils/apiHelpers';
import { CicloLectivo } from 'model/types';

function PageBienvenido({ params }: { params: { id: string } }) {
  const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();
  const [rol, setRol] = useRolesContext();
  const [cicloLectivo, setCicloLectivo] = useCicloLectivo();

  useEffect(() => {
    fetchCicloLectivoActivo();
  }, []);

  const fetchCicloLectivoActivo = async () => {
    const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getCicloLectivo)}${params.id}`);
    const data: CicloLectivo = await response.json();
    setCicloLectivo(data);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Bienvenido a {institucionSelected.nombre}</h1>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h2 className="mt-2 text-center text-2xl font-extrabold text-gray-900">{cicloLectivo.nombre}</h2>
          <h2 className="mt-2 text-center text-2xl font-extrabold text-gray-900">{cicloLectivo.isActive ? 'Activo' : 'Inactivo'}</h2>
          {cicloLectivo.Periodos.map((periodo, index) => (
            <h2 key={index} className="mt-2 text-center text-2xl font-extrabold text-gray-900">{periodo.nombre}</h2>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PageBienvenido;

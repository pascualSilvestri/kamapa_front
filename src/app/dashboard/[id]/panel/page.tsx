'use client'
import React, { useEffect } from 'react'
import { useInstitucionSelectedContext, useRolesContext } from 'context/userContext';
import { useCicloLectivo } from 'context/CicloLectivoContext';
import { Environment } from 'utils/apiHelpers';
import { CicloLectivo } from 'model/types';
import { useRouter } from 'next/navigation';
function Page({ params }: { params: { id: string } }) {
  const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();
  const [rol, setRol] = useRolesContext();
  const [cicloLectivo, setCicloLectivo] = useCicloLectivo();
  const router = useRouter();


  console.log(rol);
  

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out" style={{ backgroundImage: "url('/path/to/background-image.jpg')" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1>Panel principal</h1>
        <h3 style={{ textAlign: 'center', margin: 'auto 0' }} >No hay un ciclo lectivo Activo</h3>
      </div>
    </div>
  )
}

export default Page;

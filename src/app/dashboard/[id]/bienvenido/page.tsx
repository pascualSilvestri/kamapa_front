'use client'
import React from 'react'
import { useInstitucionSelectedContext, useRolesContext } from 'context/userContext';

function PageBienvenido() {
  const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();
  const [rol, setRol] = useRolesContext();

  return (
    <div>
        <h1>Bienvenido a {institucionSelected.nombre}</h1>
    </div>
  )
}

export default PageBienvenido;
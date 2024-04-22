'use client'
import React from 'react'
import { useInstitucionSelectedContext } from 'context/userContext';

function PageBienvenido() {
  const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();

  console.log(institucionSelected);
  return (
    <div>
        <h1>Bienvenido a {institucionSelected.nombre}</h1>
    </div>
  )
}

export default PageBienvenido;
'use client'
import React from 'react'
import { useInstitucionSelectedContext, useUserContext } from 'context/userContext';



function pageBienvenido() {

const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();

  console.log(institucionSelected);
  return (
    <div>
        <h1>Bienvenido a </h1>
    </div>
  )
}

export default pageBienvenido
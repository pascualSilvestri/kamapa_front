'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'

const Loading = () => {
  const [isLoading, setIsLoading] = useState(true)

  // Lógica para mostrar/ocultar el componente de carga después de cierto tiempo (por ejemplo, 2 segundos)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    // Limpiar el temporizador si el componente se desmonta antes de que se complete
    return () => clearTimeout(timer)
  }, []) // Se ejecutará solo una vez durante el montaje inicial

  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}
      >
        <div style={{
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        >
          <Image
            src='/Loading KAMAPA.gif'
            alt='Loading...'
            layout='responsive'
            width={100}
            height={100}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'cover'
            }}
          />
        </div>
      </div>
    )
  }

  return null // Retorna null cuando isLoading es false para no renderizar nada
}

export default Loading

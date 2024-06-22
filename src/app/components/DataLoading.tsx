'use client'
import React from 'react'
import Image from 'next/image'

interface DataLoadingProps {
    loading: boolean
}

const DataLoading: React.FC<DataLoadingProps> = ({ loading }) => {
    if (loading) {
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

    return null // Retorna null cuando loading es false para no renderizar nada
}

export default DataLoading

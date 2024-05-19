import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CicloLectivo, Periodo } from 'model/types';

// Define el contexto con un valor por defecto de undefined
const CicloLectivoContext = createContext<[CicloLectivo | null, React.Dispatch<React.SetStateAction<CicloLectivo | null>>] | undefined>(undefined);

// Define el tipo de las propiedades del provider
interface CicloLectivoProviderProps {
  children: ReactNode;
}

// Define el provider del contexto
export const CicloLectivoProvider: React.FC<CicloLectivoProviderProps> = ({ children }) => {
  const [cicloLectivo, setCicloLectivo] = useState<CicloLectivo | null>(null);

  useEffect(() => {
    // Aquí puedes hacer una llamada a una API para obtener los ciclos lectivos activos
    const fetchCicloLectivoActivo = async () => {
      // Simulando una llamada a una API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cicloLectivo`); // Reemplaza con tu llamada a API real
      const data: CicloLectivo = await response.json();
      setCicloLectivo(data);
    };

    fetchCicloLectivoActivo();
    console.log(fetchCicloLectivoActivo)
  }, []);

  return (
    <CicloLectivoContext.Provider value={[cicloLectivo, setCicloLectivo]}>
      {children}
    </CicloLectivoContext.Provider>
  );
};

// Hook para usar el contexto
export const useCicloLectivo = () => {
  const context = useContext(CicloLectivoContext);
  if (context === undefined) {
    throw new Error('useCicloLectivo debe ser usado dentro de un CicloLectivoProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CicloLectivo, Periodo } from 'model/types';

// Define el contexto con un valor por defecto de undefined
const CicloLectivoContext = createContext<[CicloLectivo | null, React.Dispatch<React.SetStateAction<CicloLectivo | null>>] | undefined>(undefined);

// Hook para usar el contexto
export const useCicloLectivo = () => useContext(CicloLectivoContext);
 

// Define el tipo de las propiedades del provider
interface CicloLectivoProviderProps {
  children: ReactNode;
}

export const CicloLectivoProvider: React.FC<CicloLectivoProviderProps> = ({ children }) => {
  const [cicloLectivo, setCicloLectivo] = useState<CicloLectivo>({

    id: 0,
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    isActive: false,
    Periodos: [],

  });


  return (
    <CicloLectivoContext.Provider value={[cicloLectivo, setCicloLectivo]}>
      {children}
    </CicloLectivoContext.Provider>
  );
};

'use client'
import React from 'react';

import {useCicloLectivo} from '../../context/CicloLectivoContext';


const DashboardLayout = ({ children }) => {
    const [cicloLectivo, setCicloLectivo] = useCicloLectivo();
  
    return (
      <main >
          {children}
      </main>
    );
  };

export default DashboardLayout;

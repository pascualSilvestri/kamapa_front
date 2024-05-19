import React from 'react';

import {useCicloLectivoContext, useCicloLectivo} from '../../model/types';




const DashboardLayout = ({ children }) => {


  return (
   
      <>
        
        <main>{children}</main>
      </>
     
  );
};

export default DashboardLayout;

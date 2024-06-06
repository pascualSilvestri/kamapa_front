'use client'
import React from 'react';
import Images from 'next/image';



const DashboardLayout = ({ children }) => {

    return (
      <main >
         <Images
                src="/fondoApp.webp"
                alt="Background"
                layout="fill"
                objectFit="cover"
                style={{
                    zIndex: -3,
                    opacity: 0.2
                }}
            />
          {children}
      </main>
    );
  };

export default DashboardLayout;

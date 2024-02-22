import React, { createContext, useContext, useState } from 'react';
import { User } from '../model/types';

// Crear el contexto para el usuario
const UserContext = createContext<any>(null);

// Crear el hook personalizado para acceder al contexto del usuario
export const useUserContext = () => useContext(UserContext);

// Componente proveedor del contexto del usuario
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    // Función para actualizar el usuario
    const updateUser = (newUser: User) => {
        setUser(newUser);
    };

    return (
        <UserContext.Provider value={[user, setUser]}>
            {children}
        </UserContext.Provider>
    );
};
import React, { createContext, useContext, useState } from 'react';

// Definir el tipo de dato para el usuario
type User = {
    name: string;
    email: string;
};

// Crear el contexto para el usuario
const UserContext = createContext<User | null>(null);

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
        <UserContext.Provider value={user}>
                {children}
        </UserContext.Provider>
    );
};
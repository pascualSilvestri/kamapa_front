import React, { createContext, useContext, useState } from 'react';

import { Institucion, Roles, User } from 'model/types';

// Crear el contexto para el usuario
// Crear el contexto para el usuario
const UserContext = createContext<[User, React.Dispatch<React.SetStateAction<User>>] | undefined>(undefined);
const InstitucionSelectedContext = createContext<[Institucion, React.Dispatch<React.SetStateAction<Institucion>>] | undefined>(undefined);
const RolesContext = createContext<[Roles[], React.Dispatch<React.SetStateAction<Roles[]>>] | undefined>(undefined);

// Crear el hook personalizado para acceder al contexto del usuario
export const useUserContext = () => useContext(UserContext);
export const useInstitucionSelectedContext = () => useContext(InstitucionSelectedContext);
export const useRolesContext = () => useContext(RolesContext);

// Componente proveedor del contexto del usuario
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User>({
        id:'',
        nombre: '',
        apellido: '',
        legajo: '',
        telefono: '',
        Roles: [],
        Instituciones: []
    });
    const [institucionSelected, setInstitucionSelected] = useState<Institucion>({
        id: 0,
        cue: '',
        nombre: '',
        logo: '',
        email: '',
        contacto: '',
    });
    const [rol, setRol] = useState<Roles[]>([]);

    // Función para actualizar el usuario
    const updateUser = (newUser: User) => {
        setUser(newUser);
    };

    return (
        <UserContext.Provider value={[user, setUser]}>
            <InstitucionSelectedContext.Provider value={[institucionSelected, setInstitucionSelected]}>
                <RolesContext.Provider value={[rol, setRol]}>
                    {children}
                </RolesContext.Provider>
            </InstitucionSelectedContext.Provider>
        </UserContext.Provider>
    );
};
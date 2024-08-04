import React, { createContext, useContext, useState } from 'react';
import { Institucion, Roles, User } from 'model/types';

// Crear el contexto para el usuario
const UserContext = createContext<[User, React.Dispatch<React.SetStateAction<User>>] | null>(null);
const InstitucionSelectedContext = createContext<[Institucion, React.Dispatch<React.SetStateAction<Institucion>>] | null>(null);
const RolesContext = createContext<[Roles[], React.Dispatch<React.SetStateAction<Roles[]>>] | null>(null);

// Crear el hook personalizado para acceder al contexto del usuario
export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserContext debe ser usado dentro de un UserProvider');
    }
    return context;
};

export const useInstitucionSelectedContext = () => {
    const context = useContext(InstitucionSelectedContext);
    if (!context) {
        throw new Error('useInstitucionSelectedContext debe ser usado dentro de un InstitucionSelectedProvider');
    }
    return context;
};

export const useRolesContext = () => {
    const context = useContext(RolesContext);
    if (!context) {
        throw new Error('useRolesContext debe ser usado dentro de un RolesProvider');
    }
    return context;
};

// Componente proveedor del contexto del usuario
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User>({
        id: '',
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

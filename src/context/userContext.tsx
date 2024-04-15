import React, { createContext, useContext, useState } from 'react';
import { User } from '../model/types';
import { Institucion } from 'model/types';

// Crear el contexto para el usuario
// Crear el contexto para el usuario
const UserContext = createContext<[User, React.Dispatch<React.SetStateAction<User>>] | undefined>(undefined);
const InstitucionSelectedContext = createContext<[Institucion, React.Dispatch<React.SetStateAction<Institucion>>] | undefined>(undefined);

// Crear el hook personalizado para acceder al contexto del usuario
export const useUserContext = () => useContext(UserContext);
export const useInstitucionSelectedContext = () => useContext(InstitucionSelectedContext);

// Componente proveedor del contexto del usuario
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const  [user, setUser] = useState<User>({
		nombre: '',
		apellido: '',
		legajo: '',
		telefono: '',
		Roles: [],
		Instituciones:[]
	});
    const [institucionSelected, setInstitucionSelected] = useState<Institucion>({
        id: 0,
        cue: '',
        nombre: '',
        logo: '',
        email: '',
        contacto: '',
    });

    // Función para actualizar el usuario
    const updateUser = (newUser: User) => {
        setUser(newUser);
    };

    return (
        <UserContext.Provider value={[user, setUser]}>
            <InstitucionSelectedContext.Provider value={[institucionSelected, setInstitucionSelected]}>
            {children}
            </InstitucionSelectedContext.Provider>
        </UserContext.Provider>
    );
};
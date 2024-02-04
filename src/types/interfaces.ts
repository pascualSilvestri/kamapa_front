export interface User {
    id: number;
    nombre?: string;
    apellido?: string;
    dni?: string;
    email?: string;
    password: string;
    rol: string;
    accessToken?: string;
    // Puedes agregar más propiedades según las necesidades de tu aplicación
  }
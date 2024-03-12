import { Nav, Navbar, NavDropdown, Container, Offcanvas } from 'react-bootstrap';
import Link from 'next/link';
import Image from 'next/image';
import ButtonAuth from './ButtonAuth';
import React from 'react';

import { useRouter } from 'next/navigation'; // Import corregido
import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';

export function Navigation() {
  const { data: session } = useSession();
  const router = useRouter();
  const [user, setUser] = useState({
    nombre: '',
    apellido: '',
    legajo: '',
    telefono: '',
    Roles: []
  });

  console.log(session)
  useEffect(() => {
    if (!session) {
      router.push('/login');
    } else {
      setUser({
        nombre: session.user.nombre,
        apellido: session.user.apellido,
        legajo: session.user.legajo,
        telefono: session.user.telefono,
        Roles: session.user.Roles,
      });
    }
  }, [router, session]);

  console.log(router)
  
  // Definir las rutas según el rol del usuario
  const routes = useMemo(() => ({
    admin: [
      { label: 'Inicio', href: '/dashboard' },
      { label: 'Dirección', href: '/director' },
      { label: 'Preceptores', href: '/preceptor' },
      { label: 'Profesores', href: '/profesores' },
      { label: 'Alumnos', href: '/alumnos' },
      { label: 'Aulas', href: '/aulas' },
      { label: 'About', href: '/about' },
      {
        label: 'Registros', items: [
          { label: 'Institución', href: '/reginstitucion' },
          { label: 'Aulas', href: '/regaulas' },
          { label: 'Alumnos', href: '/regalumnos' },
          { label: 'Personal', href: '/regempleado' },
          { label: 'Asignación de Permisos', href: '/permisos' }
        ]
      }
    ],
    director: [
      { label: 'Inicio', href: '/dashboard' },
      { label: 'Dirección', href: '/director' },
      { label: 'Secretario', href: '/secretario' },
      { label: 'Preceptores', href: '/preceptor' },
      { label: 'Profesores', href: '/profesores' },
      { label: 'Alumnos', href: '/alumnos' },
      { label: 'Aulas', href: '/aulas' },
      { label: 'About', href: '/about' },
      {
        label: 'Registros', items: [
          { label: 'Alumnos', href: '/regalumnos' },
          { label: 'Personal', href: '/regempleado' },
          { label: 'Asignación de Permisos', href: '/permisos' }
        ]
      }
    ],
    // Otras definiciones de rutas
  }), []);

  const [userRoutes, setUserRoutes] = useState([]);

  useEffect(() => {
    if (user.Roles && user.Roles.length > 0) {
      const rol = user.Roles[0].name; // Obtener el primer rol del usuario
      const userRoutes = routes[rol] || [];
      setUserRoutes(userRoutes);
    }
  }, [user, routes]);
  console.log(user);
  console.log(routes);

  return (
    <header data-bs-theme='dark'>
      {['xxxl'].map((expand) => (
        <Navbar
          key={expand} expand={expand} className='bg-body-tertiary mb-3'
        >
          <Container fluid>
            <Navbar.Brand href='#'>
              {/* Logo de KAMAPA */}
              <Image
                src='/Logo.png'
                alt='logo'
                width={50}
                height={50}
                className='d-inline-block align-top'
                style={{
                  borderRadius: '50%'
                }}
              />
              <h2 className='float-end m-lg-2'>KAMAPA</h2>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} />
            <Navbar.Offcanvas
              data-bs-theme='dark'
              id={`offcanvasNavbar-expand-${expand}`}
              aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
              placement='end'
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
                  Esc. Sec. José Rudecindo Rojo
                </Offcanvas.Title>
              </Offcanvas.Header>
              <hr />
              <Offcanvas.Header className='justify-content-center'>
                {/* Logo de la Escuela, traer Link de la BD luego */}
                <Image
                  src='/LogoJRR.png'
                  alt='logo'
                  width={100}
                  height={100}
                  className='justify-content-center'
                  style={{ marginBottom: '10px' }}
                />
              </Offcanvas.Header>
              <Offcanvas.Body>
              <Nav className='justify-content-end flex-grow-1 pe-3'>
              {userRoutes && userRoutes.map((route, index) => (
                route.items ? (
                    <div key={index}>
                        <Link href="#">
                            <a className='nav-link'>{route.label}</a>
                        </Link>
                        <div className="dropdown-menu">
                            {route.items.map((item, idx) => (
                                <Link href={item.href} key={idx}>
                                    <a className='dropdown-item'>{item.label}</a>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    <Link href={route.href} key={index}>
                        <a className='nav-link'>{route.label}</a>
                    </Link>
                )
            ))}
                </Nav>
                <hr />
                {/* <Form className='d-flex'>
                  <Form.Control
                    type='search'
                    placeholder='Search'
                    className='me-2'
                    aria-label='Search'
                  /> */}

                <ButtonAuth />
                {/* </Form> */}
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
        </Navbar>
      ))}
    </header>
  );
}
'use client'
import { Nav, Navbar, NavDropdown, Container, Offcanvas } from 'react-bootstrap';
import Link from 'next/link';
import Image from 'next/image';
import ButtonAuth from './ButtonAuth';
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getRolesRouters } from '../../utils/router';
import { useInstitucionSelectedContext, useRolesContext, useUserContext } from 'context/userContext';
import { formatNombre } from '../../utils/formatNombre';

export function Navigation() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rol, setRol] = useRolesContext();
  const [userRoutes, setUserRoutes] = useState([]);
  const [user, setUser] = useUserContext();
  const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  useEffect(() => {
    setUserRoutes(getRolesRouters(rol));
  }, [rol]);

  const dropdownRoutes = useMemo(() => {
    const dropdowns: Record<string, any[]> = {};
    userRoutes.forEach(route => {
      if (route.dropdown) {
        if (!dropdowns[route.dropdown]) {
          dropdowns[route.dropdown] = [];
        }
        dropdowns[route.dropdown].push(route);
      }
    });
    return dropdowns;
  }, [userRoutes]);

  const handleLinkClick = () => {
    setShowOffcanvas(false);
  };

  const inicioRoute = userRoutes.find(route => route.href === '/bienvenido');
  const otherRoutes = userRoutes.filter(route => route.href !== '/bienvenido');

  return (
    <header data-bs-theme='dark'>
      {['xxxl'].map((expand) => (
        <Navbar key={expand} expand={expand} className='bg-body-tertiary mb-3'>
          <Container className='d-flex justify-content-between'>
            <Navbar.Brand href='' className='d-flex align-items-end'>
              <Image
                src={institucionSelected.logo || '/Logo.png'}
                alt='logo'
                width={50}
                height={50}
                className='d-inline-block align-top'
                style={{ borderRadius: '50%' }}
              />
              <h2 className='ms-2 mb-0'>{institucionSelected.nombre ? formatNombre(institucionSelected.nombre) : ''}</h2>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} onClick={() => setShowOffcanvas(!showOffcanvas)} />
            <Navbar.Offcanvas
              data-bs-theme='dark'
              id={`offcanvasNavbar-expand-${expand}`}
              aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
              placement='end'
              show={showOffcanvas}
              onHide={() => setShowOffcanvas(false)}
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
                  {institucionSelected.nombre}
                </Offcanvas.Title>
              </Offcanvas.Header>
              <hr />
              <Offcanvas.Header className='justify-content-center'>
                <Image
                  src={institucionSelected.logo || '/Logo.png'}
                  alt='logo'
                  width={100}
                  height={100}
                  className='justify-content-center'
                  style={{ marginBottom: '10px' }}
                />
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className='justify-content-center flex-grow-1 pe-3'>
                  <Link href='/dashboard' className='nav-link btn  m-2'
                    style={{
                      color: 'white',
                      transition: 'background-color 0.2s, color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'purple';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'white';
                    }} onClick={handleLinkClick}>
                    Seleccionar Escuela
                  </Link>
                  {inicioRoute && (
                    <Link
                      href={inicioRoute.href.includes("Admin") ? `/dashboard/${inicioRoute.href}` : `/dashboard/${institucionSelected.id}/${inicioRoute.href}`}
                      className='nav-link btn m-2'
                      style={{
                        color: 'white',
                        transition: 'background-color 0.2s, color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'purple';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'white';
                      }}
                      onClick={handleLinkClick}
                    >
                      {inicioRoute.label}
                    </Link>
                  )}
                  {Object.entries(dropdownRoutes).map(([dropdown, routes], index) => (
                    <NavDropdown
                      key={index}
                      title={dropdown}
                      className='nav-link btn m-2'
                      style={{
                        color: 'white',
                        transition: 'background-color 0.2s, color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'purple';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'white';
                      }}
                    >
                      {routes.map((route, subIndex) => (
                        <NavDropdown.Item
                          key={subIndex}
                          as={Link}
                          href={route.href.includes("Admin") ? `/dashboard/${route.href}` : `/dashboard/${institucionSelected.id}/${route.href}`}
                          className='nav-link'
                          onClick={handleLinkClick}
                        >
                          {route.label}
                        </NavDropdown.Item>
                      ))}
                    </NavDropdown>
                  ))}
                  {otherRoutes.filter(route => !route.dropdown).map((route, index) => (
                    <Link
                      key={index}
                      href={route.href.includes("Admin") ? `/dashboard/${route.href}` : `/dashboard/${institucionSelected.id}/${route.href}`}
                      className='nav-link btn m-2'
                      style={{
                        color: 'white',
                        transition: 'background-color 0.2s, color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'purple';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'white';
                      }}
                      onClick={handleLinkClick}
                    >
                      {route.label}
                    </Link>
                  ))}
                </Nav>
                <hr />
                <div className='d-flex justify-content-center'>
                  <ButtonAuth />
                </div>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
        </Navbar>
      ))}
    </header>
  );
}

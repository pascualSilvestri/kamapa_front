
import { Nav, Navbar, NavDropdown, Container, Offcanvas } from 'react-bootstrap'
import Link from 'next/link'
import Image from 'next/image'
import ButtonAuth from './ButtonAuth'

export function Navigation () {
  return (
    <header data-bs-theme='dark'>
      {['xxl'].map((expand) => (
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
                  {/* Aquí van los Link, y se enrrutan de la siguiente manera */}
                  <Nav>
                    <Link className='nav-link' href='/dashboard'>
                      Inicio
                    </Link>
                  </Nav>
                  <Nav>
                    <Link className='nav-link' href='/alumnos'>
                      Alumnos
                    </Link>
                  </Nav>
                  <Nav>
                    <Link className='nav-link' href='/profesores'>
                      Profesores
                    </Link>
                  </Nav>
                  <Nav>
                    <Link className='nav-link' href='/aulas'>
                      Aulas
                    </Link>
                  </Nav>
                  <Nav>
                    <Link className='nav-link' href='/about'>
                      About
                    </Link>
                  </Nav>
                  <NavDropdown title='Registros' id={`offcanvasNavbarDropdown-expand-${expand}`}>
                    <NavDropdown.Item href='/form_alumnos'>Alumnos</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href='/form_personal'>Personal</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href='/form_roles'>Asignación de Permisos</NavDropdown.Item>
                  </NavDropdown>
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
  )
}

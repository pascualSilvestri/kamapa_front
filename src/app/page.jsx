'use client';
import { ThemeProvider } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import Carousel from 'react-bootstrap/Carousel';
import Button from 'react-bootstrap/Button';
import Image from 'next/image';
import Link from 'next/link';
import Bienvenida2 from '../../public/bienvenida2.png';
function DarkVariantExample() {
	return (
		<ThemeProvider>
			<div
				style={{
					position: 'relative', // Agrega posición relativa
					width: '100vw',
					height: '100vh',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
				}}>
				{/* Mueve la imagen a un div con posición absoluta */}
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						zIndex: -3,
					}}>
					<Image
						src='/backLogin.jpg'
						alt='Background'
						layout='fill'
						objectFit='cover'
					/>
				</div>
				<Carousel
					data-bs-theme='dark'
					style={{
						backgroundColor: 'transparent',
						width: '50vw',
						height: '50vh',
						zIndex: -1, // Ajusta la propiedad zIndex
					}}>
					<Carousel.Item>
						<Image
							src={Bienvenida2}
							className='d-block w-100'
							alt='Third slide'
						/>
					</Carousel.Item>
					<Carousel.Item>
						<Image
							src={Bienvenida2}
							className='d-block w-100'
							alt='Third slide'
						/>
					</Carousel.Item>
					<Carousel.Item>
						<Image
							src={Bienvenida2}
							className='d-block w-100'
							alt='Third slide'
						/>
					</Carousel.Item>
				</Carousel>

				{/* Botón */}
				<Link href='/login'>
					<Button
						top='10px'
						variant='flat'
						style={{
							backgroundColor: 'purple',
							color: 'white',
							padding: '0.4rem 1rem',
							fontSize: '1rem',
							transition: 'all 0.3s ease',
							zIndex: 2, // Ajusta la propiedad zIndex
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = 'white';
							e.currentTarget.style.color = 'black';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = 'purple';
							e.currentTarget.style.color = 'white';
						}}>
						Comenzar
					</Button>
				</Link>
			</div>
		</ThemeProvider>
	);
}

export default DarkVariantExample;

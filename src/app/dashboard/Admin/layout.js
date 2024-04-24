'use client';
import React, { Suspense, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loading from '../../components/Loading';
import { NavigationAdmin } from 'app/components/NavigationAdmin';

export default function RootLayout({ children }) {


	return (
		<>
			<Suspense fallback={<Loading />}>
				<NavigationAdmin/>
				{children}
			</Suspense>
		</>
	);
}

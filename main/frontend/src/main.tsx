import './style.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Order from './pages/Order'
import Profile from './pages/Profile'
import Account from './pages/Account'
import ApiTest from './pages/ApiTest'
import NotificationProvider from './components/NotificationProvider'
import { CartProvider } from './lib/CartContext'

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{ index: true, element: <Home /> },
			{ path: 'catalog', element: <Catalog /> },
			{ path: 'product/:slug', element: <Product /> },
			{ path: 'cart', element: <Cart /> },
			{ path: 'checkout', element: <Checkout /> },
            { path: 'order/:id', element: <Order /> },
			{ path: 'profile', element: <Profile /> },
            // notifications and settings now under /account tabs
            { path: 'account', element: <Account /> },
			{ path: 'api-test', element: <ApiTest /> },
		]
	}
])

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<NotificationProvider>
			<CartProvider>
				<RouterProvider router={router} />
			</CartProvider>
		</NotificationProvider>
	</React.StrictMode>
)

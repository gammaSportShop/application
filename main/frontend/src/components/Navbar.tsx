import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, Menu, Bell, Settings, LogOut, UserCircle } from 'lucide-react'
import { useCart } from '../lib/CartContext'

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [cartPulse, setCartPulse] = useState(false)
    const navigate = useNavigate()
    const dropdownRef = useRef<HTMLDivElement>(null)
    const { totalProducts } = useCart()

    useEffect(() => {
        const compute = () => setIsLoggedIn(!!localStorage.getItem('auth_token'))
        compute()
        const onAuth = () => compute()
        const onStorage = (e: StorageEvent) => {
            if (e.key === 'auth_token') compute()
        }
        window.addEventListener('auth:login', onAuth as EventListener)
        window.addEventListener('auth:logout', onAuth as EventListener)
        window.addEventListener('storage', onStorage)
        return () => {
            window.removeEventListener('auth:login', onAuth as EventListener)
            window.removeEventListener('auth:logout', onAuth as EventListener)
            window.removeEventListener('storage', onStorage)
        }
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    useEffect(() => {
        const handler = () => {
            setCartPulse(true)
            setTimeout(() => setCartPulse(false), 900)
        }
        window.addEventListener('cart:item-added', handler as EventListener)
        return () => window.removeEventListener('cart:item-added', handler as EventListener)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('auth_token')
        setIsLoggedIn(false)
        setIsDropdownOpen(false)
        try { window.dispatchEvent(new Event('auth:logout')) } catch {}
        navigate('/')
    }

    return (
        <header className="glass-surface sticky top-0 z-20">
            <div className="site-container flex items-center justify-between py-3">
                <div className="flex items-center gap-4">
                    <button className="btn btn-ghost p-2">
                        <Menu size={20} />
                    </button>
                    <Link to="/" className="text-xl font-semibold tracking-tight"><span className="text-green-500">g</span>amma<span className="text-primary">S</span>port</Link>
                </div>
                <nav className="flex items-center gap-2">
                    <Link className="btn btn-ghost" to="/catalog">
                        <Search size={16} className="mr-2" />
                        <span className="hidden sm:inline">КАТАЛОГ</span>
                    </Link>
                    <Link className={`btn btn-ghost overflow-visible relative ${cartPulse ? 'cart-pulse' : ''}`} to="/cart">
                        <ShoppingCart size={16} className="mr-2" />
                        <span className="hidden sm:inline">КОРЗИНА</span>
                        {totalProducts > 0 && (
                            <span className="cart-badge">{totalProducts}</span>
                        )}
                    </Link>
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="btn btn-primary">
                            <User size={16} className="mr-2" />
                            <span className="hidden sm:inline">АККАУНТ</span>
                        </button>
                        {isDropdownOpen && (
                            <ul className="absolute right-0 mt-2 p-2 shadow menu rounded-box w-56 glass-surface border">
                                {isLoggedIn ? (
                                    <>
                                        <li><Link to="/account" onClick={() => setIsDropdownOpen(false)}><UserCircle size={16} className="mr-2" />Дашборд</Link></li>
                                        <li><Link to="/account?tab=notifications" onClick={() => setIsDropdownOpen(false)}><Bell size={16} className="mr-2" />Уведомления</Link></li>
                                        <li><Link to="/account?tab=settings" onClick={() => setIsDropdownOpen(false)}><Settings size={16} className="mr-2" />Настройки</Link></li>
                                        <div className="divider my-1" />
                                        <li><button onClick={handleLogout}><LogOut size={16} className="mr-2" />Выйти</button></li>
                                    </>
                                ) : (
                                    <>
                                        <li><Link to="/profile" onClick={() => setIsDropdownOpen(false)}><UserCircle size={16} className="mr-2" />Войти / Регистрация</Link></li>
                                    </>
                                )}
                            </ul>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    )
}



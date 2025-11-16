import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import DotField from '../components/DotField'
import { useNotify } from '../components/NotificationProvider'

export default function ProfilePage() {
	const [tab, setTab] = useState<'login'|'register'>('login')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [name, setName] = useState('')
	const [message, setMessage] = useState('')
	const [showPassword, setShowPassword] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const navigate = useNavigate()
    const notify = useNotify()

    const emailValid = /.+@.+\..+/.test(email)
    const passwordValid = password.length >= 6
    const nameValid = tab === 'register' ? name.trim().length >= 2 : true
    const formValid = emailValid && passwordValid && nameValid

    function translateAuthError(code: string, mode: 'login'|'register'): string {
        if (!code) return mode === 'login' ? 'Ошибка входа' : 'Ошибка регистрации'
        const map: Record<string, string> = {
            invalid_input: 'Некорректные данные',
            invalid_credentials: 'Неверный email или пароль',
            email_taken: 'Email уже используется'
        }
        return map[code] || (mode === 'login' ? 'Ошибка входа' : 'Ошибка регистрации')
    }

    useEffect(() => {
        try {
            const token = localStorage.getItem('auth_token')
            if (token) {
                const redirect = localStorage.getItem('post_login_redirect') || '/catalog'
                localStorage.removeItem('post_login_redirect')
                navigate(redirect)
            }
        } catch {}
    }, [])

    async function submitLogin() {
		setMessage('')
        setSubmitting(true)
        try {
            const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }), credentials: 'include' })
            const data = await res.json()
            if (!res.ok) { const msg = translateAuthError(data.error, 'login'); setMessage(msg); notify.error(msg); return }
            try { localStorage.setItem('auth_token', data.token); window.dispatchEvent(new Event('auth:login')) } catch {}
            const redirect = localStorage.getItem('post_login_redirect') || '/catalog'
            localStorage.removeItem('post_login_redirect')
            notify.success('Вы успешно вошли')
            navigate(redirect)
        } finally {
            setSubmitting(false)
        }
	}

    async function submitRegister() {
		setMessage('')
        setSubmitting(true)
        try {
            const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }), credentials: 'include' })
            const data = await res.json()
            if (!res.ok) { const msg = translateAuthError(data.error, 'register'); setMessage(msg); notify.error(msg); return }
            try { localStorage.setItem('auth_token', data.token); window.dispatchEvent(new Event('auth:login')) } catch {}
            const redirect = localStorage.getItem('post_login_redirect') || '/catalog'
            localStorage.removeItem('post_login_redirect')
            notify.success('Аккаунт создан и вход выполнен')
            navigate(redirect)
        } finally {
            setSubmitting(false)
        }
	}

    return (
        <div className="login-main px-4">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 items-stretch">
                <div className="flex items-center justify-center p-8 bg-bg-alt rounded-box">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold mb-2"><span className="text-green-500">g</span>amma<span className="text-primary">S</span>port</h1>
                        </div>
                        <div className="card-panel p-8">
                            <div className="flex flex-col gap-4 mb-6" data-enter>
                                <h2 className="text-2xl font-bold uppercase tracking-wide">
                                    {tab === 'login' ? 'ВХОД В АККАУНТ' : 'СОЗДАЙТЕ АККАУНТ'}
                                </h2>
                                <p className="text-sm opacity-70 leading-relaxed">
                                    {tab === 'login' 
                                        ? 'Войдите в свой аккаунт чтобы участвовать в соревнованиях и получать результаты.'
                                        : 'Создайте аккаунт чтобы участвовать в соревнованиях, получать призы, и что то еще.'
                                    }
                                </p>
                                <div role="tablist" className="tabs tabs-boxed">
                                    <button role="tab" className={`tab ${tab==='login'?'tab-active':''}`} onClick={()=>setTab('login')}>ВХОД</button>
                                    <button role="tab" className={`tab ${tab==='register'?'tab-active':''}`} onClick={()=>setTab('register')}>РЕГИСТРАЦИЯ</button>
                                </div>
                            </div>
                            {tab === 'login' ? (
                                <form className="space-y-5" onSubmit={(e)=>{e.preventDefault(); submitLogin()}} data-enter aria-busy={submitting}>
                                    <label className="form-control block">
                                        <div className="label"><span className="label-text uppercase">Email</span></div>
                                        <input className={`input-text w-full ${email && !emailValid ? 'border-negative' : ''}`} type="email" placeholder="email@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} required autoComplete="email" autoFocus />
                                        {!emailValid && email.length > 0 && <div className="text-caption text-negative mt-1">Введите корректный email</div>}
                                    </label>
                                    <label className="form-control block">
                                        <div className="label"><span className="label-text uppercase">Пароль</span></div>
                                        <div className="relative">
                                            <input 
                                                className={`input-text w-full pr-10 ${password && !passwordValid ? 'border-negative' : ''}`} 
                                                type={showPassword ? "text" : "password"} 
                                                placeholder="Введите пароль (мин. 6)" 
                                                value={password} 
                                                onChange={(e)=>setPassword(e.target.value)} 
                                                required 
                                                autoComplete="current-password"
                                            />
                                            <button 
                                                type="button"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {!passwordValid && password.length > 0 && <div className="text-caption text-negative mt-1">Минимум 6 символов</div>}
                                    </label>
                                    <button className="btn btn-primary w-full uppercase disabled:opacity-60 mt-3" type="submit" disabled={submitting || !formValid}>
                                        {tab === 'login' ? 'ВОЙТИ' : 'СОЗДАТЬ АККАУНТ'}
                                    </button>
                                </form>
                            ) : (
                                <form className="space-y-5" onSubmit={(e)=>{e.preventDefault(); submitRegister()}} data-enter aria-busy={submitting}>
                                    <label className="form-control block">
                                        <div className="label"><span className="label-text uppercase">Имя</span></div>
                                        <input className={`input-text w-full ${name && !nameValid ? 'border-negative' : ''}`} placeholder="Ваше имя" value={name} onChange={(e)=>setName(e.target.value)} autoComplete="name" />
                                        {!nameValid && name.length > 0 && <div className="text-caption text-negative mt-1">Минимум 2 символа</div>}
                                    </label>
                                    <label className="form-control block">
                                        <div className="label"><span className="label-text uppercase">Email</span></div>
                                        <input className={`input-text w-full ${email && !emailValid ? 'border-negative' : ''}`} type="email" placeholder="email@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} required autoComplete="email" />
                                        {!emailValid && email.length > 0 && <div className="text-caption text-negative mt-1">Введите корректный email</div>}
                                    </label>
                                    <label className="form-control block">
                                        <div className="label"><span className="label-text uppercase">Пароль</span></div>
                                        <div className="relative">
                                            <input 
                                                className={`input-text w-full pr-10 ${password && !passwordValid ? 'border-negative' : ''}`} 
                                                type={showPassword ? "text" : "password"} 
                                                placeholder="Введите пароль (мин. 6)" 
                                                value={password} 
                                                onChange={(e)=>setPassword(e.target.value)} 
                                                required 
                                                autoComplete="new-password"
                                            />
                                            <button 
                                                type="button"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {!passwordValid && password.length > 0 && <div className="text-caption text-negative mt-1">Минимум 6 символов</div>}
                                    </label>
                                    <button className="btn btn-primary w-full uppercase disabled:opacity-60 mt-3" type="submit" disabled={submitting || !formValid}>СОЗДАТЬ АККАУНТ</button>
                                </form>
                            )}
                            <div className="mt-6 space-y-4" data-enter>
                                <div className="flex justify-between text-sm">
                                    <button className="text-primary hover:underline" type="button">Забыли пароль?</button>
                                    <button className="text-primary hover:underline" type="button" onClick={() => setTab(tab==='login'?'register':'login')}>
                                        {tab === 'login' ? 'Нет аккаунта? Создайте' : 'Есть аккаунт? Вход'}
                                    </button>
                                </div>
                            </div>
                            {message && <div className="alert mt-4" data-enter><span>{message}</span></div>}
                        </div>
                    </div>
                </div>
                <div className="hidden lg:block relative bg-bg-alt rounded-box ml-4">
                    <DotField className="absolute inset-0 opacity-20 pointer-events-none" />
                    <div className="relative z-10 flex items-center justify-center h-full">
                        <div className="text-center text-white">
                            <div className="text-6xl font-bold mb-4"><span className="text-green-500">g</span>amma<span className="text-primary">S</span>port</div>
                            <p className="text-lg opacity-70">Вдохновляющий фон без конфликтов по цвету</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}



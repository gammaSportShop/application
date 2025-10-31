import TransitionOutlet from './components/TransitionOutlet'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { useLocation } from 'react-router-dom'

export default function App() {
    const { pathname } = useLocation()
    const fullBleed = pathname.startsWith('/profile')
    return (
        <div className="site-root">
            <Navbar />
            <main className="site-main">
                {fullBleed ? (
                    <TransitionOutlet />
                ) : (
                    <div className="site-container content-container"><TransitionOutlet /></div>
                )}
            </main>
            <Footer />
        </div>
    )
}



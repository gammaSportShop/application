import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { routeTransition } from '../lib/motion'

export default function TransitionOutlet() {
    const ref = useRef<HTMLDivElement>(null)
    const loc = useLocation()
    useEffect(() => { if (ref.current) routeTransition(ref.current) }, [loc])
    return <div ref={ref}><Outlet /></div>
}



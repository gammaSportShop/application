import { gsap } from 'gsap'

export function reduceMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function enterStagger(container: HTMLElement) {
    if (reduceMotion()) return
    const items = Array.from(container.querySelectorAll('[data-enter]')) as HTMLElement[]
    gsap.fromTo(items, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out' })
}

export function hoverLift(el: HTMLElement) {
    if (!el) return
    const onEnter = () => gsap.to(el, { y: -4, duration: 0.2, ease: 'power2.out' })
    const onLeave = () => gsap.to(el, { y: 0, duration: 0.2, ease: 'power2.in' })
    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    return () => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
    }
}

export function routeTransition(root: HTMLElement) {
    if (reduceMotion()) return
    gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power1.out' })
}



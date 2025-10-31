export default function Settings() {
    return (
        <div className="min-h-[50vh] card-panel p-6">
            <h1 className="text-2xl font-bold uppercase tracking-wide mb-4">Настройки</h1>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="opacity-80">Тема</span>
                    <button className="btn btn-ghost" onClick={() => {
                        const root = document.documentElement
                        const current = root.getAttribute('data-theme') || 'dark'
                        const next = current === 'dark' ? 'shop' : 'dark'
                        root.setAttribute('data-theme', next)
                        try { localStorage.setItem('theme', next) } catch {}
                    }}>Переключить тему</button>
                </div>
            </div>
        </div>
    )
}



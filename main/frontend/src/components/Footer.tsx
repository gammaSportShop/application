import { Instagram, Twitter, Facebook } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="mt-16 border-t border-border bg-bg-alt/20" style={{ borderColor: 'rgb(var(--c-border))' }}>
            <div className="site-container py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="text-2xl font-bold"><span className="text-green-500">g</span>amma<span className="text-primary">S</span>port</div>
                        </div>
                        <p className="text-sm opacity-70 mb-6 max-w-md">
                            Профессиональная спортивная экипировка и одежда для спортсменов всех уровней. 
                            Качество, стиль и инновации в каждом продукте.
                        </p>
                        <div className="flex gap-4">
                            <button className="btn btn-ghost btn-sm p-2">
                                <Instagram size={16} />
                            </button>
                            <button className="btn btn-ghost btn-sm p-2">
                                <Twitter size={16} />
                            </button>
                            <button className="btn btn-ghost btn-sm p-2">
                                <Facebook size={16} />
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold uppercase tracking-wide mb-4">КАТАЛОГ</h4>
                        <ul className="space-y-2 text-sm opacity-70">
                            <li><a href="/catalog" className="hover:text-primary transition">SNEAKERS</a></li>
                            <li><a href="/catalog" className="hover:text-primary transition">RUNNING</a></li>
                            <li><a href="/catalog" className="hover:text-primary transition">BASKETBALL</a></li>
                            <li><a href="/catalog" className="hover:text-primary transition">TRAINING</a></li>
                            <li><a href="/catalog" className="hover:text-primary transition">LIFESTYLE</a></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold uppercase tracking-wide mb-4">ПОДДЕРЖКА</h4>
                        <ul className="space-y-2 text-sm opacity-70">
                            <li><a href="#" className="hover:text-primary transition">ПОМОЩЬ</a></li>
                            <li><a href="#" className="hover:text-primary transition">ДОСТАВКА</a></li>
                            <li><a href="#" className="hover:text-primary transition">ВОЗВРАТ</a></li>
                            <li><a href="#" className="hover:text-primary transition">РАЗМЕРЫ</a></li>
                            <li><a href="#" className="hover:text-primary transition">FAQ</a></li>
                        </ul>
                    </div>
                </div>
                
                <div className="border-t border-border mt-8 pt-8" style={{ borderColor: 'rgb(var(--c-border))' }}>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-sm opacity-60">
                            © 2025 gammaSport. Все права защищены.
                        </div>
                        <div className="flex gap-6 text-sm opacity-60">
                            <a href="#" className="hover:text-primary transition">ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ</a>
                            <a href="#" className="hover:text-primary transition">УСЛОВИЯ ИСПОЛЬЗОВАНИЯ</a>
                            <a href="#" className="hover:text-primary transition">КОНТАКТЫ</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}



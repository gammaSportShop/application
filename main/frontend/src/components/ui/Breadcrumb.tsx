import { Link } from 'react-router-dom'

type Crumb = {
  label: string
  href?: string
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="w-full mb-4">
      <ol className="flex items-center gap-2 text-sm">
        {items.map((c, idx) => {
          const last = idx === items.length - 1
          return (
            <li key={idx} className="flex items-center gap-2">
              {c.href && !last ? (
                <Link to={c.href} className="text-white/70 hover:text-white transition">
                  {c.label}
                </Link>
              ) : (
                <span className={`font-semibold ${last ? 'text-white' : 'text-white/70'}`}>{c.label}</span>
              )}
              {!last && <span className="text-white/40">›</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}



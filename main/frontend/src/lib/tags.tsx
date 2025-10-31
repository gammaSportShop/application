import { type ReactNode } from 'react'
import { ChevronsDown, ChevronDown, Sparkles, Award, Flame, TrendingUp, Shield, Crown, Clock as ClockIcon } from 'lucide-react'
import { apiGet } from './api'
import { useEffect, useMemo, useState } from 'react'

export type TagName =
  | 'СКИДКА'
  | 'СУПЕР СКИДКА'
  | 'НОВИНКА'
  | 'ПРЕМИУМ'
  | 'ХИТ'
  | 'РАСПРОДАЖА'
  | 'ОГРАНИЧЕНО'
  | 'ЭКСКЛЮЗИВ'
  | 'БЫСТРО'

type TagMeta = {
  name: TagName
  icon: ReactNode
  classes: string
}

export const TAGS_LIST: TagMeta[] = [
  { name: 'СКИДКА', icon: <ChevronDown size={12} />, classes: 'bg-red-500/20 text-red-400 border border-red-500/40' },
  { name: 'СУПЕР СКИДКА', icon: <ChevronsDown size={12} />, classes: 'bg-red-600/20 text-red-400 border border-red-600/40' },
  { name: 'НОВИНКА', icon: <Sparkles size={12} />, classes: 'bg-green-500/20 text-green-400 border border-green-500/40' },
  { name: 'ПРЕМИУМ', icon: <Award size={12} />, classes: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' },
  { name: 'ХИТ', icon: <Flame size={12} />, classes: 'bg-orange-500/20 text-orange-400 border border-orange-500/40' },
  { name: 'РАСПРОДАЖА', icon: <TrendingUp size={12} />, classes: 'bg-purple-500/20 text-purple-400 border border-purple-500/40' },
  { name: 'ОГРАНИЧЕНО', icon: <Shield size={12} />, classes: 'bg-pink-500/20 text-pink-400 border border-pink-500/40' },
  { name: 'ЭКСКЛЮЗИВ', icon: <Crown size={12} />, classes: 'bg-blue-500/20 text-blue-400 border border-blue-500/40' },
  { name: 'БЫСТРО', icon: <ClockIcon size={12} />, classes: 'bg-green-500/20 text-green-400 border border-green-500/40' }
]

const TAGS_BY_NAME: Record<string, TagMeta> = Object.fromEntries(
  TAGS_LIST.map(t => [t.name, t])
)

export function getTagIcon(name: string): ReactNode | null {
  return TAGS_BY_NAME[name]?.icon || null
}

export function getTagClasses(name: string): string {
  return TAGS_BY_NAME[name]?.classes || 'bg-primary/20 text-primary border border-primary/40'
}

export function getAllTagNames(): string[] {
  return TAGS_LIST.map(t => t.name)
}

export function useMetaTagMap() {
  const [tags, setTags] = useState<{ name: string; icon: string; classes: string }[]>([])
  useEffect(() => {
    apiGet<any>(`/catalog/meta`).then((r) => {
      const m = r?.meta || r
      const list = m?.filtersDetailed?.tagsDetailed
      if (Array.isArray(list)) setTags(list)
    }).catch(()=>{})
  }, [])
  const byName = useMemo(() => Object.fromEntries(tags.map(t=>[t.name,t])), [tags])
  const reactIconMap: Record<string, ReactNode> = {
    chevronsDown: <ChevronsDown size={12} />,
    chevronDown: <ChevronDown size={12} />,
    sparkles: <Sparkles size={12} />,
    award: <Award size={12} />,
    flame: <Flame size={12} />,
    trendingUp: <TrendingUp size={12} />,
    shield: <Shield size={12} />,
    crown: <Crown size={12} />,
    clock: <ClockIcon size={12} />
  }
  return {
    getIcon: (name: string) => reactIconMap[byName[name]?.icon] || null,
    getClasses: (name: string) => byName[name]?.classes || 'bg-primary/20 text-primary border border-primary/40',
    allNames: tags.map(t=>t.name)
  }
}



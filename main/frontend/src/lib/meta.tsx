import { useEffect, useMemo, useState } from 'react'
import { apiGet } from './api'
import { Footprints, Target, Shirt, Eye, Award, Trophy } from 'lucide-react'

type MetaResponse = {
  meta?: any
}

export function useMetaUI() {
  const [meta, setMeta] = useState<any>(null)
  useEffect(() => {
    apiGet<MetaResponse | any>(`/catalog/meta`).then((r) => {
      const m = (r as any)?.meta || r
      setMeta(m)
    }).catch(()=>{})
  }, [])

  const categoriesDisplay: Record<string, { icon: string; chipClasses: string }> = useMemo(() => {
    return (meta?.categoriesDisplay || {}) as any
  }, [meta])

  const getCategoryIcon = (name?: string) => {
    const key = String(name || '').toUpperCase()
    const token = categoriesDisplay[key]?.icon || categoriesDisplay.DEFAULT?.icon || 'trophy'
    if (token === 'footprints') return <Footprints size={12} />
    if (token === 'target') return <Target size={12} />
    if (token === 'shirt') return <Shirt size={12} />
    if (token === 'eye') return <Eye size={12} />
    if (token === 'award') return <Award size={12} />
    return <Trophy size={12} />
  }

  const getCategoryChipClasses = (name?: string) => {
    const key = String(name || '').toUpperCase()
    return categoriesDisplay[key]?.chipClasses || categoriesDisplay.DEFAULT?.chipClasses || 'bg-primary/20 text-primary border border-primary/40'
  }

  const collectionChipClasses = (meta?.ui?.chips?.collection)
  const season1ChipClasses = (meta?.ui?.chips?.season1)
  const season2ChipClasses = (meta?.ui?.chips?.season2)
  const filterUI = meta?.ui?.filters || {}
  const getFilterButtonClasses = (active: boolean, colorSwatch?: boolean) => {
    if (colorSwatch) return active ? (filterUI.colorSwatchButtonActive || '') : (filterUI.colorSwatchButtonInactive || '')
    return active ? (filterUI.buttonActive || '') : (filterUI.buttonInactive || '')
  }

  return {
    getCategoryIcon,
    getCategoryChipClasses,
    collectionChipClasses,
    season1ChipClasses,
    season2ChipClasses,
    getFilterButtonClasses,
  }
}



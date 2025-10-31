export type CatalogMeta = {
  categories: Array<{
    name: string
    slug: string
    secondary?: Record<string, { tertiary: string[] }>
  }>
  filters: {
    brands: string[]
    colors: string[]
    sizes: string[]
    features: string[]
    collections: string[]
    tags: string[]
  }
  filtersDetailed: {
    brands: Array<{ name: string; colorClass: string }>
    colors: Array<{ name: string; colorClass: string }>
    sizes: string[]
    features: Array<{ name: string; icon: string }>
    collections: string[]
    tags: string[]
    tagsDetailed: Array<{ name: string; icon: string; classes: string }>
  }
  categoriesDisplay: Record<string, { icon: string; chipClasses: string }>
  ui?: {
    chips?: {
      collection?: string
      season1?: string
      season2?: string
    }
    filters?: {
      sectionHeader?: string
      buttonActive?: string
      buttonInactive?: string
      colorSwatchButtonActive?: string
      colorSwatchButtonInactive?: string
    }
  }
}

export const catalogMeta: CatalogMeta = {
  categories: [
    {
      name: 'FOOTWEAR',
      slug: 'footwear',
      secondary: {
        SNEAKERS: { tertiary: ['RUNNING', 'BASKETBALL', 'TENNIS', 'CASUAL'] },
        BOOTS: { tertiary: ['HIKING', 'WORK', 'FASHION'] },
        SANDALS: { tertiary: ['SPORT', 'CASUAL', 'WATER'] }
      }
    },
    {
      name: 'LEGWEAR',
      slug: 'legwear',
      secondary: {
        PANTS: { tertiary: ['JOGGING', 'TRAINING', 'CASUAL', 'TECHNICAL'] },
        SHORTS: { tertiary: ['RUNNING', 'BASKETBALL', 'GYM', 'SWIM'] },
        LEGGINGS: { tertiary: ['YOGA', 'RUNNING', 'TRAINING'] }
      }
    },
    {
      name: 'TORSO',
      slug: 'torso',
      secondary: {
        SHIRTS: { tertiary: ['T-SHIRT', 'POLO', 'TANK', 'LONG_SLEEVE'] },
        JACKETS: { tertiary: ['WIND_BREAKER', 'SOFT_SHELL', 'HARD_SHELL', 'FLEECE'] },
        HOODIES: { tertiary: ['PULLOVER', 'ZIP_UP', 'CREW'] }
      }
    },
    {
      name: 'HEADWEAR',
      slug: 'headwear',
      secondary: {
        CAPS: { tertiary: ['BASEBALL', 'SNAP_BACK', 'FITTED'] },
        HATS: { tertiary: ['BEANIE', 'BUCKET', 'SUN_HAT'] },
        HELMETS: { tertiary: ['BIKE', 'SKATE', 'CLIMBING'] }
      }
    },
    {
      name: 'ACCESSORIES',
      slug: 'accessories',
      secondary: {
        BAGS: { tertiary: ['BACKPACK', 'DUFFEL', 'GYM_BAG', 'WAIST_PACK'] },
        WATCHES: { tertiary: ['SPORT', 'SMART', 'DIVE', 'CHRONOGRAPH'] },
        GLOVES: { tertiary: ['TRAINING', 'CYCLING', 'WINTER', 'FINGERLESS'] }
      }
    }
  ],
  filters: {
    brands: ['NIKE','ADIDAS','PUMA','UNDER ARMOUR','NEW BALANCE','CONVERSE'],
    colors: ['ЧЕРНЫЙ','БЕЛЫЙ','КРАСНЫЙ','СИНИЙ','ЗЕЛЕНЫЙ','ЖЕЛТЫЙ','РОЗОВЫЙ','СЕРЫЙ'],
    sizes: ['XS','S','M','L','XL','XXL','36','37','38','39','40','41','42','43','44','45'],
    features: ['ВОДОНЕПРОНИЦАЕМЫЕ','ДЫШАЩИЕ','АМОРТИЗАЦИЯ','ПОДДЕРЖКА СТОПЫ','БЫСТРОСУШИМЫЕ','ПРЕМИУМ'],
    collections: ['Season 1','Season 2','Retro','Pro Line','City Pack','Trail','Studio','Limited'],
    tags: ['СКИДКА','СУПЕР СКИДКА','НОВИНКА','ПРЕМИУМ','ХИТ','РАСПРОДАЖА','ОГРАНИЧЕНО','ЭКСКЛЮЗИВ','БЫСТРО']
  },
  filtersDetailed: {
    brands: [
      { name: 'NIKE', colorClass: 'bg-red-500' },
      { name: 'ADIDAS', colorClass: 'bg-blue-500' },
      { name: 'PUMA', colorClass: 'bg-orange-500' },
      { name: 'UNDER ARMOUR', colorClass: 'bg-yellow-400' },
      { name: 'NEW BALANCE', colorClass: 'bg-green-500' },
      { name: 'CONVERSE', colorClass: 'bg-purple-500' }
    ],
    colors: [
      { name: 'ЧЕРНЫЙ', colorClass: 'bg-black' },
      { name: 'БЕЛЫЙ', colorClass: 'bg-white border border-gray-300' },
      { name: 'КРАСНЫЙ', colorClass: 'bg-red-500' },
      { name: 'СИНИЙ', colorClass: 'bg-blue-500' },
      { name: 'ЗЕЛЕНЫЙ', colorClass: 'bg-green-500' },
      { name: 'ЖЕЛТЫЙ', colorClass: 'bg-yellow-400' },
      { name: 'РОЗОВЫЙ', colorClass: 'bg-pink-500' },
      { name: 'СЕРЫЙ', colorClass: 'bg-gray-500' }
    ],
    sizes: ['XS','S','M','L','XL','XXL','36','37','38','39','40','41','42','43','44','45'],
    features: [
      { name: 'ВОДОНЕПРОНИЦАЕМЫЕ', icon: 'zap' },
      { name: 'ДЫШАЩИЕ', icon: 'eye' },
      { name: 'АМОРТИЗАЦИЯ', icon: 'target' },
      { name: 'ПОДДЕРЖКА СТОПЫ', icon: 'footprints' },
      { name: 'БЫСТРОСУШИМЫЕ', icon: 'clock' },
      { name: 'ПРЕМИУМ', icon: 'award' }
    ],
    collections: ['Season 1','Season 2','Retro','Pro Line','City Pack','Trail','Studio','Limited'],
    tags: ['СКИДКА','СУПЕР СКИДКА','НОВИНКА','ПРЕМИУМ','ХИТ','РАСПРОДАЖА','ОГРАНИЧЕНО','ЭКСКЛЮЗИВ','БЫСТРО'],
    tagsDetailed: [
      { name: 'СКИДКА', icon: 'chevronDown', classes: 'bg-red-500/20 text-red-400 border border-red-500/40' },
      { name: 'СУПЕР СКИДКА', icon: 'chevronsDown', classes: 'bg-red-600/20 text-red-400 border border-red-600/40' },
      { name: 'НОВИНКА', icon: 'sparkles', classes: 'bg-green-500/20 text-green-400 border border-green-500/40' },
      { name: 'ПРЕМИУМ', icon: 'award', classes: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' },
      { name: 'ХИТ', icon: 'flame', classes: 'bg-orange-500/20 text-orange-400 border border-orange-500/40' },
      { name: 'РАСПРОДАЖА', icon: 'trendingUp', classes: 'bg-purple-500/20 text-purple-400 border border-purple-500/40' },
      { name: 'ОГРАНИЧЕНО', icon: 'shield', classes: 'bg-pink-500/20 text-pink-400 border border-pink-500/40' },
      { name: 'ЭКСКЛЮЗИВ', icon: 'crown', classes: 'bg-blue-500/20 text-blue-400 border border-blue-500/40' },
      { name: 'БЫСТРО', icon: 'clock', classes: 'bg-green-500/20 text-green-400 border border-green-500/40' }
    ]
  },
  categoriesDisplay: {
    FOOTWEAR: { icon: 'footprints', chipClasses: 'bg-green-500/20 text-green-400 border border-green-500/40' },
    LEGWEAR: { icon: 'target', chipClasses: 'bg-blue-600/20 text-blue-400 border border-blue-600/40' },
    TORSO: { icon: 'shirt', chipClasses: 'bg-purple-500/20 text-purple-400 border border-purple-500/40' },
    HEADWEAR: { icon: 'eye', chipClasses: 'bg-pink-500/20 text-pink-400 border border-pink-500/40' },
    ACCESSORIES: { icon: 'award', chipClasses: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' },
    DEFAULT: { icon: 'trophy', chipClasses: 'bg-primary/20 text-primary border border-primary/40' }
  },
  ui: {
    chips: {
      collection: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
      season1: 'bg-pink-500/20 text-pink-400 border border-pink-500/40',
      season2: 'bg-pink-500/30 text-pink-400 border border-pink-500/50'
    },
    filters: {
      sectionHeader: '',
      buttonActive: 'border-white/40 ring-2 ring-white/50 bg-white/10',
      buttonInactive: 'border-standard bg-bg-inner hover:bg-bg-alt',
      colorSwatchButtonActive: 'border-white/40 ring-2 ring-white/50 bg-white/10',
      colorSwatchButtonInactive: 'border-standard hover:bg-bg-alt'
    }
  }
}

export function humanizeType(categoryName: string, secondary: string, tertiary: string): string {
  const c = categoryName.toUpperCase()
  const s = secondary.toUpperCase()
  const t = tertiary.toUpperCase()
  if (c === 'FOOTWEAR') {
    if (s === 'SNEAKERS') {
      if (t === 'RUNNING') return 'Running Shoes'
      if (t === 'BASKETBALL') return 'Basketball Sneakers'
      if (t === 'TENNIS') return 'Tennis Shoes'
      if (t === 'CASUAL') return 'Casual Sneakers'
    }
    if (s === 'BOOTS') {
      if (t === 'HIKING') return 'Hiking Boots'
      if (t === 'WORK') return 'Work Boots'
      if (t === 'FASHION') return 'Fashion Boots'
    }
    if (s === 'SANDALS') {
      if (t === 'SPORT') return 'Sport Sandals'
      if (t === 'CASUAL') return 'Casual Sandals'
      if (t === 'WATER') return 'Water Sandals'
    }
  }
  if (c === 'LEGWEAR') {
    if (s === 'PANTS') {
      if (t === 'JOGGING') return 'Jogging Pants'
      if (t === 'TRAINING') return 'Training Pants'
      if (t === 'CASUAL') return 'Casual Pants'
      if (t === 'TECHNICAL') return 'Technical Pants'
    }
    if (s === 'SHORTS') {
      if (t === 'RUNNING') return 'Running Shorts'
      if (t === 'BASKETBALL') return 'Basketball Shorts'
      if (t === 'GYM') return 'Gym Shorts'
      if (t === 'SWIM') return 'Swim Shorts'
    }
    if (s === 'LEGGINGS') {
      if (t === 'YOGA') return 'Yoga Leggings'
      if (t === 'RUNNING') return 'Running Leggings'
      if (t === 'TRAINING') return 'Training Leggings'
    }
  }
  if (c === 'TORSO') {
    if (s === 'SHIRTS') {
      if (t === 'T-SHIRT') return 'T-Shirt'
      if (t === 'POLO') return 'Polo Shirt'
      if (t === 'TANK') return 'Tank Top'
      if (t === 'LONG_SLEEVE') return 'Long Sleeve Shirt'
    }
    if (s === 'JACKETS') {
      if (t === 'WIND_BREAKER') return 'Wind Breaker'
      if (t === 'SOFT_SHELL') return 'Soft Shell Jacket'
      if (t === 'HARD_SHELL') return 'Hard Shell Jacket'
      if (t === 'FLEECE') return 'Fleece Jacket'
    }
    if (s === 'HOODIES') {
      if (t === 'PULLOVER') return 'Pullover Hoodie'
      if (t === 'ZIP_UP') return 'Zip Up Hoodie'
      if (t === 'CREW') return 'Crew Hoodie'
    }
  }
  if (c === 'HEADWEAR') {
    if (s === 'CAPS') {
      if (t === 'BASEBALL') return 'Baseball Cap'
      if (t === 'SNAP_BACK') return 'Snapback Cap'
      if (t === 'FITTED') return 'Fitted Cap'
    }
    if (s === 'HATS') {
      if (t === 'BEANIE') return 'Beanie'
      if (t === 'BUCKET') return 'Bucket Hat'
      if (t === 'SUN_HAT') return 'Sun Hat'
    }
    if (s === 'HELMETS') {
      if (t === 'BIKE') return 'Bike Helmet'
      if (t === 'SKATE') return 'Skate Helmet'
      if (t === 'CLIMBING') return 'Climbing Helmet'
    }
  }
  if (c === 'ACCESSORIES') {
    if (s === 'BAGS') {
      if (t === 'BACKPACK') return 'Backpack'
      if (t === 'DUFFEL') return 'Duffel Bag'
      if (t === 'GYM_BAG') return 'Gym Bag'
      if (t === 'WAIST_PACK') return 'Waist Pack'
    }
    if (s === 'WATCHES') {
      if (t === 'SPORT') return 'Sport Watch'
      if (t === 'SMART') return 'Smart Watch'
      if (t === 'DIVE') return 'Dive Watch'
      if (t === 'CHRONOGRAPH') return 'Chronograph Watch'
    }
    if (s === 'GLOVES') {
      if (t === 'TRAINING') return 'Training Gloves'
      if (t === 'CYCLING') return 'Cycling Gloves'
      if (t === 'WINTER') return 'Winter Gloves'
      if (t === 'FINGERLESS') return 'Fingerless Gloves'
    }
  }
  return tertiary
}



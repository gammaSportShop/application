export const TAGS = [
  'СКИДКА',
  'СУПЕР СКИДКА',
  'НОВИНКА',
  'ПРЕМИУМ',
  'ХИТ',
  'РАСПРОДАЖА',
  'ОГРАНИЧЕНО',
  'ЭКСКЛЮЗИВ',
  'БЫСТРО'
] as const

export const DISCOUNT_TAGS = ['СКИДКА', 'СУПЕР СКИДКА'] as const

export type TagName = typeof TAGS[number]


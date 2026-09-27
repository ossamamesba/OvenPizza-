export const variants = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  secondary: 'bg-surface text-foreground ring-1 ring-inset ring-border hover:ring-foreground/30',
  success: 'bg-success text-white hover:bg-success/90',
  danger: 'bg-surface text-danger ring-1 ring-inset ring-danger/40 hover:bg-danger hover:text-white',
  ghost: 'text-foreground hover:bg-accent-soft',
} as const

export const sizes = {
  md: 'min-h-11 px-5',
  sm: 'min-h-10 px-4 text-sm',
} as const

export type ButtonVariant = keyof typeof variants
export type ButtonSize = keyof typeof sizes

/** Classes d'un bouton (aussi utilisées pour styler un lien comme un bouton). */
export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md') {
  return `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]}`
}

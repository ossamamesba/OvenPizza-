import { Link, type LinkProps } from 'react-router-dom'

const variants = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  outline: 'bg-surface text-foreground ring-2 ring-inset ring-foreground/15 hover:ring-primary hover:text-primary',
} as const

export function ButtonLink({ variant = 'primary', className = '', ...props }: LinkProps & { variant?: keyof typeof variants }) {
  return (
    <Link
      {...props}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold transition-colors duration-200 ${variants[variant]} ${className}`}
    />
  )
}

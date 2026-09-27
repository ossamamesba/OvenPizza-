import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { buttonClass, type ButtonSize, type ButtonVariant } from './buttonClass'


export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading = false, disabled, className = '', children, ...props }: ButtonProps) {
  return (
    <button type="button" {...props} disabled={disabled || loading} aria-busy={loading || undefined} className={`${buttonClass(variant, size)} ${className}`}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

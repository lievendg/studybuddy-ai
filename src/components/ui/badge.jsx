import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary-100 text-primary-700 hover:bg-primary-200",
        secondary: "border-transparent bg-secondary-100 text-secondary-700 hover:bg-secondary-200",
        destructive: "border-transparent bg-red-100 text-red-700 hover:bg-red-200",
        outline: "text-foreground border-gray-300",
        sage: "border-transparent bg-sage-100 text-sage-700 hover:bg-sage-200",
        warm: "border-transparent bg-warm-100 text-warm-700 hover:bg-warm-200",
        accent: "border-transparent bg-accent-100 text-accent-700 hover:bg-accent-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

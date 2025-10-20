import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-600 shadow-soft-md hover:shadow-soft-lg active:shadow-soft",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft-md",
        outline: "border border-primary-200 bg-white hover:bg-primary-50 hover:border-primary-300 text-primary-700 shadow-soft",
        secondary: "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 shadow-soft",
        ghost: "hover:bg-primary-50 hover:text-primary-700",
        link: "text-primary-600 underline-offset-4 hover:underline hover:text-primary-700",
        sage: "bg-sage-500 text-white hover:bg-sage-600 shadow-soft-md hover:shadow-soft-lg",
        warm: "bg-warm-500 text-white hover:bg-warm-600 shadow-soft-md hover:shadow-soft-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }

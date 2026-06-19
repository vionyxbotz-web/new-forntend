import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "clay-btn inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
  {
    variants: {
      variant: {
        default: "clay-btn-primary",
        destructive: "clay-btn-danger",
        outline: "clay-btn-secondary",
        secondary: "clay-btn-secondary",
        ghost: "clay-btn-ghost",
        link: "underline-offset-4 hover:underline text-[var(--accent)] shadow-none bg-transparent min-h-0 p-0",
      },
      size: {
        default: "",
        sm: "clay-btn-sm",
        lg: "clay-btn-lg",
        icon: "!p-0 !min-h-[36px] !min-w-[36px] !w-9 !h-9",
        "icon-sm": "!p-0 !min-h-[32px] !min-w-[32px] !w-8 !h-8",
        "icon-lg": "!p-0 !min-h-[44px] !min-w-[44px] !w-11 !h-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

import { type VariantProps, cva } from "class-variance-authority";

export { default as Button } from "./Button.vue";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap brutalist-button text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        ghost: "border-none shadow-none hover:bg-accent hover:text-accent-foreground active:translate-x-0 active:translate-y-0 active:shadow-none",
        "ghost-secondary": "border-none shadow-none hover:bg-secondary hover:text-secondary-foreground active:translate-x-0 active:translate-y-0 active:shadow-none",
        link: "border-none shadow-none text-primary underline-offset-4 hover:underline active:translate-x-0 active:translate-y-0 active:shadow-none"
      },
      size: {
        default: "h-11 px-6 py-2",
        xs: "h-7 px-2",
        sm: "h-9 px-3",
        lg: "h-12 px-10 text-lg",
        icon: "h-10 w-10",
        round: "h-8 w-8 rounded-full"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

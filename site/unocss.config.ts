import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup
} from "unocss";
import { i18n } from "./configs/i18n";
import presetAnimations from "unocss-preset-animations";
import { presetShadcn } from "unocss-preset-shadcn";

export default defineConfig({
  shortcuts: [
    {
      "flex-center": "flex items-center justify-center",
      hstack: "flex items-center",
      "hide-on-mobile": "lt-md:hidden",
      "ring-when-focus":
        "ring-offset-background focus-visible:(outline-none ring-2 ring-ring ring-offset-2)",
      "shadow-c": "shadow shadow-blue-200 dark:shadow-black",
      "brutalist-border": "border-2 border-black dark:border-[hsl(20,14%,85%)]",
      "brutalist-shadow": "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsla(20,14%,85%,0.3)]",
      "brutalist-shadow-sm": "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_hsla(20,14%,85%,0.3)]",
      "brutalist-card": "brutalist-border brutalist-shadow bg-card rounded-none transition-all",
      "brutalist-button": "brutalist-border brutalist-shadow rounded-none transition-all active:(translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]) dark:active:shadow-[2px_2px_0px_0px_hsla(20,14%,85%,0.3)]",
      "resume-card":
        "relative mx-auto rounded-none duration-150 hover:(-translate-y-2 brutalist-shadow)"
    }
  ],
  preflights: [
    {
      getCSS: () => `
        :root {
          --success: 142.1 70.6% 45.3%;
          --info: 199 89% 48%;
          --warning: 48 96% 53%;
          --danger: 0 84.2% 60.2%;
        }

        .dark {
          --success: 140 100% 50%;
          --info: 199 100% 60%;
          --warning: 45 100% 50%;
          --danger: 0 100% 64%;
        }
      `
    }
  ],
  theme: {
    breakpoints: {
      sm: "641px",
      md: "769px",
      lg: "1025px"
    },
    colors: {
      success: "hsl(var(--success))",
      info: "hsl(var(--info))",
      warning: "hsl(var(--warning))",
      danger: "hsl(var(--danger))"
    }
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      extraProperties: {
        display: "inline-block"
      }
    }),
    presetWebFonts({
      fonts: {
        ui: "Inter:400,700,900"
      }
    }),
    presetAnimations(),
    presetShadcn(
      {
        color: {
          base: "stone",
          light: {
            background: "0 0% 96%",
            foreground: "0 0% 0%",
            card: "0 0% 100%",
            "card-foreground": "0 0% 0%",
            popover: "0 0% 100%",
            "popover-foreground": "0 0% 0%",
            primary: "0 84.2% 60.2%",
            "primary-foreground": "0 0% 100%",
            secondary: "32 95% 44%",
            "secondary-foreground": "0 0% 100%",
            muted: "0 0% 92%",
            "muted-foreground": "0 0% 20%",
            accent: "142.1 70.6% 45.3%",
            "accent-foreground": "0 0% 100%",
            destructive: "0 84.2% 60.2%",
            "destructive-foreground": "0 0% 100%",
            border: "0 0% 0%",
            input: "0 0% 0%",
            ring: "0 84.2% 60.2%"
          },
          dark: {
            background: "20 14% 4%",
            foreground: "20 14% 98%",
            card: "20 14% 7%",
            "card-foreground": "20 14% 98%",
            popover: "20 14% 4%",
            "popover-foreground": "20 14% 98%",
            primary: "0 100% 64%",
            "primary-foreground": "0 0% 100%",
            secondary: "30 100% 50%",
            "secondary-foreground": "0 0% 100%",
            muted: "20 14% 15%",
            "muted-foreground": "20 14% 80%",
            accent: "140 100% 50%",
            "accent-foreground": "0 0% 100%",
            destructive: "0 100% 64%",
            "destructive-foreground": "0 0% 100%",
            border: "20 14% 85%",
            input: "20 14% 85%",
            ring: "0 100% 64%"
          }
        }
      },
      false
    )
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  content: {
    pipeline: {
      // https://github.com/fisand/unocss-preset-shadcn
      include: [/\.ts/, /\.vue$/, /\.vue\?vue/]
    }
  },
  // @ts-expect-error icon is a customized key
  safelist: i18n.locales.map((item) => item.icon)
});

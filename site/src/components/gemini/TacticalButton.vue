<script setup lang="ts">
import { cn } from "~/utils/shadcn";

interface Props {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md"
});

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

const variantStyles = {
  primary: "tactical-btn-primary",
  secondary: "tactical-btn-secondary",
  danger: "tactical-btn-danger",
  ghost: "tactical-btn-ghost"
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base"
};
</script>

<template>
  <button
    :class="
      cn(
        'tactical-btn',
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        props.class
      )
    "
    :disabled="disabled || loading"
    @click="emit('click', $event)"
  >
    <span v-if="loading" class="tactical-loading mr-2" />
    <slot />
  </button>
</template>

<style scoped>
.tactical-btn {
  @apply relative font-black uppercase tracking-tighter;
  @apply brutalist-button transition-all duration-150;
  @apply flex items-center justify-center gap-2;
}

.tactical-btn-primary {
  @apply bg-primary text-primary-foreground hover:bg-primary/90;
}

.tactical-btn-secondary {
  @apply bg-secondary text-secondary-foreground hover:bg-secondary/90;
}

.tactical-btn-danger {
  @apply bg-danger text-danger-foreground hover:bg-danger/90;
}

.tactical-btn-ghost {
  @apply bg-transparent border-none shadow-none text-foreground;
  @apply hover:bg-accent/10 active:translate-x-0 active:translate-y-0 active:shadow-none;
}

.tactical-loading {
  @apply inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full;
  animation: tactical-spin 1s linear infinite;
}

@keyframes tactical-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

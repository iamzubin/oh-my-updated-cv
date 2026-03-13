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
    <span class="sw-bracket">[</span>
    <span v-if="loading" class="tactical-loading mr-2" />
    <slot />
    <span class="sw-bracket">]</span>
  </button>
</template>

<style scoped>
.tactical-btn {
  @apply relative font-mono transition-all duration-150;
  @apply flex items-center justify-center gap-1;
  @apply border bg-background rounded-none;
  @apply uppercase tracking-wider;
}

.tactical-btn-primary {
  @apply border-red-500 text-red-400;
  @apply hover:bg-red-600 hover:text-white;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
}

.tactical-btn-primary:hover {
  box-shadow: 0 0 16px rgba(239, 68, 68, 0.6);
}

.tactical-btn-secondary {
  @apply border-yellow-500 text-yellow-400;
  @apply hover:bg-yellow-600 hover:text-black;
  box-shadow: 0 0 8px rgba(234, 179, 8, 0.3);
}

.tactical-btn-secondary:hover {
  box-shadow: 0 0 16px rgba(234, 179, 8, 0.6);
}

.tactical-btn-danger {
  @apply border-orange-500 text-orange-400;
  @apply hover:bg-orange-600 hover:text-white;
}

.tactical-btn-ghost {
  @apply border-transparent bg-transparent shadow-none text-foreground;
  @apply hover:bg-slate-700 hover:text-white;
}

.sw-bracket {
  @apply opacity-60;
}

.tactical-loading {
  @apply inline-block w-3 h-3 border border-current border-t-transparent rounded-full;
  animation: tactical-spin 1s linear infinite;
}

@keyframes tactical-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

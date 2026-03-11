<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { cn } from "~/utils/shadcn";

interface Props {
  modelValue?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  readonly?: boolean;
  class?: string;
  label?: string;
  hint?: string;
}

const props = withDefaults(defineProps<Props>(), {
  rows: 6,
  placeholder: "Enter system prompt..."
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const modelValue = useVModel(props, "modelValue", emit, {
  passive: true,
  defaultValue: props.defaultValue || ""
});
</script>

<template>
  <div :class="cn('tactical-input-wrapper', props.class)">
    <label v-if="label" class="tactical-input-label">
      <span class="tactical-input-label-text">{{ label }}</span>
      <span v-if="hint" class="tactical-input-hint">{{ hint }}</span>
    </label>

    <div class="tactical-input-container">
      <div class="tactical-input-corner tactical-input-corner--tl" />
      <div class="tactical-input-corner tactical-input-corner--tr" />
      <div class="tactical-input-corner tactical-input-corner--bl" />
      <div class="tactical-input-corner tactical-input-corner--br" />

      <textarea
        v-model="modelValue"
        :rows="rows"
        :disabled="disabled"
        :readonly="readonly"
        :placeholder="placeholder"
        class="tactical-input"
        :class="{ 'tactical-input--disabled': disabled }"
      />
    </div>
  </div>
</template>

<style scoped>
.tactical-input-wrapper {
  @apply space-y-2;
}

.tactical-input-label {
  @apply flex items-center justify-between;
}

.tactical-input-label-text {
  @apply font-black text-sm text-foreground uppercase tracking-tight;
}

.tactical-input-hint {
  @apply font-bold text-xs text-muted-foreground;
}

.tactical-input-container {
  @apply relative;
}

.tactical-input {
  @apply w-full min-h-[120px] p-4;
  @apply bg-background brutalist-border rounded-none;
  @apply font-bold text-sm text-foreground leading-relaxed;
  @apply placeholder:text-muted-foreground/50;
  @apply focus:outline-none focus:ring-2 focus:ring-primary;
  @apply transition-all duration-150;
  @apply resize-y;
}

.tactical-input:focus {
  @apply brutalist-shadow-sm;
}

.tactical-input--disabled {
  @apply opacity-50 cursor-not-allowed;
}

.tactical-input-corner {
  @apply hidden;
}
</style>

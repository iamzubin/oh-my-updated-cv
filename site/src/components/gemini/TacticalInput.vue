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
  @apply font-mono text-sm tracking-tight;
  @apply text-cyan-400 uppercase;
}

.tactical-input-hint {
  @apply font-mono text-xs;
  @apply text-slate-500;
}

.tactical-input-container {
  @apply relative;
}

.tactical-input {
  @apply w-full min-h-[120px] p-4;
  @apply bg-slate-900/80 border border-slate-700 rounded-none;
  @apply font-mono text-sm text-slate-200 leading-relaxed;
  @apply placeholder:text-slate-600;
  @apply focus:outline-none focus:border-cyan-500;
  @apply transition-all duration-150;
  @apply resize-y;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.tactical-input:focus {
  @apply shadow-none;
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 10px rgba(6, 182, 212, 0.2);
}

.tactical-input--disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>

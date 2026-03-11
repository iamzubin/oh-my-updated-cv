<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { cn } from "~/utils/shadcn";

interface Props {
  modelValue?: boolean;
  label?: string;
  disabled?: boolean;
  class?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const modelValue = useVModel(props, "modelValue", emit, {
  passive: true,
  defaultValue: false
});

const toggle = () => {
  if (!props.disabled) {
    modelValue.value = !modelValue.value;
  }
};
</script>

<template>
  <div
    :class="
      cn(
        'tactical-toggle-wrapper',
        disabled && 'opacity-50 cursor-not-allowed',
        props.class
      )
    "
  >
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      class="tactical-toggle"
      @click="toggle"
    >
      <span
        class="tactical-toggle-track"
        :class="{ 'tactical-toggle-track--active': modelValue }"
      >
        <span
          class="tactical-toggle-thumb"
          :class="{ 'tactical-toggle-thumb--active': modelValue }"
        />
      </span>
    </button>
    <span v-if="label" class="tactical-toggle-label" @click="toggle">
      {{ label }}
    </span>
  </div>
</template>

<style scoped>
.tactical-toggle-wrapper {
  @apply flex items-center gap-3;
}

.tactical-toggle {
  @apply relative inline-flex items-center;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2;
}

.tactical-toggle-track {
  @apply relative inline-flex h-6 w-11 items-center rounded-none;
  @apply bg-muted brutalist-border transition-all duration-150;
}

.tactical-toggle-track--active {
  @apply bg-accent;
}

.tactical-toggle-thumb {
  @apply absolute left-1 top-1;
  @apply h-4 w-4 bg-muted-foreground brutalist-border transition-all duration-150 shadow-none;
}

.tactical-toggle-thumb--active {
  @apply translate-x-5 bg-white;
}

.tactical-toggle-label {
  @apply font-black text-sm text-foreground uppercase tracking-tight cursor-pointer select-none;
  @apply hover:text-primary transition-colors;
}
</style>

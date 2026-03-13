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
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900;
}

.tactical-toggle-track {
  @apply relative inline-flex h-6 w-11 items-center rounded-none;
  @apply bg-slate-800 border border-slate-600 transition-all duration-150;
}

.tactical-toggle-track--active {
  @apply bg-red-600 border-red-500;
  box-shadow: 0 0 10px theme("colors.red.500" / 50%);
}

.tactical-toggle-thumb {
  @apply absolute left-1 top-1;
  @apply h-4 w-4 bg-slate-400 transition-all duration-150 shadow-none;
}

.tactical-toggle-thumb--active {
  @apply translate-x-5 bg-white;
  box-shadow: 0 0 8px theme("colors.white" / 80%);
}

.tactical-toggle-label {
  @apply font-bold text-sm uppercase tracking-wider cursor-pointer select-none;
  @apply text-cyan-400;
  @apply hover:text-cyan-300 transition-colors;
}
</style>

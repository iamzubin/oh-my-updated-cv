<template>
  <div :class="cn('px-4 py-8 text-sm', props.class)">
    <div hstack gap-x-2 mb-6 text-lg font-black uppercase tracking-tighter>
      <span v-if="icon" :class="[icon, 'text-xl']" />
      {{ text }}
    </div>

    <slot />
  </div>
</template>

<script lang="ts" setup>
import { cn } from "~/utils/shadcn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
  text: string;
  icon?: HTMLAttributes["class"];
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <UiDialog v-model:open="isOpen">
    <UiDialogTrigger as-child>
      <UiButton
        class="h-full px-4 gap-x-2 !shadow-none !active:translate-x-0 !active:translate-y-0"
        variant="ghost-secondary"
        size="sm"
        title="Manual Snapshot (Ctrl + S)"
      >
        <span i-ic:baseline-save text-xl />
        <span class="hide-on-mobile text-lg uppercase font-bold">Snapshot</span>
      </UiButton>
    </UiDialogTrigger>

    <UiDialogContent class="sm:max-w-md brutalist-card p-0 overflow-hidden">
      <div class="px-6 pt-10 pb-6 bg-accent border-b-2 border-black dark:border-white">
        <h2 class="font-black text-2xl text-white uppercase tracking-tighter">Manual Snapshot</h2>
        <p class="font-bold text-xs text-white/80 mt-1 uppercase">// Create a recovery point in the timeline</p>
      </div>

      <div class="p-8 bg-background border-b-2 border-black dark:border-white space-y-4">
        <GeminiTacticalInput
          v-model="snapshotLabel"
          label="Snapshot Label"
          placeholder="e.g., Added experience section..."
          :rows="2"
          @keydown.enter.prevent="takeSnapshot"
        />
      </div>

      <div class="p-6 bg-muted flex justify-end gap-4 px-8">
        <UiDialogClose as-child>
          <GeminiTacticalButton variant="ghost" size="sm" class="h-10 px-6">
            CANCEL
          </GeminiTacticalButton>
        </UiDialogClose>
        <GeminiTacticalButton
          variant="primary"
          size="sm"
          class="h-10 px-8"
          @click="takeSnapshot"
        >
          SAVE
        </GeminiTacticalButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script lang="ts" setup>
import { useShortcuts } from "@ohmycv/vue-shortcuts";

const isOpen = ref(false);
const snapshotLabel = ref("");
const { data } = useDataStore();
const { styles } = useStyleStore();

const takeSnapshot = async () => {
  if (!data.resumeId) return;

  const label = snapshotLabel.value.trim() || "Manual Snapshot";

  await storageService.saveVersion(data.resumeId, {
    timestamp: Date.now(),
    markdown: data.markdown,
    css: data.css,
    styles: toRaw(styles),
    label: label
  });

  await storageService.updateResume({
    id: data.resumeId,
    name: data.resumeName,
    markdown: data.markdown,
    css: data.css,
    styles: toRaw(styles)
  });

  isOpen.value = false;
  snapshotLabel.value = "";
};

// Ctrl + S triggers the dialog
useShortcuts("ctrl+s", () => {
  isOpen.value = true;
});
</script>

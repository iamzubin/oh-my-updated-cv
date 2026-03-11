<template>
  <UiDialog v-model:open="isOpen">
    <UiDialogTrigger as-child>
      <UiButton
        class="h-full px-4 gap-x-2 !shadow-none !active:translate-x-0 !active:translate-y-0"
        variant="ghost-secondary"
        size="sm"
      >
        <span i-ic:baseline-history text-xl />
        <span class="hide-on-mobile text-lg uppercase font-bold">History</span>
      </UiButton>
    </UiDialogTrigger>

    <UiDialogContent class="sm:max-w-md brutalist-card p-0 overflow-hidden">
      <div class="px-6 pt-8 pb-6 bg-accent border-b-2 border-black dark:border-white">
        <h2 class="font-black text-2xl text-white uppercase tracking-tighter">Version History</h2>
      </div>

      <div class="p-6 max-h-96 overflow-y-auto space-y-4 bg-background">
        <div v-if="versions.length === 0" class="text-sm font-bold text-muted-foreground uppercase">
          No previous versions found.
        </div>
        
        <div v-for="(version, index) in reversedVersions" :key="index" class="flex justify-between items-center brutalist-border p-3 bg-card">
          <div class="flex flex-col">
            <span class="font-bold text-sm uppercase">{{ formatDate(version.timestamp) }}</span>
            <span class="text-xs text-muted-foreground font-bold uppercase mt-1">Version {{ versions.length - index }}</span>
          </div>
          <UiButton size="sm" variant="outline" class="brutalist-button h-8 px-3" @click="restore(version)">
            Restore
          </UiButton>
        </div>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script lang="ts" setup>
import type { DbResumeVersion } from "~/utils/storage/db";

const isOpen = ref(false);
const versions = ref<DbResumeVersion[]>([]);
const { data, setAndSyncToMonaco } = useDataStore();
const { setStyle } = useStyleStore();

const reversedVersions = computed(() => versions.value.slice().reverse());

watch(isOpen, async (open) => {
  if (open && data.resumeId) {
    versions.value = await storageService.getVersions(data.resumeId);
  }
});

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

const restore = async (version: DbResumeVersion) => {
  setAndSyncToMonaco("markdown", version.markdown);
  setAndSyncToMonaco("css", version.css);
  
  for (const [key, value] of Object.entries(version.styles)) {
    setStyle(key as any, value);
  }

  isOpen.value = false;
  
  if (data.resumeId) {
    await storageService.updateResume({
      id: data.resumeId,
      name: data.resumeName,
      markdown: version.markdown,
      css: version.css,
      styles: version.styles
    });
  }
};
</script>

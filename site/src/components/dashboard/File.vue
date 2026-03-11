<template>
  <div class="flex gap-4">
    <UiButton variant="outline" class="font-black uppercase h-12 px-6" @click="exportToJSON">
      <span i-ic:baseline-save-as text-xl mr-2 />
      {{ $t("dashboard.saveas") }}
    </UiButton>
    <UiButton class="bg-accent font-black uppercase h-12 px-6" @click="open">
      <span i-ic:round-upload-file text-xl mr-2 />
      {{ $t("dashboard.import") }}
    </UiButton>
  </div>
</template>

<script lang="ts" setup>
import { useShortcuts } from "@ohmycv/vue-shortcuts";
import { useFileDialog, readFile } from "@renovamen/utils";

const emits = defineEmits<{
  (e: "update"): void;
}>();

const { open, onChange } = useFileDialog(".json");

onChange(async (file) => {
  const content = await readFile(file);
  await storageService.importFromJson(content);
  emits("update");
});

const exportToJSON = () => storageService.exportToJSON();

useShortcuts("shift+ctrl+s", exportToJSON);
</script>

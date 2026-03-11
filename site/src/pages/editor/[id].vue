<template>
  <div id="editor-page" class="flex flex-col">
    <SharedHeader>
      <template #tail>
        <div class="hstack h-full border-l-2 border-black dark:border-white">
          <EditorToolbarFileHistory />
        </div>
        <div class="hstack h-full border-l-2 border-black dark:border-white">
          <EditorToolbarFileGeminiUpdate />
        </div>
        <div class="hstack h-full border-l-2 border-black dark:border-white">
          <UiButton
            variant="ghost-secondary"
            size="sm"
            class="h-full !shadow-none !active:translate-x-0 !active:translate-y-0"
            @click="isToolbarOpen = !isToolbarOpen"
            :aria-label="isToolbarOpen ? $t('close_toolbar') : $t('open_toolbar')"
          >
            <span
              :class="[
                'size-6',
                isToolbarOpen
                  ? 'i-tabler:layout-sidebar-right-collapse'
                  : 'i-tabler:layout-sidebar-right-expand'
              ]"
            />
          </UiButton>
        </div>
      </template>
    </SharedHeader>

    <div class="workspace flex p-4 bg-background">
      <SplitterGroup id="splitter-editor" direction="horizontal" class="gap-4">
        <SplitterPanel id="code-pane" class="brutalist-card">
          <EditorCode v-if="data.loaded" />
          <div v-else class="flex flex-col gap-y-2 h-full">
            <UiSkeleton class="h-10 bg-secondary" />
            <UiSkeleton class="flex-1 bg-secondary" />
          </div>
        </SplitterPanel>

        <SplitterResizeHandle
          id="code-preview-handle"
          class="w-2 bg-black dark:bg-[hsl(20,14%,85%)] cursor-col-resize hover:bg-primary transition-colors brutalist-shadow-sm"
        />

        <SplitterPanel id="preview-pane" class="brutalist-card">
          <EditorPreview v-if="data.loaded" />
          <UiSkeleton v-else class="size-full bg-secondary" />
        </SplitterPanel>
      </SplitterGroup>

      <div
        v-if="isToolbarOpen"
        id="tools-pane"
        class="ml-4 brutalist-card h-full w-80 overflow-y-auto"
        lt-lg="fixed z-10 max-w-full h-full right-0 top-16 pb-16"
      >
        <EditorToolbar v-if="data.loaded" />
        <UiSkeleton v-else class="h-full w-62 bg-secondary mr-10" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { isInteger } from "@renovamen/utils";

const route = useRoute();
const { data } = useDataStore();

// Fetch resume data
onMounted(() => {
  if (isInteger(route.params.id, { allowString: true })) {
    storageService.switchToResume(Number(route.params.id));
  }
});

// Toogle toolbar
const { width } = useWindowSize();
const isToolbarOpen = ref(width.value > 1024);
</script>

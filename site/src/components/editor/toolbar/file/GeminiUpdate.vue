<template>
  <!-- Tactical Dialog for Job Description -->
  <UiDialog v-model:open="isOpen">
    <UiDialogTrigger as-child>
      <UiButton
        class="h-full px-4 gap-x-2 !shadow-none"
        variant="ghost-secondary"
        size="sm"
      >
        <span class="hide-on-mobile text-sm">[ {{ providerLabel }} ]</span>
      </UiButton>
    </UiDialogTrigger>

    <UiDialogContent
      class="sm:max-w-lg p-0 overflow-hidden rounded-none border border-border"
    >
      <div class="px-6 py-4 border-b border-border">
        <h2 class="text-lg">=== {{ providerLabel }} Protocol ===</h2>
        <p class="text-xs text-muted-foreground mt-1">
          Initialize job-targeted optimization
        </p>
      </div>

      <div class="space-y-6 px-8 py-6 bg-background border-b border-border">
        <GeminiTacticalInput
          v-model="jobDescription"
          label="Job Description"
          hint="[ REQUIRED ]"
          placeholder="Paste target job description here..."
          :rows="6"
        />

        <div
          v-if="error"
          class="flex items-center gap-3 px-4 py-3 bg-danger/10 border border-danger text-danger text-sm"
        >
          <span>!</span>
          <span>{{ error }}</span>
        </div>

        <div class="flex items-center gap-2 text-xs tracking-tight">
          <span class="text-muted-foreground">System Prompt:</span>
          <span
            :class="llmSettings.systemPrompt ? 'text-primary' : 'text-muted-foreground'"
          >
            [{{ llmSettings.systemPrompt ? "CONFIGURED" : "STANDARD" }}]
          </span>
        </div>

        <div
          v-if="!llmSettings.apiKey"
          class="flex items-center gap-3 px-4 py-3 bg-warning/10 border border-warning text-warning text-sm"
        >
          <span>!</span>
          <span>API key not configured. Please configure in settings.</span>
        </div>
      </div>

      <div class="p-6 bg-muted/30 flex justify-between items-center px-8">
        <GeminiTacticalButton
          variant="secondary"
          size="sm"
          class="h-8"
          @click="openSettings"
        >
          [ config ]
        </GeminiTacticalButton>
        <div class="flex gap-4 items-center">
          <UiDialogClose as-child>
            <GeminiTacticalButton
              variant="ghost"
              size="sm"
              class="h-8"
              :disabled="isUpdating"
            >
              [ abort ]
            </GeminiTacticalButton>
          </UiDialogClose>
          <GeminiTacticalButton
            variant="primary"
            size="sm"
            class="h-8"
            :loading="isUpdating"
            :disabled="!jobDescription.trim() || !llmSettings.apiKey"
            @click="handleUpdate"
          >
            [ execute ]
          </GeminiTacticalButton>
        </div>
      </div>
    </UiDialogContent>
  </UiDialog>

  <!-- Tactical Settings Dialog -->
  <UiDialog v-model:open="isSettingsOpen">
    <UiDialogContent
      class="sm:max-w-lg p-0 overflow-hidden rounded-none border border-border"
    >
      <GeminiTacticalSettings @save="isSettingsOpen = false" @reset="handleReset" />
    </UiDialogContent>
  </UiDialog>
</template>

<script lang="ts" setup>
import { useLLMProvider, useLLMProviderSettings } from "~/composables";
import type { Provider } from "~/composables/llm";

const { data, setAndSyncToMonaco } = useDataStore();
const { isUpdating, error, updateResume } = useLLMProvider();
const { settings: llmSettings, resetSettings } = useLLMProviderSettings();
const { toast } = useToast();

const providerLabels: Record<Provider, string> = {
  gemini: "GEMINI",
  claude: "CLAUDE",
  "opencode-zen": "ZEN"
};

const providerLabel = computed(
  () => providerLabels[llmSettings.value.provider as Provider] || "LLM"
);

const isOpen = ref(false);
const isSettingsOpen = ref(false);
const jobDescription = ref("");

watch(isOpen, (open) => {
  if (open) error.value = null;
});

const openSettings = () => {
  isSettingsOpen.value = true;
};

const handleReset = () => {
  resetSettings();
};

const handleUpdate = async () => {
  if (!jobDescription.value.trim() || !data.resumeId) return;

  if (!llmSettings.value.apiKey) {
    toast({
      title: "Configuration Error",
      description: "Please configure your API key in settings"
    });
    return;
  }

  try {
    const history = await storageService.getHistory(data.resumeId);
    const latestNode = history.currentId ? history.nodes[history.currentId] : null;
    const styles = useStyleStore().styles;

    const hasEdits =
      !latestNode || latestNode.markdown !== data.markdown || latestNode.css !== data.css;

    if (hasEdits) {
      await storageService.saveVersion(data.resumeId, {
        timestamp: Date.now(),
        markdown: data.markdown,
        css: data.css,
        styles: toRaw(styles),
        label: "Manual Edits"
      });
    }

    const result = await updateResume({
      markdown: data.markdown,
      jobDescription: jobDescription.value,
      systemPrompt:
        llmSettings.value.enabled && llmSettings.value.systemPrompt
          ? llmSettings.value.systemPrompt
          : undefined
    });

    if (result.success) {
      setAndSyncToMonaco("markdown", result.markdown);

      await storageService.saveVersion(data.resumeId, {
        timestamp: Date.now(),
        markdown: result.markdown,
        css: data.css,
        styles: toRaw(styles),
        label: result.label || "LLM Update"
      });

      isOpen.value = false;
      jobDescription.value = "";
      toast({
        title: "Protocol Complete",
        description: `Optimized: ${result.label || "Resume updated"}`
      });
    }
  } catch (err: any) {
    console.error("LLM protocol failed:", err);
  }
};
</script>

<template>
  <!-- Tactical Dialog for Job Description -->
  <UiDialog v-model:open="isOpen">
    <UiDialogTrigger as-child>
      <UiButton class="gap-x-1.5 w-full h-8 justify-start" variant="ghost" size="sm">
        <span i-tabler:sparkles text-base />
        Update with Gemini
      </UiButton>
    </UiDialogTrigger>

    <UiDialogContent class="sm:max-w-lg tactical-dialog">
      <div class="tactical-header">
        <div class="tactical-corner tactical-corner--tl" />
        <div class="tactical-corner tactical-corner--tr" />
        <h2 class="tactical-title">TACTICAL RESUME UPDATE</h2>
        <p class="tactical-subtitle">// Initialize Gemini protocol for job targeting</p>
      </div>

      <div class="tactical-content space-y-4">
        <GeminiTacticalInput
          v-model="jobDescription"
          label="Job Description"
          hint="REQUIRED"
          placeholder="Paste target job description here..."
          :rows="6"
        />

        <div v-if="error" class="tactical-error">
          <span class="tactical-error-icon">!</span>
          <span class="tactical-error-text">{{ error }}</span>
        </div>

        <div class="tactical-status">
          <span class="tactical-status-label">System Prompt:</span>
          <span
            :class="
              settings.systemPrompt
                ? 'tactical-status-active'
                : 'tactical-status-inactive'
            "
          >
            {{ settings.systemPrompt ? "CONFIGURED" : "STANDARD" }}
          </span>
        </div>
      </div>

      <div class="tactical-footer">
        <GeminiTacticalButton variant="secondary" size="sm" @click="openSettings">
          <span class="i-tabler:settings mr-2" />
          CONFIG
        </GeminiTacticalButton>
        <div class="flex gap-2">
          <GeminiTacticalButton
            variant="ghost"
            size="sm"
            @click="isOpen = false"
            :disabled="isUpdating"
          >
            ABORT
          </GeminiTacticalButton>
          <GeminiTacticalButton
            variant="primary"
            size="sm"
            :loading="isUpdating"
            :disabled="!jobDescription.trim()"
            @click="handleUpdate"
          >
            <span v-if="!isUpdating" class="i-tabler:sparkles mr-2" />
            EXECUTE
          </GeminiTacticalButton>
        </div>
      </div>
    </UiDialogContent>
  </UiDialog>

  <!-- Tactical Settings Dialog -->
  <UiDialog v-model:open="isSettingsOpen">
    <UiDialogContent class="sm:max-w-lg tactical-dialog">
      <div class="tactical-header">
        <div class="tactical-corner tactical-corner--tl" />
        <div class="tactical-corner tactical-corner--tr" />
        <h2 class="tactical-title">SYSTEM CONFIGURATION</h2>
        <p class="tactical-subtitle">// Modify Gemini operational parameters</p>
      </div>

      <div class="tactical-content space-y-4">
        <GeminiTacticalToggle v-model="settings.enabled" label="Enable Gemini Protocol" />

        <GeminiTacticalInput
          v-model="settings.systemPrompt"
          label="System Prompt"
          hint="OPTIONAL"
          placeholder="Enter custom directives for Gemini..."
          :rows="5"
          :disabled="!settings.enabled"
        />

        <div class="tactical-info">
          <span class="tactical-info-marker">[i]</span>
          <span class="tactical-info-text"
            >System prompt prepends to all requests. Use to customize tone, style, or
            constraints.</span
          >
        </div>
      </div>

      <div class="tactical-footer">
        <GeminiTacticalButton variant="secondary" size="sm" @click="resetSettings">
          RESET
        </GeminiTacticalButton>
        <GeminiTacticalButton variant="primary" size="sm" @click="isSettingsOpen = false">
          CONFIRM
        </GeminiTacticalButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script lang="ts" setup>
import { useGemini, useGeminiSettings } from "~/composables";

const { data, setAndSyncToMonaco } = useDataStore();
const { isUpdating, error, updateResume } = useGemini();
const { settings, resetSettings } = useGeminiSettings();
const { toast } = useToast();

const isOpen = ref(false);
const isSettingsOpen = ref(false);
const jobDescription = ref("");

watch(isOpen, (open) => {
  if (open) error.value = null;
});

const openSettings = () => {
  isSettingsOpen.value = true;
};

const handleUpdate = async () => {
  if (!jobDescription.value.trim()) return;

  try {
    const result = await updateResume({
      markdown: data.markdown,
      jobDescription: jobDescription.value,
      systemPrompt:
        settings.value.enabled && settings.value.systemPrompt
          ? settings.value.systemPrompt
          : undefined
    });

    if (result.success) {
      setAndSyncToMonaco("markdown", result.markdown);
      isOpen.value = false;
      jobDescription.value = "";
      toast({
        title: "Protocol Complete",
        description: "Resume optimized for target position"
      });
    }
  } catch (err: any) {
    console.error("Gemini protocol failed:", err);
  }
};
</script>

<style scoped>
.tactical-dialog {
  @apply bg-card brutalist-border rounded-none brutalist-shadow;
  @apply p-0 overflow-hidden;
}

.tactical-header {
  @apply relative px-6 pt-8 pb-6;
  @apply bg-accent border-b-2 border-black dark:border-white;
}

.tactical-corner {
  @apply hidden;
}

.tactical-title {
  @apply font-black text-2xl text-white uppercase tracking-tighter;
}

.tactical-subtitle {
  @apply font-bold text-xs text-white/80 mt-1 uppercase;
}

.tactical-content {
  @apply px-6 py-6;
}

.tactical-footer {
  @apply flex justify-between items-center px-6 py-6;
  @apply border-t-2 border-black dark:border-white;
  @apply bg-muted/50;
}

.tactical-error {
  @apply flex items-center gap-3 px-4 py-3;
  @apply bg-danger text-white brutalist-border;
  @apply font-bold text-sm uppercase;
}

.tactical-error-icon {
  @apply w-6 h-6 flex items-center justify-center;
  @apply bg-white text-danger text-lg font-black brutalist-border;
}

.tactical-status {
  @apply flex items-center gap-2 font-black text-xs uppercase tracking-tight;
}

.tactical-status-label {
  @apply text-muted-foreground;
}

.tactical-status-active {
  @apply text-accent-foreground bg-accent px-2 py-0.5;
}

.tactical-status-inactive {
  @apply text-muted-foreground;
}

.tactical-info {
  @apply flex items-start gap-3 px-4 py-3;
  @apply bg-secondary/10 brutalist-border;
  @apply font-bold text-xs text-foreground uppercase;
}

.tactical-info-marker {
  @apply text-primary font-black;
}

.tactical-info-text {
  @apply leading-relaxed;
}
</style>

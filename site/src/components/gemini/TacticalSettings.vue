<template>
  <div class="tactical-settings">
    <div class="tactical-settings-header">
      <div class="tactical-corner tactical-corner--tl" />
      <div class="tactical-corner tactical-corner--tr" />
      <h2 class="tactical-settings-title">SYSTEM CONFIGURATION</h2>
      <p class="tactical-settings-subtitle">// Modify Gemini operational parameters</p>
    </div>

    <div class="tactical-settings-content space-y-4">
      <GeminiTacticalToggle
        v-model="localSettings.enabled"
        label="Enable Gemini Protocol"
      />

      <GeminiTacticalInput
        v-model="localSettings.systemPrompt"
        label="System Prompt"
        hint="OPTIONAL"
        placeholder="Enter custom directives for Gemini..."
        :rows="5"
        :disabled="!localSettings.enabled"
      />

      <div class="tactical-info">
        <span class="tactical-info-marker">[i]</span>
        <span class="tactical-info-text"
          >System prompt prepends to all requests. Use to customize tone, style, or
          constraints.</span
        >
      </div>
    </div>

    <div class="tactical-settings-footer">
      <GeminiTacticalButton variant="secondary" size="sm" @click="handleReset">
        RESET
      </GeminiTacticalButton>
      <GeminiTacticalButton variant="primary" size="sm" @click="handleSave">
        CONFIRM
      </GeminiTacticalButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useGeminiSettings } from "~/composables";

const { settings, updateSettings, resetSettings } = useGeminiSettings();

const localSettings = ref({ ...settings.value });

watch(
  settings,
  (newSettings) => {
    localSettings.value = { ...newSettings };
  },
  { deep: true }
);

const emit = defineEmits<{
  (e: "save"): void;
  (e: "reset"): void;
}>();

const handleSave = () => {
  updateSettings(localSettings.value);
  emit("save");
};

const handleReset = () => {
  resetSettings();
  localSettings.value = { ...settings.value };
  emit("reset");
};
</script>

<style scoped>
.tactical-settings {
  @apply bg-card brutalist-border rounded-none brutalist-shadow;
  @apply overflow-hidden;
}

.tactical-settings-header {
  @apply relative px-6 pt-8 pb-6;
  @apply bg-accent border-b-2 border-black dark:border-white;
}

.tactical-corner {
  @apply hidden;
}

.tactical-settings-title {
  @apply font-black text-2xl text-white uppercase tracking-tighter;
}

.tactical-settings-subtitle {
  @apply font-bold text-xs text-white/80 mt-1 uppercase;
}

.tactical-settings-content {
  @apply px-6 py-6;
}

.tactical-settings-footer {
  @apply flex justify-end gap-4 px-6 py-6;
  @apply border-t-2 border-black dark:border-white;
  @apply bg-muted/50;
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

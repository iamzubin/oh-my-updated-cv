<template>
  <div class="tactical-settings">
    <div class="tactical-settings-header">
      <div class="tactical-corner tactical-corner--tl" />
      <div class="tactical-corner tactical-corner--tr" />
      <h2 class="tactical-settings-title">LLM PROVIDER CONFIG</h2>
      <p class="tactical-settings-subtitle">
        // Select AI provider and configure API access
      </p>
    </div>

    <div class="tactical-settings-content space-y-4">
      <GeminiTacticalToggle v-model="localSettings.enabled" label="Enable LLM Update" />

      <div class="provider-section">
        <label class="provider-label">
          <span class="provider-label-text">PROVIDER</span>
        </label>
        <div class="provider-options">
          <button
            v-for="p in providers"
            :key="p.value"
            type="button"
            class="provider-option"
            :class="{ 'provider-option--active': localSettings.provider === p.value }"
            :disabled="!localSettings.enabled"
            @click="localSettings.provider = p.value"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <div class="api-key-section">
        <label class="provider-label">
          <span class="provider-label-text">API KEY</span>
          <span class="provider-hint">{{ providerHint }}</span>
        </label>
        <input
          v-model="localSettings.apiKey"
          type="password"
          class="api-key-input"
          :disabled="!localSettings.enabled"
          placeholder="Enter your API key..."
        />
      </div>

      <div v-if="localSettings.provider === 'custom'" class="custom-fields space-y-4">
        <div class="custom-field">
          <label class="provider-label">
            <span class="provider-label-text">API URL</span>
          </label>
          <input
            v-model="localSettings.apiUrl"
            type="text"
            class="api-key-input"
            :disabled="!localSettings.enabled"
            placeholder="https://api.openai.com/v1/chat/completions"
          />
        </div>
        <div class="custom-field">
          <label class="provider-label">
            <span class="provider-label-text">MODEL</span>
          </label>
          <input
            v-model="localSettings.model"
            type="text"
            class="api-key-input"
            :disabled="!localSettings.enabled"
            placeholder="gpt-4o-mini"
          />
        </div>
      </div>

      <GeminiTacticalInput
        v-model="localSettings.systemPrompt"
        label="System Prompt"
        hint="OPTIONAL"
        placeholder="Enter custom directives for the LLM..."
        :rows="5"
        :disabled="!localSettings.enabled"
      />

      <div class="tactical-info">
        <span class="tactical-info-marker">[i]</span>
        <span class="tactical-info-text"
          >API key is stored locally in your browser. Each provider requires their
          respective API key format.</span
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
import { useLLMProviderSettings } from "~/composables";

const { settings, updateSettings, resetSettings } = useLLMProviderSettings();

interface Provider {
  value: string;
  label: string;
}

const providers: Provider[] = [
  { value: "gemini", label: "GEMINI CLI" },
  { value: "claude", label: "CLAUDE API" },
  { value: "opencode-zen", label: "OPENCODE ZEN" }
];

const providerHint = computed(() => {
  switch (localSettings.value.provider) {
    case "gemini":
      return "Get from ai.google.dev";
    case "claude":
      return "Get from anthropic.com/settings/api-keys";
    case "opencode-zen":
      return "Get from opencode.ai/zen";
    default:
      return "";
  }
});

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
  @apply bg-card border border-border rounded-none;
  @apply overflow-hidden font-mono;
}

.tactical-settings-header {
  @apply relative px-6 pt-8 pb-6;
  @apply border-b border-border;
}

.tactical-corner {
  @apply hidden;
}

.tactical-settings-title {
  @apply text-xl text-foreground uppercase;
}

.tactical-settings-subtitle {
  @apply text-xs opacity-70 mt-1 uppercase;
}

.tactical-settings-content {
  @apply px-6 py-6;
}

.tactical-settings-footer {
  @apply flex justify-end gap-4 px-6 py-6;
  @apply border-t border-border;
  @apply bg-background;
}

.provider-section {
  @apply space-y-2;
}

.provider-label {
  @apply flex items-center justify-between;
}

.provider-label-text {
  @apply font-mono text-sm text-foreground tracking-tight;
}

.provider-hint {
  @apply font-mono text-xs text-muted-foreground;
}

.provider-options {
  @apply flex gap-2;
}

.provider-option {
  @apply px-4 py-2 text-xs font-bold uppercase tracking-wider;
  @apply border border-border bg-transparent text-foreground;
  @apply hover:border-primary hover:text-primary;
  @apply disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-foreground;
  @apply transition-all duration-150;
}

.provider-option--active {
  @apply border-primary bg-primary text-primary-foreground;
}

.provider-option--active:hover {
  @apply border-primary bg-primary text-primary-foreground;
}

.api-key-section {
  @apply space-y-2;
}

.api-key-input {
  @apply w-full p-3 min-h-[42px];
  @apply bg-background border border-border rounded-none;
  @apply font-mono text-sm text-foreground;
  @apply placeholder:text-muted-foreground/50;
  @apply focus:outline-none focus:ring-1 focus:ring-primary;
  @apply transition-all duration-150;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.api-key-input:focus {
  @apply shadow-none;
}

.tactical-info {
  @apply flex items-start gap-3 px-4 py-3;
  @apply bg-muted/20 border border-border;
  @apply text-xs text-foreground uppercase;
}

.tactical-info-marker {
  @apply text-primary font-bold;
}

.tactical-info-text {
  @apply leading-relaxed opacity-80;
}
</style>

export type Provider = "gemini" | "claude" | "opencode-zen" | "custom";

export interface ProviderConfig {
  apiKey: string;
}

export interface LLMProviderSettings {
  provider: Provider;
  gemini: ProviderConfig;
  claude: ProviderConfig;
  opencodeZen: ProviderConfig;
}

export interface LLMUpdateOptions {
  markdown: string;
  jobDescription: string;
  systemPrompt?: string;
}

export interface LLMUpdateResult {
  success: boolean;
  markdown: string;
  label?: string;
}

export interface LLMProviderSettingsUI {
  provider: Provider;
  apiKey: string;
  apiUrl: string;
  model: string;
  systemPrompt: string;
  enabled: boolean;
}

const SETTINGS_KEY = "llm-provider-settings";

export const useLLMProviderSettings = () => {
  const settings = useLocalStorage<LLMProviderSettingsUI>(SETTINGS_KEY, {
    provider: "gemini",
    apiKey: "",
    apiUrl: "",
    model: "",
    systemPrompt: "",
    enabled: true
  });

  const updateSettings = (newSettings: Partial<LLMProviderSettingsUI>) => {
    settings.value = { ...settings.value, ...newSettings };
  };

  const resetSettings = () => {
    settings.value = {
      provider: "gemini",
      apiKey: "",
      apiUrl: "",
      model: "",
      systemPrompt: "",
      enabled: true
    };
  };

  return {
    settings,
    updateSettings,
    resetSettings
  };
};

export const useLLMProvider = () => {
  const isUpdating = ref(false);
  const error = ref<string | null>(null);
  const { settings } = useLLMProviderSettings();

  const updateResume = async (options: LLMUpdateOptions): Promise<LLMUpdateResult> => {
    isUpdating.value = true;
    error.value = null;

    try {
      const result = await $fetch<LLMUpdateResult>("/api/llm/update", {
        method: "POST",
        body: {
          ...options,
          provider: settings.value.provider,
          apiKey: settings.value.apiKey,
          apiUrl: settings.value.apiUrl,
          model: settings.value.model
        }
      });

      return result;
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || err?.message || "Failed to update resume";
      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      isUpdating.value = false;
    }
  };

  return {
    isUpdating,
    error,
    updateResume
  };
};

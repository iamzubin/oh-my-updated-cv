export interface GeminiUpdateOptions {
  markdown: string;
  jobDescription: string;
  systemPrompt?: string;
}

export interface GeminiUpdateResult {
  success: boolean;
  markdown: string;
}

export interface GeminiSettings {
  systemPrompt: string;
  enabled: boolean;
}

const SETTINGS_KEY = "gemini-settings";

export const useGeminiSettings = () => {
  const settings = useLocalStorage<GeminiSettings>(SETTINGS_KEY, {
    systemPrompt: "",
    enabled: true
  });

  const updateSettings = (newSettings: Partial<GeminiSettings>) => {
    settings.value = { ...settings.value, ...newSettings };
  };

  const resetSettings = () => {
    settings.value = {
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

export const useGemini = () => {
  const isUpdating = ref(false);
  const error = ref<string | null>(null);

  const updateResume = async (
    options: GeminiUpdateOptions
  ): Promise<GeminiUpdateResult> => {
    isUpdating.value = true;
    error.value = null;

    try {
      const result = await $fetch<GeminiUpdateResult>("/api/gemini/update", {
        method: "POST",
        body: options
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

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
    provider: "opencode-zen",
    apiKey: "",
    apiUrl: "https://opencode.ai/zen/v1/chat/completions",
    model: "opencode/gpt-5-nano",
    systemPrompt: "",
    enabled: true
  });

  const updateSettings = (newSettings: Partial<LLMProviderSettingsUI>) => {
    settings.value = { ...settings.value, ...newSettings };
  };

  const resetSettings = () => {
    settings.value = {
      provider: "opencode-zen",
      apiKey: "",
      apiUrl: "https://opencode.ai/zen/v1/chat/completions",
      model: "opencode/gpt-5-nano",
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

const PROMPT_TEMPLATE = `Update the following resume to better match this job description. 
Make the resume more relevant by emphasizing skills, experiences, and keywords that match the job requirements.
Do not invent new experiences - only emphasize and rephrase existing content.
Preserve the original formatting and structure as much as possible.

IMPORTANT: You must return your response in the following JSON format:
{
  "markdown": "the updated resume markdown",
  "label": "a very short (2-4 words) descriptive name for this version based on the job title/company, e.g., 'Google SWE Update'"
}

Job Description:
{jobDescription}

Current Resume (in markdown format):
{markdown}`;

async function callOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callGoogleGenAI(
  apiKey: string,
  model: string,
  systemInstruction: string,
  userMessage: string
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          role: "user",
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          responseModalities: ["TEXT"]
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

function buildPrompt(
  jobDescription: string,
  markdown: string,
  systemPrompt?: string
): string {
  const userPrompt = PROMPT_TEMPLATE.replace("{jobDescription}", jobDescription).replace(
    "{markdown}",
    markdown
  );

  return systemPrompt ? `${systemPrompt}\n\n${userPrompt}` : userPrompt;
}

function parseResponse(modelResponse: string): { markdown: string; label: string } {
  const jsonMatch = modelResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    modelResponse = jsonMatch[1];
  }

  try {
    const result = JSON.parse(modelResponse);
    return {
      markdown: result.markdown || modelResponse,
      label: result.label || "LLM Update"
    };
  } catch {
    return {
      markdown: modelResponse,
      label: "LLM Update"
    };
  }
}

export const useLLMProvider = () => {
  const isUpdating = ref(false);
  const error = ref<string | null>(null);
  const { settings } = useLLMProviderSettings();

  const updateResume = async (options: LLMUpdateOptions): Promise<LLMUpdateResult> => {
    isUpdating.value = true;
    error.value = null;

    try {
      const { provider, apiKey, apiUrl, model, systemPrompt } = settings.value;
      const prompt = buildPrompt(options.jobDescription, options.markdown, systemPrompt);

      let modelResponse: string;

      switch (provider) {
        case "gemini":
          modelResponse = await callGoogleGenAI(
            apiKey,
            "gemini-2.0-flash",
            systemPrompt || "",
            prompt
          );
          break;

        case "claude":
          modelResponse = await callAnthropic(
            apiKey,
            "claude-sonnet-4-20250514",
            systemPrompt || "",
            prompt
          );
          break;

        case "opencode-zen":
        case "custom":
          if (!apiUrl || !model) {
            throw new Error("API URL and model are required");
          }
          modelResponse = await callOpenAICompatible(apiUrl, apiKey, model, [
            { role: "system", content: systemPrompt || "You are a helpful assistant." },
            { role: "user", content: prompt }
          ]);
          break;

        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      const result = parseResponse(modelResponse);

      return {
        success: true,
        markdown: result.markdown,
        label: result.label
      };
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to update resume";
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

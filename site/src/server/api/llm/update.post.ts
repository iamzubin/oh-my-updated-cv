type Provider = "gemini" | "claude" | "opencode-zen" | "custom";

interface LLMRequestBody {
  markdown: string;
  jobDescription: string;
  systemPrompt?: string;
  provider: Provider;
  apiKey: string;
  apiUrl?: string;
  model?: string;
}

interface LLMResponse {
  success: boolean;
  markdown: string;
  label?: string;
}

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

async function callGeminiCLI(prompt: string, apiKey: string): Promise<string> {
  const { execFile } = await import("child_process");
  const { promisify } = await import("util");
  const execFileAsync = promisify(execFile);

  const { stdout } = await execFileAsync(
    "gemini",
    ["-p", prompt, "-o", "json", "--api-key", apiKey],
    {
      timeout: 120000,
      maxBuffer: 1024 * 1024
    }
  );

  const resultJson = JSON.parse(stdout);
  return resultJson.response;
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

export default defineEventHandler(async (event): Promise<LLMResponse> => {
  const body = await readBody(event);
  const { markdown, jobDescription, systemPrompt, provider, apiKey, apiUrl, model } =
    body as LLMRequestBody;

  if (!markdown || typeof markdown !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing or invalid markdown content"
    });
  }

  if (!jobDescription || typeof jobDescription !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing or invalid job description"
    });
  }

  if (!apiKey) {
    throw createError({
      statusCode: 400,
      statusMessage: "API key is required"
    });
  }

  const prompt = buildPrompt(jobDescription, markdown, systemPrompt);

  try {
    let modelResponse: string;

    switch (provider) {
      case "gemini":
        modelResponse = await callGeminiCLI(prompt, apiKey);
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
        modelResponse = await callOpenAICompatible(
          "https://opencode.ai/zen/v1/chat/completions",
          apiKey,
          "opencode/gpt-5-nano",
          [
            { role: "system", content: systemPrompt || "You are a helpful assistant." },
            { role: "user", content: prompt }
          ]
        );
        break;

      case "custom":
        if (!apiUrl || !model) {
          throw new Error("Custom provider requires API URL and model");
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
  } catch (error: any) {
    console.error("LLM provider error:", error);

    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to update resume"
    });
  }
});

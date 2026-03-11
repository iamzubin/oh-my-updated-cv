import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { markdown, jobDescription, systemPrompt } = body;

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

  try {
    // Construct prompt with embedded job description and resume
    let userPrompt = `Update the following resume to better match this job description. 
Make the resume more relevant by emphasizing skills, experiences, and keywords that match the job requirements.
Do not invent new experiences - only emphasize and rephrase existing content.
Preserve the original formatting and structure as much as possible.

IMPORTANT: You must return your response in the following JSON format:
{
  "markdown": "the updated resume markdown",
  "label": "a very short (2-4 words) descriptive name for this version based on the job title/company, e.g., 'Google SWE Update'"
}

Job Description:
${jobDescription}

Current Resume (in markdown format):
${markdown}`;

    // Prepend system prompt if provided
    const prompt = systemPrompt ? `${systemPrompt}\n\n${userPrompt}` : userPrompt;

    // Execute Gemini CLI with the full prompt
    const { stdout } = await execFileAsync("gemini", ["-p", prompt, "-o", "json"], {
      timeout: 120000, // 2 minute timeout
      maxBuffer: 1024 * 1024 // 1MB buffer
    });

    const resultJson = JSON.parse(stdout);
    let modelResponse = resultJson.response;

    // Extract JSON from markdown blocks if present
    const jsonMatch = modelResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      modelResponse = jsonMatch[1];
    }

    let result;
    try {
      result = JSON.parse(modelResponse);
    } catch (e) {
      // Fallback if the model didn't return JSON (e.g., if system prompt forced markdown only)
      console.warn("Gemini model didn't return JSON, using raw response as markdown");
      return {
        success: true,
        markdown: modelResponse,
        label: "Gemini Update"
      };
    }

    // Return the updated markdown and label
    return {
      success: true,
      markdown: result.markdown || modelResponse,
      label: result.label || "Gemini Update"
    };
  } catch (error: any) {
    console.error("Gemini CLI error:", error);

    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to update resume with Gemini"
    });
  }
});

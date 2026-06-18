const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

/**
 * =========================
 * SAFE JSON PARSER
 * =========================
 */
function extractJSON(text) {
  if (!text) throw new Error("Empty AI response");

  try {
    return JSON.parse(text);
  } catch (err) {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  }
}

/**
 * =========================
 * RETRY WRAPPER (PRODUCTION SAFE)
 * =========================
 */
async function safeAI(prompt, retries = 3, delay = 1500) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return extractJSON(response.text);
  } catch (err) {
    console.log("❌ AI ERROR:", err.message);

    if (retries > 0) {
      console.log(`🔁 Retrying AI... attempts left: ${retries}`);

      await new Promise((r) => setTimeout(r, delay));

      return safeAI(prompt, retries - 1, delay * 2);
    }

    throw new Error("AI Service Failed After Retries");
  }
}

/**
 * =========================
 * INTERVIEW REPORT GENERATOR
 * =========================
 */
async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You are an expert recruiter and senior interview coach.

Return ONLY valid JSON. No markdown. No explanation.

Rules:
- matchScore must be 0–100
- At least 5 items in each array
- Be strict and realistic
- Never return empty arrays

CANDIDATE DATA:
Resume: ${resume}

Self Description: ${selfDescription}

Job Description: ${jobDescription}

OUTPUT FORMAT:
{
  "matchScore": number,

  "technicalQuestions": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],

  "behavioralQuestions": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],

  "skillGaps": [
    {
      "skill": "",
      "severity": "low|medium|high"
    }
  ],

  "preparationPlan": [
    {
      "day": 1,
      "focus": "",
      "tasks": ["task"]
    }
  ],

  "title": ""
}
`;

  return await safeAI(prompt);
}

/**
 * =========================
 * HTML → PDF GENERATOR
 * =========================
 */
async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    headless: "new",
  });

  const page = await browser.newPage();

  await page.setContent(htmlContent, {
    waitUntil: "networkidle0",
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();
  return pdfBuffer;
}

/**
 * =========================
 * RESUME PDF GENERATOR
 * =========================
 */
async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const prompt = `
Generate ATS-friendly professional resume HTML.

Return ONLY JSON:
{
  "html": "<html>...</html>"
}

Rules:
- Clean professional design
- ATS friendly format
- 1–2 pages max
- Human-like writing style
- No AI-looking formatting

Resume:
${resume}

Self:
${selfDescription}

Job:
${jobDescription}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const json = extractJSON(response.text);

  if (!json?.html) {
    throw new Error("Invalid resume HTML from AI");
  }

  return await generatePdfFromHtml(json.html);
}

module.exports = {
  generateInterviewReport,
  generateResumePdf,
};

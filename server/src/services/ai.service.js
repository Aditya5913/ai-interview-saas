const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

/**
 * SAFE JSON PARSER
 */
function extractJSON(text) {
  if (!text) throw new Error("Empty AI response");

  try {
    return JSON.parse(text);
  } catch (err) {
    try {
      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(cleaned);
    } catch (e) {
      console.log("JSON PARSE FAILED:", text);
      throw new Error("Invalid AI JSON Response");
    }
  }
}

/**
 * SAFE AI CALL (NO CRASH)
 */
async function safeAI(prompt, retries = 2) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text =
      response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;

    return extractJSON(text);
  } catch (err) {
    console.log("❌ AI ERROR:", err.message);

    if (retries > 0) {
      console.log("🔁 Retrying AI...");
      await new Promise((r) => setTimeout(r, 1500));

      return safeAI(prompt, retries - 1);
    }

    // SAFE FALLBACK (NO CRASH)
    return {
      matchScore: 0,
      technicalQuestions: [],
      behavioralQuestions: [],
      skillGaps: [],
      preparationPlan: [],
      title: "AI temporarily unavailable",
    };
  }
}

/**
 * INTERVIEW REPORT
 */
async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You are an expert recruiter.

Return ONLY valid JSON.

Rules:
- matchScore 0-100
- realistic answers
- no markdown

DATA:
Resume: ${resume}
Self: ${selfDescription}
Job: ${jobDescription}

FORMAT:
{
  "matchScore": number,
  "technicalQuestions": [],
  "behavioralQuestions": [],
  "skillGaps": [],
  "preparationPlan": [],
  "title": ""
}
`;

  return await safeAI(prompt);
}

/**
 * PDF GENERATOR
 */
async function generatePdfFromHtml(htmlContent) {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
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

    return pdfBuffer;
  } catch (err) {
    console.log("PDF ERROR:", err.message);
    throw new Error("PDF generation failed");
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * RESUME PDF GENERATOR
 */
async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const prompt = `
Generate ATS friendly resume.

Return ONLY JSON:
{
  "html": "<html></html>"
}

Resume: ${resume}
Self: ${selfDescription}
Job: ${jobDescription}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text =
    response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;

  const json = extractJSON(text);

  if (!json?.html) {
    throw new Error("Invalid resume HTML");
  }

  return await generatePdfFromHtml(json.html);
}

module.exports = {
  generateInterviewReport,
  generateResumePdf,
};

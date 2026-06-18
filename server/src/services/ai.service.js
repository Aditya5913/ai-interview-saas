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
  if (!text) {
    console.log("❌ Empty AI response");
    throw new Error("Empty AI response");
  }

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
      console.log("❌ JSON PARSE FAILED RAW:", text);

      // SAFE FALLBACK
      return {
        matchScore: 0,
        technicalQuestions: [],
        behavioralQuestions: [],
        skillGaps: [],
        preparationPlan: [],
        title: "AI parse failed",
      };
    }
  }
}

/**
 * =========================
 * SAFE AI CALL (PRODUCTION READY)
 * =========================
 */
async function safeAI(prompt, retries = 3) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro", // 🔥 STABLE MODEL (IMPORTANT FIX)
      contents: prompt,
    });

    // 🔥 FIXED RESPONSE EXTRACTION (MAIN BUG FIX)
    const text =
      response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      response?.text ||
      "";

    console.log("✅ AI RAW TEXT:", text);

    return extractJSON(text);
  } catch (err) {
    console.log("❌ AI ERROR:", err.message);

    if (retries > 0) {
      console.log(`🔁 Retrying AI... attempts left: ${retries}`);

      await new Promise((r) => setTimeout(r, 2000));

      return safeAI(prompt, retries - 1);
    }

    // 🚨 FINAL FALLBACK (NO CRASH)
    return {
      matchScore: 40,
      technicalQuestions: [
        {
          question: "Explain your technical background",
          intention: "General evaluation",
          answer: "Describe your core skills clearly",
        },
      ],
      behavioralQuestions: [
        {
          question: "Tell me about a challenge you faced",
          intention: "Behavioral check",
          answer: "Use STAR method (Situation, Task, Action, Result)",
        },
      ],
      skillGaps: [
        {
          skill: "AI temporarily unavailable",
          severity: "medium",
        },
      ],
      preparationPlan: [
        {
          day: 1,
          focus: "Revise fundamentals",
          tasks: ["Practice coding", "Revise core concepts"],
        },
      ],
      title: "AI Fallback Report",
    };
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
You are an expert recruiter AI.

Return ONLY valid JSON.

RULES:
- matchScore must be 0-100
- minimum 3 items per array
- realistic answers
- no markdown

DATA:
Resume: ${resume}

Self: ${selfDescription}

Job: ${jobDescription}

OUTPUT FORMAT:
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
 * =========================
 * PDF GENERATOR (RENDER SAFE)
 * =========================
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
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
    });

    return pdfBuffer;
  } catch (err) {
    console.log("❌ PDF ERROR:", err.message);
    throw new Error("PDF generation failed");
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * =========================
 * RESUME PDF GENERATOR
 * =========================
 */
async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const prompt = `
Generate ATS-friendly resume HTML.

Return ONLY JSON:
{
  "html": "<html></html>"
}

RULES:
- professional ATS format
- clean structure
- no fancy styling

Resume:
${resume}

Self:
${selfDescription}

Job:
${jobDescription}
`;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-pro", // 🔥 FIXED MODEL
    contents: prompt,
  });

  const text =
    response?.candidates?.[0]?.content?.parts?.[0]?.text ||
    response?.text ||
    "";

  const json = extractJSON(text);

  if (!json?.html) {
    throw new Error("Invalid resume HTML from AI");
  }

  return await generatePdfFromHtml(json.html);
}

module.exports = {
  generateInterviewReport,
  generateResumePdf,
};

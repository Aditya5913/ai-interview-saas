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
    try {
      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(cleaned);
    } catch (e) {
      console.log("❌ JSON PARSE FAILED:", text);

      // SAFE FALLBACK
      return {
        matchScore: 0,
        technicalQuestions: [],
        behavioralQuestions: [],
        skillGaps: [],
        preparationPlan: [],
        title: "AI response parse failed",
      };
    }
  }
}

/**
 * =========================
 * SAFE AI CALL (NO CRASH SYSTEM)
 * =========================
 */
async function safeAI(prompt, retries = 2) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // ✅ FIXED STABLE MODEL
      contents: prompt,
    });

    const text =
      response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;

    return extractJSON(text);
  } catch (err) {
    console.log("❌ AI ERROR:", err.message);

    if (retries > 0) {
      console.log(`🔁 Retrying AI... (${retries})`);

      await new Promise((r) => setTimeout(r, 1500));

      return safeAI(prompt, retries - 1);
    }

    // FINAL SAFE FALLBACK (NO CRASH)
    return {
      matchScore: 50,
      technicalQuestions: [
        {
          question: "Tell me about your technical skills",
          intention: "General assessment",
          answer: "Practice core fundamentals",
        },
      ],
      behavioralQuestions: [
        {
          question: "Describe a challenge you faced",
          intention: "Behavior check",
          answer: "Explain with STAR method",
        },
      ],
      skillGaps: [
        {
          skill: "System temporarily unavailable",
          severity: "medium",
        },
      ],
      preparationPlan: [
        {
          day: 1,
          focus: "Revise basics",
          tasks: ["Practice coding", "Review concepts"],
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
You are a senior recruiter AI.

Return ONLY valid JSON.

Rules:
- matchScore 0 to 100
- realistic answers
- no markdown
- at least 3 items per list

DATA:
Resume: ${resume}

Self Description: ${selfDescription}

Job Description: ${jobDescription}

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
  "html": "<html>...</html>"
}

Rules:
- clean professional design
- ATS friendly
- no fancy styling

Resume:
${resume}

Self:
${selfDescription}

Job:
${jobDescription}
`;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash", // ✅ FIXED
    contents: prompt,
  });

  const text =
    response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;

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

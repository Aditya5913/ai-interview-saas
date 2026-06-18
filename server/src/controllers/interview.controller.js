const pdfParse = require("pdf-parse");

const {
  generateInterviewReport,
  generateResumePdf,
} = require("../services/ai.service");

const interviewReportModel = require("../models/interviewReport.model");

/**
 * Generate interview report (SAFE VERSION)
 */
async function generateInterViewReportController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Resume file is required",
      });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text || "";

    const { selfDescription, jobDescription } = req.body;

    if (!jobDescription || !selfDescription) {
      return res.status(400).json({
        message: "Job description and self description are required",
      });
    }

    // ----------------------------
    // SAFE AI CALL (NO CRASH)
    // ----------------------------
    let aiReport;

    try {
      aiReport = await generateInterviewReport({
        resume: resumeText,
        selfDescription,
        jobDescription,
      });
    } catch (aiError) {
      console.log("⚠️ AI ERROR HANDLED:", aiError.message);

      aiReport = {
        title: "AI Report Temporarily Unavailable",
        matchScore: 0,
        technicalQuestions: [],
        behavioralQuestions: [],
        skillGaps: [],
        preparationPlan: [],
      };
    }

    // ----------------------------
    // SAFE DB SAVE
    // ----------------------------
    const interviewReport = await interviewReportModel.create({
      user: req.user?.id,
      resume: resumeText,
      selfDescription,
      jobDescription,

      title: aiReport?.title || "Interview Report",
      matchScore: aiReport?.matchScore || 0,
      technicalQuestions: aiReport?.technicalQuestions || [],
      behavioralQuestions: aiReport?.behavioralQuestions || [],
      skillGaps: aiReport?.skillGaps || [],
      preparationPlan: aiReport?.preparationPlan || [],
    });

    return res.status(201).json({
      message: "Interview report generated successfully.",
      interviewReport,
    });
  } catch (error) {
    console.log("❌ CONTROLLER ERROR:", error);

    return res.status(500).json({
      message: "Error generating interview report",
      error: error.message,
    });
  }
}

/**
 * Get single report
 */
async function getInterviewReportByIdController(req, res) {
  try {
    const interviewReport = await interviewReportModel.findOne({
      _id: req.params.interviewId,
      user: req.user.id,
    });

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found.",
      });
    }

    return res.status(200).json({
      message: "Interview report fetched successfully.",
      interviewReport,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

/**
 * Get all reports
 */
async function getAllInterviewReportsController(req, res) {
  try {
    const interviewReports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Interview reports fetched successfully.",
      interviewReports,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

/**
 * Generate Resume PDF
 */
async function generateResumePdfController(req, res) {
  try {
    const interviewReport = await interviewReportModel.findById(
      req.params.interviewReportId,
    );

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found.",
      });
    }

    const pdfBuffer = await generateResumePdf({
      resume: interviewReport.resume,
      jobDescription: interviewReport.jobDescription,
      selfDescription: interviewReport.selfDescription,
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume.pdf`,
    });

    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({
      message: "Error generating PDF",
      error: error.message,
    });
  }
}

// ----------------------------
// EXPORTS (DO NOT CHANGE THIS)
// ----------------------------
module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};

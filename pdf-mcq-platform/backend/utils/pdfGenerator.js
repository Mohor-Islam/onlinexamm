// pdfkit দিয়ে Leaderboard PDF এবং Result+Answer PDF জেনারেট করার ফাংশন
const PDFDocument = require("pdfkit");

/**
 * Leaderboard কে PDF stream হিসেবে রেসপন্সে পাইপ করে দেয়
 * attempts: [{ studentName, studentMobile, score, timeTakenSeconds }] (rank অনুযায়ী sorted থাকতে হবে)
 */
function generateLeaderboardPdf(res, examTitle, attempts) {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=leaderboard-${Date.now()}.pdf`);
  doc.pipe(res);

  doc.fontSize(18).text(`Leaderboard: ${examTitle}`, { align: "center" });
  doc.moveDown();

  // টেবিল হেডার
  const tableTop = doc.y;
  const colX = { rank: 40, name: 90, mobile: 260, score: 380, time: 450 };

  doc.fontSize(11).font("Helvetica-Bold");
  doc.text("Rank", colX.rank, tableTop);
  doc.text("Name", colX.name, tableTop);
  doc.text("Mobile", colX.mobile, tableTop);
  doc.text("Score", colX.score, tableTop);
  doc.text("Time Taken", colX.time, tableTop);
  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();

  doc.font("Helvetica");
  attempts.forEach((a, idx) => {
    const y = doc.y + 6;
    if (y > 760) {
      doc.addPage();
    }
    const rowY = doc.y + 6;
    doc.text(`${idx + 1}`, colX.rank, rowY);
    doc.text(a.studentName, colX.name, rowY, { width: 160 });
    doc.text(a.studentMobile, colX.mobile, rowY);
    doc.text(`${a.score}`, colX.score, rowY);
    doc.text(formatSeconds(a.timeTakenSeconds), colX.time, rowY);
    doc.moveDown(1);
  });

  doc.end();
}

/**
 * একজন Student এর Result + সঠিক উত্তর (Answer Key) সহ PDF জেনারেট করে
 */
function generateResultPdf(res, exam, attempt) {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=result-${Date.now()}.pdf`);
  doc.pipe(res);

  doc.fontSize(18).text(`Result: ${exam.title}`, { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Name: ${attempt.studentName}`);
  doc.text(`Mobile: ${attempt.studentMobile}`);
  doc.text(`Score: ${attempt.score} / ${attempt.totalQuestions}`);
  doc.text(`Time Taken: ${formatSeconds(attempt.timeTakenSeconds)}`);
  doc.moveDown();
  doc.font("Helvetica-Bold").text("Answer Key:");
  doc.font("Helvetica");
  doc.moveDown(0.5);

  exam.questions.forEach((q) => {
    const given = attempt.answers.find((a) => a.questionNo === q.questionNo);
    const givenOpt = given ? given.selectedOption : "—";
    const isCorrect = givenOpt === q.correctAnswer;

    doc.fontSize(11).text(`${q.questionNo}. ${q.questionText}`);
    doc.text(
      `Your Answer: ${givenOpt || "—"}   |   Correct Answer: ${q.correctAnswer}   |   ${
        isCorrect ? "✅ Correct" : "❌ Wrong"
      }`
    );
    doc.moveDown(0.6);
    if (doc.y > 750) doc.addPage();
  });

  doc.end();
}

function formatSeconds(totalSeconds = 0) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s}s`;
}

module.exports = { generateLeaderboardPdf, generateResultPdf };

// এই ফাইলটাই PDF Upload এর পরে আসল "ম্যাজিক" করে -
// pdf-parse দিয়ে PDF থেকে raw text বের করে, তারপর regex দিয়ে প্রশ্ন-অপশন-উত্তর আলাদা করে।
//
// প্রত্যাশিত ফরম্যাট (প্রতিটি প্রশ্নের জন্য):
// 1. প্রশ্নের লেখা?
// A. অপশন
// B. অপশন
// C. অপশন
// D. অপশন
// Answer: C

const pdfParse = require("pdf-parse");

/**
 * PDF বাফার থেকে raw text বের করে
 */
async function extractTextFromPdf(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

/**
 * Raw text থেকে প্রশ্ন গুলো parse করে একটা array রিটার্ন করে
 * প্রতিটি item: { questionNo, questionText, options: {A,B,C,D}, correctAnswer }
 */
function parseQuestionsFromText(rawText) {
  // লাইন গুলোকে পরিষ্কার করা - খালি লাইন ও extra স্পেস বাদ দেওয়া
  const normalized = rawText
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  // প্রতিটা প্রশ্ন ব্লক আলাদা করার জন্য মূল regex।
  // প্যাটার্ন: নাম্বার. প্রশ্ন ... A. ... B. ... C. ... D. ... Answer: X
  const questionBlockRegex =
    /(\d+)\.\s*(.+?)\s*A\.\s*(.+?)\s*B\.\s*(.+?)\s*C\.\s*(.+?)\s*D\.\s*(.+?)\s*Answer\s*:\s*([A-D])/gis;

  const questions = [];
  let match;

  while ((match = questionBlockRegex.exec(normalized)) !== null) {
    const [, qNo, qText, optA, optB, optC, optD, answer] = match;

    questions.push({
      questionNo: parseInt(qNo, 10),
      questionText: qText.trim().replace(/\s+/g, " "),
      options: {
        A: optA.trim().replace(/\s+/g, " "),
        B: optB.trim().replace(/\s+/g, " "),
        C: optC.trim().replace(/\s+/g, " "),
        D: optD.trim().replace(/\s+/g, " "),
      },
      correctAnswer: answer.trim().toUpperCase(),
    });
  }

  return questions;
}

/**
 * মূল ফাংশন - PDF বাফার নিয়ে সরাসরি parsed questions array রিটার্ন করে
 */
async function parsePdfToQuestions(buffer) {
  const rawText = await extractTextFromPdf(buffer);
  const questions = parseQuestionsFromText(rawText);

  if (questions.length === 0) {
    throw new Error(
      "PDF থেকে কোনো প্রশ্ন পার্স করা যায়নি। PDF টি অবশ্যই '1. প্রশ্ন? A. .. B. .. C. .. D. .. Answer: X' এই ফরম্যাটে হতে হবে।"
    );
  }

  return questions;
}

module.exports = { parsePdfToQuestions, parseQuestionsFromText, extractTextFromPdf };

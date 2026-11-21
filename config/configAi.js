const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const apiKey = process.env.genAI || process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Warning: GenAI API Key is missing in .env file (process.env.genAI)");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Model gemini-2.5-flash configured with native JSON mode
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});

// Export both model directly and getGenAiModel function for compatibility
module.exports = {
  model,
  getGenAiModel: () => model,
};
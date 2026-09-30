const Groq = require("groq-sdk");

const SYSTEM_PROMPT = `You are KhetiX AI, a helpful smart farming assistant for Indian farmers.
Answer clearly about crops, soil, irrigation, weather, pests, fertilizers, and farm planning.
Keep answers practical, short, and easy to understand.
Reply in the same language the farmer uses (Hindi, English, or Hinglish).`;

let groqClient = null;

const getClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }

  return groqClient;
};

const sanitizeMessages = (history = []) => {
  if (!Array.isArray(history)) return [];

  return history
    .filter(
      (item) =>
        item &&
        ["user", "assistant"].includes(item.role) &&
        typeof item.content === "string" &&
        item.content.trim().length > 0
    )
    .slice(-10)
    .map((item) => ({
      role: item.role,
      content: item.content.trim()
    }));
};

const chatWithGroq = async ({ message, history = [] }) => {
  const groq = getClient();
  const cleanedHistory = sanitizeMessages(history);

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...cleanedHistory,
      { role: "user", content: message.trim() }
    ],
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    temperature: 1,
    max_completion_tokens: 2048,
    top_p: 1,
    reasoning_effort: "medium"
  });

  const reply = completion.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error("Empty response from AI");
  }

  return {
    reply,
    model: completion.model
  };
};

module.exports = {
  chatWithGroq
};

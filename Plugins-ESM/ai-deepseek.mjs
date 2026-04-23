import axios from "axios";

/* ============================= */
/* CONVERSATION ID GENERATOR    */
/* ============================= */

function generateConversationId() {
  return Date.now().toString(16) + "-" + Math.random().toString(16).slice(2, 10);
}

/* ============================= */
/* DEEPSEEK API FUNCTION        */
/* ============================= */

async function deepseekAPI(message) {
  const conversation_id = generateConversationId();

  const url = "https://notegpt.io/api/v2/chat/stream";
  const headers = { "Content-Type": "application/json" };

  const payload = {
    message,
    language: "auto",
    model: "deepseek-chat",
    tone: "default",
    length: "moderate",
    conversation_id,
    image_urls: [],
    chat_mode: "standard",
  };

  try {
    const response = await axios.post(url, payload, {
      headers,
      responseType: "stream",
    });

    return new Promise((resolve, reject) => {
      let fullText = "";

      response.data.on("data", chunk => {
        const lines = chunk.toString().split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const json = JSON.parse(jsonStr);
            if (json.text) fullText += json.text;
            if (json.done) resolve(fullText.trim());
          } catch {

          }
        }
      });

      response.data.on("error", err => reject(err));
    });

  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

/* ============================= */
/* HANDLER                      */
/* ============================= */

const handler = async (m, { reply, args }) => {
  try {
    if (!args.length) return reply("❌ Masukkan pertanyaan.\nContoh: .deepseek apa itu html?");

    const question = args.join(" ");
    reply("⏳ Sedang memproses jawaban DeepSeek...");

    const answer = await deepseekAPI(question);

    reply(`🟢 DeepSeek:\n${answer}`);
  } catch (err) {
    console.error(err);
    reply(`❌ Terjadi error:\n${err.message}`);
  }
};

/* ============================= */
/* EXPORT                       */
/* ============================= */

handler.help = ["deepseek <teks>"];
handler.tags = ["ai"];
handler.command = ["deepseek", "ds"];

export default handler;
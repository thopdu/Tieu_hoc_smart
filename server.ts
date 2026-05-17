import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// API: Generate Questions
app.post("/api/generate-questions", async (req, res) => {
  const { grade, subject, topic, difficulty, count = 5 } = req.body;

  try {
    const prompt = `Bạn là một chuyên gia giáo dục tiểu học tại Việt Nam. 
    Hãy tạo ra ${count} câu hỏi ôn tập cho học sinh Lớp ${grade}, môn ${subject}${topic ? `, chủ đề: "${topic}"` : ''}.
    Mô tả yêu cầu về độ khó: ${difficulty}.
    Chương trình: Kết nối tri thức và cuộc sống.
    
    Yêu cầu định dạng JSON:
    {
      "questions": [
        {
          "id": "string",
          "type": "multiple_choice | fill_in_blank | drag_drop",
          "questionText": "string",
          "options": ["string"] (nếu là trắc nghiệm, cung cấp 4 phương án),
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  questionText: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "type", "questionText", "correctAnswer", "explanation"]
              }
            }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }

    const data = JSON.parse(response.text);
    console.log("Generated questions successfully");
    res.json(data);
  } catch (error: any) {
    console.error("Gemini Error Details:", error);
    res.status(500).json({ 
      error: "Failed to generate questions", 
      details: error.message 
    });
  }
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

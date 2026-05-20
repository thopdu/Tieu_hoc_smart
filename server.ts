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

// Add COOP header for Firebase Auth popups
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

// API: Generate Questions
app.post("/api/generate-questions", async (req, res) => {
  const { grade, subject, topic, difficulty, count = 5, mode = "normal" } = req.body;

  try {
    const isSemesterReview = ["semester_review", "midterm_review", "final_review", "mock_exam"].includes(mode);
    const isVietnamese = subject === "Tiếng Việt";
    const isEnglish = subject === "Tiếng Anh" || subject === "English";

    let prompt = `Bạn là một chuyên gia giáo dục tiểu học hàng đầu tại Việt Nam. 
    Hãy tạo ra ${count} câu hỏi ôn tập cho học sinh Lớp ${grade}, môn ${subject}${topic ? `, chủ đề: "${topic}"` : ''}.
    Mô tả yêu cầu về độ khó: ${difficulty}.
    Chương trình: Kết nối tri thức và cuộc sống mới nhất.`;

    if (subject === "Toán") {
      prompt += `\n\nYÊU CẦU ĐẶC BIỆT CHO MÔN TOÁN:
      - KHÔNG ĐƯỢC phép thêm khoảng trắng (khoảng cách) để phân tách hàng nghìn trong bất kỳ số nào (Ví dụ: viết "1000", "25000" thay vì "1 000", "25 000").
      - Tất cả các con số trong đề bài, đáp án lựa chọn, đáp án đúng và phần lời giải thích đều phải viết liền và không có khoảng trắng xen giữa các chữ số hàng nghìn.`;
    }

    if (isVietnamese && isSemesterReview) {
      prompt += `\n\nYÊU CẦU ĐẶC BIỆT CHO ĐỀ THI / ÔN TẬP TIẾNG VIỆT GIỮA KỲ VÀ CUỐI KỲ:
      1. Đề thi phải mô phỏng cấu trúc chuẩn: "II. KIỂM TRA ĐỌC HIỂU (6,0 điểm) - Thời gian 30 phút".
      2. Bạn phải tạo ra một văn bản bài đọc thầm thú vị, giàu ý nghĩa nhân văn, giáo dục và tình cảm (VD: tình cảm gia đình, bạn bè, thầy cô, quê hương đất nước giống như câu chuyện "Con búp bê bằng vải"). Cung cấp văn bản này trong trường 'readingPassage' (title và content) ở tất cả các câu hỏi thuộc phần đọc hiểu (khoảng 5-6 câu hỏi đầu tiên).
      3. Thiết lập thuộc tính 'points' cụ thể cho từng câu hỏi (VD: các câu hỏi trắc nghiệm Đọc hiểu có điểm là 0.5 điểm; câu hỏi tự luận ngắn hoặc luyện từ và câu nâng cao có điểm là 1.0 điểm). Tổng điểm của đề là 10.
      4. Hãy phân chia 'section' tương ứng, ví dụ: "A. Đọc thầm và trả lời câu hỏi" và "B. Luyện từ và câu".
      5. Đa dạng hóa loại câu hỏi:
         - Các câu hỏi tìm hiểu nội dung bài học có kí hiệu mức độ ở đề bài (ví dụ: "Câu 1 – M1: ... (0,5 điểm)", "Câu 4 – M2: ...").
         - Có ít nhất 1-2 câu hỏi Trắc nghiệm đúng/sai hoặc trắc nghiệm lựa chọn (VD: Đúng ghi Đ, sai ghi S).
         - Có ít nhất 2 câu hỏi Tự luận ngắn ('fill_in_blank') để viết câu, cảm thụ văn học hoặc tìm từ (VD: "Câu 5 – M3: Qua câu chuyện trên em học tập được đức tính gì ở Thủy? (1,0 điểm)").
         - Đối với phần Tiếng Việt Luyện từ và câu, tạo các câu hỏi chất lượng cao về so sánh, nhân hóa, dấu câu (dấu kể, dấu cảm, dấu gạch ngang, dấu hai chấm), đặt câu kể, câu khiến, câu cảm theo chuẩn chương trình Kết nối tri thức lớp ${grade}.`;
    } else if (isEnglish) {
      prompt += `\n\nYÊU CẦU ĐẶC BIỆT CHO MÔN TIẾNG ANH:
      1. Nếu chủ đề có chứa "Listening" hoặc "Nghe", bạn BẮT BUỘC phải tạo ra văn bản/hội thoại cần nghe đặt trong trường 'readingPassage' (với title: "Listening Transcript" hoặc tương tự, và content: nội dung đoạn văn/hội thoại bằng tiếng Anh để phần mềm đọc tự động cho học sinh nghe).
      2. Nếu là đề thi/ôn tập học kỳ (midterm, final v.v.), hãy lồng ghép ít nhất 1-2 câu hỏi Listening bằng cách cung cấp trường 'readingPassage' tương tự.
      3. Toàn bộ câu hỏi, phương án trả lời và nội dung bài đọc bằng Tiếng Anh chuẩn tiểu học, riêng trường 'explanation' (giải thích) viết bằng Tiếng Việt để hỗ trợ học sinh học tập tốt nhất.`;
    } else if (isSemesterReview) {
      prompt += `\n\nYÊU CẦU ĐẶC BIỆT CHO ÔN TẬP HỌC KỲ / ĐỀ THI:
      1. Chia đề làm các phần rõ rệt (Trắc nghiệm chiếm 60%, Tự luận chiếm 40%).
      2. Mỗi câu hỏi cần có điểm số cụ thể (field: points) sao cho tổng điểm toàn bộ đề thi là 10.
      3. Nội dung ôn tập bám sát chương trình với các câu hỏi đa dạng, bao quát các mảng kiến thức cốt lõi.`;
    }

    prompt += `\n\nYêu cầu định dạng JSON chính xác:
    {
      "questions": [
        {
          "id": "string",
          "type": "multiple_choice | fill_in_blank",
          "section": "string" (Tên phân đoạn, ví dụ: "I. PHẦN TRẮC NGHIỆM" hoặc "II. ĐỌC HIỂU" hoặc "LUYỆN TỪ VÀ CÂU"),
          "points": number (số điểm cho câu này, ví dụ: 0.5 hoặc 1.0),
          "questionText": "string",
          "options": ["string"] (nếu là trắc nghiệm, cung cấp đúng 4 phương án lựa chọn),
          "correctAnswer": "string" (đáp án đúng),
          "explanation": "string" (giải thích tường tận vì sao đúng hoặc gợi ý chấm điểm tự luận),
          "readingPassage": {
            "title": "string" (tên bài đọc),
            "content": "string" (nội dung chi tiết bài đọc thầm, sử dụng các ký tự xuống dòng '\\n' để phân đoạn rõ nét cho trang nhã)
          } [optional]
        }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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
                  section: { type: Type.STRING },
                  points: { type: Type.NUMBER },
                  questionText: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  readingPassage: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      content: { type: Type.STRING }
                    },
                    required: ["title", "content"]
                  }
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

    // Clean any thousands spaces between digits for Mathematics
    if (subject === "Toán" && data.questions && Array.isArray(data.questions)) {
      const cleanMathNumbers = (str: any): any => {
        if (typeof str !== "string") return str;
        // Strip out spaces specifically when placed between two digits (e.g., "1 000" -> "1000")
        return str.replace(/(\d)\s+(\d)/g, "$1$2");
      };

      data.questions = data.questions.map((q: any) => {
        const cleaned: any = { ...q };
        if (cleaned.questionText) cleaned.questionText = cleanMathNumbers(cleaned.questionText);
        if (Array.isArray(cleaned.options)) {
          cleaned.options = cleaned.options.map((opt: any) => cleanMathNumbers(opt));
        }
        if (cleaned.correctAnswer) cleaned.correctAnswer = cleanMathNumbers(cleaned.correctAnswer);
        if (cleaned.explanation) cleaned.explanation = cleanMathNumbers(cleaned.explanation);
        return cleaned;
      });
    }

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

// API: Analyze Study Progress & Output Expert Pedagogy Report
app.post("/api/analyze-progress", async (req, res) => {
  const { results, grade, displayName } = req.body;

  try {
    const prompt = `Bạn là một chuyên gia tâm lý giáo dục tiểu học và là cố vấn học tập hàng đầu Việt Nam.
    Hãy phân tích kết quả học tập và ôn tập dưới đây của học sinh tên "${displayName}" (Lớp ${grade}) và viết một bản đánh giá sự tiến bộ toàn diện, chỉ ra điểm mạnh, điểm yếu và các chuyên đề cần cải tiến bám sát chương trình sách giáo khoa mới (Kết nối tri thức và cuộc sống).

    Dữ liệu kết quả các lần làm bài tập ôn luyện gần đây:
    ${JSON.stringify(results, null, 2)}

    Yêu cầu nội dung bản đánh giá bằng tiếng Việt:
    1. Đánh giá sự tiến bộ (overallSummary): Lời động viên chân thành mang tính khích lệ như thầy cô/cha mẹ, chỉ ra chỉ số phần trăm trung bình hoặc tần suất luyện tập. Nhận xét một cách ấm áp, khích lệ lòng ham học hỏi của em.
    2. Điểm mạnh nổi bật (strengths): Liệt kê 2-3 điểm mạnh rõ rệt từ các môn học (Toán, Tiếng Việt, Tiếng Anh) dựa trên dữ liệu làm bài điểm cao (>= 80%).
    3. Điểm cần cải tiến (weaknesses): Liệt kê 2-3 phần kiến thức hoặc kỹ năng em còn chưa tốt, làm bài điểm thấp (< 70%), ví dụ như kỹ năng nghe nghe phát âm (English Listening), các bài toán diện tích, hay xác định từ loại danh-động-tính từ trong đoạn văn (Tiếng Việt).
    4. Các bước hành động rèn luyện tiếp theo (suggestions): Liệt kê 3 gợi ý hoặc cách khắc phục thực tế, bám sát sách Kết nối tri thức để cải thiện điểm số (VD: làm thêm các bài toán đố lớp có lời văn, ôn lại Biện pháp tu từ So sánh lớp 3, v.v.).

    Yêu cầu định dạng JSON chính xác:
    {
      "overallSummary": "string",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "suggestions": ["string"]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallSummary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["overallSummary", "strengths", "weaknesses", "suggestions"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No feedback response from Gemini");
    }

    const data = JSON.parse(response.text);
    res.json(data);
  } catch (error: any) {
    console.error("Progress Analysis Error:", error);
    res.status(500).json({
      error: "Failed to analyze study progress",
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

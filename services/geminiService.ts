import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing in process.env");
  }
  return new GoogleGenAI({ apiKey });
};

export const compareContentWithSrt = async (originalContent: string, srtContent: string): Promise<string> => {
  const ai = getClient();
  
  const systemInstruction = `
    Bạn là một trợ lý AI chuyên nghiệp về biên tập phụ đề và kiểm tra văn bản.
    Nhiệm vụ của bạn là so sánh nội dung của một file "Content Gốc" và một file "SRT Chưa hoàn thiện".
    
    Quy tắc so sánh:
    1. Rà soát từ nào trong "Srt Chưa hoàn thiện" sai hoặc không đúng với từ tương ứng trong "Content Gốc".
    2. Bỏ qua các khác biệt về dấu câu, viết hoa viết thường. Tập trung vào sai khác về từ ngữ (sai chính tả, sai từ, thiếu từ quan trọng).
    3. Output phải tuân thủ CHÍNH XÁC định dạng bên dưới. Không thêm lời dẫn nhập hay kết luận thừa thãi.
    
    Định dạng Output bắt buộc:
    Sửa lỗi từ trong SRT :
    Vị trí [số thứ tự].
    [Timestamp lấy từ file SRT tại vị trí lỗi]
    - [Câu chứa từ bị sai trích từ SRT]
    - [Câu đúng tương ứng trích từ Content Gốc]

    Vị trí [số thứ tự tiếp theo].
    ... (lặp lại cho các lỗi tiếp theo)

    Nếu không có lỗi nào, hãy trả về: "Tuyệt vời! Không tìm thấy lỗi sai nào giữa SRT và Content gốc."
  `;

  const prompt = `
    Dưới đây là Content Gốc:
    """
    ${originalContent}
    """

    Dưới đây là SRT Chưa hoàn thiện:
    """
    ${srtContent}
    """

    Hãy thực hiện rà soát theo yêu cầu và format đã đề ra.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, // Low temperature for high precision
      }
    });

    return response.text || "Không thể tạo phản hồi. Vui lòng thử lại.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Đã xảy ra lỗi khi kết nối với AI. Vui lòng kiểm tra API Key hoặc thử lại sau.");
  }
};

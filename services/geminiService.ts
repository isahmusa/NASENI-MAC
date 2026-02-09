import { GoogleGenAI, Type, Modality } from "@google/genai";

// Guideline: Create a new GoogleGenAI instance right before making an API call 
// to ensure it always uses the most up-to-date API key from the dialog.

export const enhanceScript = async (prompt: string, tone: string) => {
  // Always initialize right before use
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Rewrite and enhance the following script for a ${tone} tone. Provide a clear intro, body, and call-to-action. 
    MANDATORY: Respond ONLY in English. DO NOT use Arabic or any other language.\n\nScript: ${prompt}`,
    config: {
      temperature: 0.7,
    }
  });
  return response.text;
};

export const enhanceImage = async (base64Data: string, mimeType: string) => {
  // Always initialize right before use
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data.split(',')[1],
            mimeType: mimeType,
          },
        },
        {
          text: 'Please enhance this image. Improve the clarity, color balance, and sharpness. Output the enhanced image. Provide any text descriptions ONLY in English.',
        },
      ],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    // Guidelines: Iterate through parts to find image data
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const getAudioPreview = async (base64Data: string, mimeType: string) => {
  // Always initialize right before use
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data.split(',')[1],
            mimeType: mimeType,
          },
        },
        {
          text: 'Enhance the audio quality of the first 5 seconds of this clip. Focus on noise reduction and clarity boost. Return the enhanced audio.',
        },
      ],
    },
    config: {
      responseModalities: [Modality.AUDIO],
    }
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

/**
 * Fetches the full enhanced audio modality from Gemini
 */
export const getFullEnhancedAudio = async (base64Data: string, mimeType: string) => {
  // Always initialize right before use
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data.split(',')[1],
            mimeType: mimeType,
          },
        },
        {
          text: 'Apply full studio mastering to this entire audio. Enhance clarity, normalize loudness, and remove background noise. Return the enhanced audio modality.',
        },
      ],
    },
    config: {
      responseModalities: [Modality.AUDIO],
    }
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const processAudio = async (base64Data: string, mimeType: string) => {
  // Always initialize right before use
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data.split(',')[1],
            mimeType: mimeType,
          },
        },
        {
          text: 'Analyze this audio and provide a studio-grade enhancement report including a transcript and key takeaways. MANDATORY: The report and transcript MUST be in English only. NO ARABIC.',
        },
      ],
    },
  });
  return response.text;
};

export const summarizeMeeting = async (transcript: string) => {
  // Always initialize right before use
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Summarize this meeting transcript. Identify agenda items, decisions, action points, and deadlines. 
    MANDATORY: Use ONLY English. NO ARABIC allowed.\n\nTranscript: ${transcript}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          decisions: { type: Type.ARRAY, items: { type: Type.STRING } },
          actionPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          deadlines: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["summary", "decisions", "actionPoints"],
      }
    }
  });
  return JSON.parse(response.text || '{}');
};
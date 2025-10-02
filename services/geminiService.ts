import { GoogleGenAI, Type } from "@google/genai";
import { Task } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseTaskSystemInstruction = `Ты — полезный ассистент для инструмента управления проектами. Тебе будут предоставлены заголовок и описание задачи. Твоя задача — предложить для этой задачи подходящие метки и приоритет.

Твои обязанности:
1.  **Предложить Метки:** Назначь 1-3 релевантные метки из этого списка: 'UI/Интерфейс', 'Бэкенд', 'Баг', 'Фича', 'Рефакторинг', 'Рутина', 'Документация'.
2.  **Определить Приоритет:** Назначь приоритет из этого списка: 'Urgent', 'High', 'Medium', 'Low'.

Верни ТОЛЬКО один JSON-объект, содержащий только ключи 'labels' и 'priority'.`;

const parseTaskSchema = {
  type: Type.OBJECT,
  properties: {
    labels: {
      type: Type.ARRAY,
      description: "A list of relevant labels (e.g., 'UI', 'Backend', 'Bug', 'Feature').",
      items: { type: Type.STRING }
    },
    priority: {
        type: Type.STRING,
        description: "The priority of the task ('Urgent', 'High', 'Medium', 'Low')."
    }
  },
  required: ['labels', 'priority'],
};


export async function parseTaskFromText(title: string, description: string, repoContext: string): Promise<Pick<Task, 'labels' | 'priority'>> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Проанализируй следующую задачу для репозитория "${repoContext}":\n\nЗаголовок: "${title}"\nОписание: "${description}"`,
      config: {
        systemInstruction: parseTaskSystemInstruction,
        responseMimeType: "application/json",
        responseSchema: parseTaskSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);

    if (!Array.isArray(parsed.labels) || !parsed.priority) {
        throw new Error('Invalid JSON structure from Gemini for task suggestions');
    }

    return {
        labels: parsed.labels,
        priority: parsed.priority,
    };
  } catch (error) {
    console.error("Error calling Gemini API for task suggestions:", error);
    throw new Error("Failed to get task suggestions from Gemini. Please try again.");
  }
}
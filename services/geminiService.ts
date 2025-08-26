import { GoogleGenAI, Type } from "@google/genai";
import { Task } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseTaskSystemInstruction = `Ты — полезный ассистент для преобразования естественного языка в структурированные данные для инструмента управления проектами. Пользователь предоставит текст, описывающий задачу, возможно, с контекстом о репозитории, к которому она относится. Всегда отвечай на русском языке.

Твои обязанности:
1.  **Извлечь Заголовок:** Создай краткий и ясный заголовок для задачи на русском языке.
2.  **Сгенерировать Описание:** Подробно опиши задачу на русском языке. Если ввод пользователя детальный, используй его. Если краткий — расширь его до осмысленного описания. Используй Markdown для форматирования, особенно для чек-листов, например, '- [ ]'.
3.  **Предложить Метки:** Назначь 1-3 релевантные метки из этого списка: 'UI/Интерфейс', 'Бэкенд', 'Баг', 'Фича', 'Рефакторинг', 'Рутина', 'Документация'.
4.  **Определить Приоритет:** Назначь приоритет из этого списка: 'Urgent', 'High', 'Medium', 'Low'.

Ввод пользователя может быть простым отчетом об ошибке, запросом на новую функцию или сложной проблемой. Используй название репозитория для понимания контекста, если это необходимо. Верни ТОЛЬКО один JSON-объект, соответствующий схеме, с русским текстом в полях title и description.`;

const parseTaskSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'A concise title for the task.'
    },
    description: {
      type: Type.STRING,
      description: 'A detailed description of the task, using Markdown for formatting.'
    },
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
  required: ['title', 'description', 'labels', 'priority'],
};


export async function parseTaskFromText(text: string, repoContext: string): Promise<Omit<Task, 'id' | 'createdAt' | 'isDone'>> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Parse this task for the repository "${repoContext}": "${text}"`,
      config: {
        systemInstruction: parseTaskSystemInstruction,
        responseMimeType: "application/json",
        responseSchema: parseTaskSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);

    if (!parsed.title || !parsed.description || !Array.isArray(parsed.labels) || !parsed.priority) {
        throw new Error('Invalid JSON structure from Gemini for task parsing');
    }

    return {
        title: parsed.title,
        description: parsed.description,
        labels: parsed.labels,
        priority: parsed.priority,
    };
  } catch (error) {
    console.error("Error calling Gemini API for task parsing:", error);
    throw new Error("Failed to parse task with Gemini. Please try again.");
  }
}
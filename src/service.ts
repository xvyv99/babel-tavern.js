import type { GoogleGenAI } from '@google/genai';
import type OpenAI from 'openai';

async function getGoogleGenAI() {
  try {
    const mod = await import('@google/genai');
    return mod.GoogleGenAI;
  } catch (e) {
    throw new Error('Please install @google/genai dependency before using Google GenAI (npm install @google/genai)');
  }
}

async function getOpenAI() {
  try {
    const mod = await import('openai');
    return mod.default;
  } catch (e) {
    throw new Error('Please install openai dependency before using OpenAI (npm install openai)');
  }
}

export abstract class BaseService {
    static create(apiKey: string, modelName: string): Promise<BaseService> {
        throw new Error('Not implemented yet!');
    }

    abstract generate(prompt: string): Promise<string>;
}

export class GoogleGenAIService implements BaseService {
    readonly modelName: string;
    readonly client: GoogleGenAI;

    private constructor(client: GoogleGenAI, modelName: string) {
        this.client = client;
        this.modelName = modelName;
    }

    static async create(apiKey: string, modelName: string): Promise<GoogleGenAIService> {
        const GoogleGenAI = await getGoogleGenAI();
        const client = new GoogleGenAI({ apiKey: apiKey });
        return new GoogleGenAIService(client, modelName);
    }

    async generate(prompt: string): Promise<string> {
        const response = await this.client.models.generateContent({
            model: this.modelName,
            contents: prompt,
        });

        if (response.text == undefined) {
            throw new Error(`No text returned from model with prompt ${prompt}`);
        } 

        return response.text;
    }
}

export class OpenAIService implements BaseService {
    readonly modelName: string;
    readonly client: OpenAI;

    private constructor(client: OpenAI, modelName: string) {
        this.client = client;
        this.modelName = modelName;
    }

    static async create(apiKey: string, modelName: string, baseURL?: string): Promise<OpenAIService> {
        const OpenAI = await getOpenAI();
        const client = new OpenAI({ baseURL: baseURL, apiKey: apiKey });
        return new OpenAIService(client, modelName);
    }

    async generate(prompt: string): Promise<string> {
        const completion = await this.client.chat.completions.create({
            model: this.modelName,
            messages: [
                { role: 'user', content: prompt },
            ],
            // TODO: Use messages not just prompt
        });

        const text = completion.choices[0]?.message.content;
        if (!text) {
            throw new Error(`No text returned from model with prompt ${prompt}`);
        }

        return text;
    }
}
    

// TODO: Implement other model service classes as needed

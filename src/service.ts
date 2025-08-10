import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

export interface BaseService {
    generate(prompt: string): Promise<string>;
}

export class GoogleGenAIService implements BaseService {
    readonly modelName: string;
    readonly client: GoogleGenAI;

    constructor(apiKey: string, modelName: string) {
        this.client = new GoogleGenAI({apiKey: apiKey});
        this.modelName = modelName;
    }

    async generate(prompt: string): Promise<string> {
        const response = await this.client.models.generateContent({
            model: this.modelName,
            contents: prompt,
        });

        if (response.text == undefined) {
            throw new Error('No text returned from model');
        } 

        return response.text;
    }
}

export class OpenAIService implements BaseService {
    readonly modelName: string;
    readonly client: OpenAI;

    constructor(apiKey: string, modelName: string, baseURL?: string) {
        this.client = new OpenAI({ baseURL: baseURL, apiKey: apiKey });
        this.modelName = modelName;
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
            throw new Error('No text returned from model');
        }

        return text;
    }
}
    

// TODO: Implement other model classes as needed

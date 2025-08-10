import { expect, test } from 'vitest';

import { GoogleGenAIService, OpenAIService } from '../src/service.js';

test.skip('GoogleGenAIService generate method', async () => {
    const apiKey = process.env.GOOGLE_API_KEY!;
    expect(apiKey).toBeDefined();

    const modelName = 'gemini-2.5-flash';
    const service = new GoogleGenAIService(apiKey, modelName);

    const prompt = 'Hello, how are you?';

    const response = await service.generate(prompt);
    console.log('Response from GoogleGenAIModel:', response);

    expect(response).toBeDefined();
    expect(response.length).toBeGreaterThan(0);
}, 20000);
// TODO: Because I don't have a vaild Google API key, this test is skipped.

test.runIf(process.env.TEST_SERVICE)('OpenAIService generate method', async () => {
    const apiKey = process.env.OPENAI_API_KEY!;
    expect(apiKey).toBeDefined();

    const modelName = 'openai/gpt-oss-20b:free';
    const service = new OpenAIService(apiKey, modelName, process.env.OPENAI_BASE_URL);

    const prompt = 'Hello, how are you?';
    const response = await service.generate(prompt);
    console.log('Response from OpenAIModel:', response);
    expect(response).toBeDefined();
    expect(response.length).toBeGreaterThan(0);
}, 20000);

import fs from 'fs/promises';

import { expect, test } from 'vitest';

import { OpenAIService, GoogleGenAIService, CharacterCardV1, Translator, TranslateSource } from '../src/index.js';

const isAnyChinese = (text: string): boolean => {
    return /[\u4e00-\u9fff]/.test(text);
}

test.skip("Translate test", async () => {
    const apiKey = process.env.OPENAI_API_KEY!;
    expect(apiKey).toBeDefined();

    const modelName = 'openai/gpt-oss-20b:free';
    const service = new OpenAIService(apiKey, modelName, process.env.OPENAI_BASE_URL);

    const translator = new Translator(service);

    const testCard = new CharacterCardV1({
        name: 'Test Character',
        description: 'This is a test character description.',
        personality: 'Friendly and helpful.',
        scenario: 'A scenario where the character interacts with others.',
        first_mes: 'Hello, I am a test character.',
        mes_example: 'This is an example message from the test character.'
    });

    const source: TranslateSource = {
        card: testCard,
        sourceLang: 'english',
        targetLang: 'chinese',
    };
    await translator.run(source);

    source.card.walkAttr(async (field: string) => {
        const attr = source.card.getAttr(field);

        expect(attr).toBeDefined();
    });
}, 20000);

test("Translate test from json file", async () => {
    const apiKey = process.env.GOOGLE_API_KEY!;
    expect(apiKey).toBeDefined();

    const modelName = 'gemini-2.5-flash';
    const service = new GoogleGenAIService(apiKey, modelName);

    const translator = new Translator(service);

    const jsonStr = await fs.readFile('./test_data/test_v2.json', 'utf-8');
    const data = JSON.parse(jsonStr);

    const source = await TranslateSource.fromJSON(data, 'english', 'chinese');

    await translator.run(source);

    source.card.walkAttr(async (field: string) => {
        const attr = source.card.getAttr(field);

        expect(attr).toBeDefined();
    });

    const saveData = JSON.stringify(source.card, null, 4);

    await fs.writeFile('./test_data/out/test_v2_zh.json', saveData, 'utf-8');
}, 0);

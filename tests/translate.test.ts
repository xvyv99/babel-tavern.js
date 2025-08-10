import { expect, test } from 'vitest';

import { OpenAIService, CharacterCardV1, Translator, TranslateSource } from '../src/index.js';

const isAnyChinese = (text: string): boolean => {
    return /[\u4e00-\u9fff]/.test(text);
}

test("Translate test", async () => {
    const apiKey = process.env.OPENAI_API_KEY!;
    expect(apiKey).toBeDefined();

    const modelName = 'openai/gpt-oss-20b:free';
    const service = new OpenAIService(apiKey, modelName, process.env.OPENAI_BASE_URL);

    const translator = new Translator(service);

    const testCard = new CharacterCardV1(
        'Test Character',
        'This is a test character description.',
        'Friendly and helpful.',
        'A scenario where the character interacts with others.',
        'Hello, I am a test character.',
        'This is an example message from the test character.'
    );

    const source: TranslateSource = {
        card: testCard,
        sourceLang: 'english',
        targetLang: 'chinese',
    };
    await translator.run(source);

    source.card.walkAttr(async (field: string) => {
        const text = source.card.getAttr(field);

        expect(text).toBeDefined();
        expect(text.length).toBeGreaterThan(0);
        expect(isAnyChinese(text)).toBe(true);
    });
}, 20000);

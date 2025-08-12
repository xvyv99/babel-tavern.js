import { v1, v2 } from 'character-card-utils';

import { type Translateable, TopLevelSchema, CharacterCardV1, CharacterCardV2 } from './schema.js';
import { getSchemaType } from './schema.js';
import type { BaseService } from './service.js';

export class TranslateSource {
    card: Translateable;
    sourceLang: string;
    targetLang: string;

    constructor(card: Translateable, sourceLang: string, targetLang: string) {
        this.card = card;
        this.sourceLang = sourceLang;
        this.targetLang = targetLang;
    }

    static async fromJSON(
        jsonObj: Object,
        sourceLang: string,
        targetLang: string, 
    ): Promise<TranslateSource> {
        const cardType = getSchemaType(jsonObj);
        switch (cardType) {
            case TopLevelSchema.CharacterCardV1:
                const v1ParsingAttempt = v1.safeParse(jsonObj);

                if (!v1ParsingAttempt.success) {
                    throw new Error(`Failed to parse CharacterCardV1: ${v1ParsingAttempt.error}`);
                }

                return new TranslateSource(
                    new CharacterCardV1(v1ParsingAttempt.data), 
                    sourceLang, 
                    targetLang
                );

            case TopLevelSchema.CharacterCardV2:
                const v2ParsingAttempt = v2.safeParse(jsonObj);

                if (!v2ParsingAttempt.success) {
                    throw new Error(`Failed to parse CharacterCardV1: ${v2ParsingAttempt.error}`);
                }

                return new TranslateSource(
                    new CharacterCardV2(v2ParsingAttempt.data), 
                    sourceLang, 
                    targetLang
                );

            default:
                throw new Error(`Unsupported schema type: ${cardType}`);
        }
    }

    static async fromPNG(): Promise<TranslateSource> {
        // Implementation for creating TranslateSource from PNG
        throw new Error('Method not implemented.');
    }
}

const createTranslationPrompt = (
        source_lang: string, 
        target_lang: string, 
        source_text: string
    ): string => {  
    
    return `
This is an ${source_lang} to ${target_lang} translation, please provide the ${target_lang} translation for this text.

- Preserve text formatting, special characters, and HTML elements.
- Do not provide any explanations or text apart from the translation.
- Label [${source_lang}] and [${target_lang}] should also not be included in the output.
- Always preserve the important placeholder tags {{user}} and {{char}} exactly as they appear in the original text

[${source_lang}]: ${source_text}

[${target_lang}]:
`;
}

export class Translator {
    model: BaseService;

    constructor(model: BaseService) {
        this.model = model;
    }

    async run(source: TranslateSource) {
        await source.card.walkSetAttr( async (text: string) => {
            const prompt = createTranslationPrompt(
                source.sourceLang, 
                source.targetLang, 
                text
            );

            const response = await this.model.generate(prompt);
            console.info(`Translated text: ${response}`);
            return response;
        });
    }
}

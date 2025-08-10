import type { Translateable } from './schema.js';
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

    static async fromJSON(): Promise<TranslateSource> {
        // Implementation for creating TranslateSource from JSON
        throw new Error('Method not implemented.');
    }

    static async fromPNG(): Promise<TranslateSource> {
        // Implementation for creating TranslateSource from PNG
        throw new Error('Method not implemented.');
    }
}

const buildTranslationRequest = (
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
            const prompt = buildTranslationRequest(
                source.sourceLang, 
                source.targetLang, 
                text
            );

            const response = await this.model.generate(prompt);
            console.log(`Translated text: ${response}`);
            return response;
        });
    }
}

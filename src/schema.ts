import type { V1, V2 } from 'character-card-utils';

type walkCallback = (field: string) => Promise<string>;

export class Translateable {
    static readonly NEED_TRANSLATE: Array<string> = [];

    getAttr = (attr: string): string => {
        let val = this[attr as keyof this];

        if (val === undefined) {
            throw new Error(`Property ${attr} is not defined on ${this.constructor.name}`);
        } else if (typeof val !== 'string') {
            throw new Error(`Property ${attr} is not a string on ${this.constructor.name}`);
        }

        return val as string;
    }

    walkAttr = async (callback: (field: string) => any) => {
        const arr = (this.constructor as typeof Translateable).NEED_TRANSLATE;

        await Promise.all(arr.map( async (item) => {
            await callback(item);
        }))
    }

    walkSetAttr = async (callback: walkCallback) => {
        await this.walkAttr( async (item) => {
            const text = this.getAttr(item);
            const translatedText = await callback(text);
            (this as any)[item] = translatedText;
            // FIXME: This is a workaround for TypeScript's type checking.
        });
    }
}

export class CharacterCardV1 extends Translateable implements V1 {
    name: string
    description: string
    personality: string
    scenario: string
    first_mes: string
    mes_example: string
    
    static NEED_TRANSLATE = [
        'name',
        'description',
        'personality',
        'scenario',
        'first_mes',
        'mes_example'
    ];

    constructor(
        name: string, 
        description: string, 
        personality: string, 
        scenario: string, 
        first_mes: string, 
        mes_example: string
    ) {
        super();

        this.name = name;
        this.description = description;
        this.personality = personality;
        this.scenario = scenario;
        this.first_mes = first_mes;
        this.mes_example = mes_example;
    }
}

// TODO: Implement V2 interface properties

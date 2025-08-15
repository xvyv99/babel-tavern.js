import type { V1, V2, CharacterBook, CharacterBookEntry} from 'character-card-utils';

type walkCallback = (text: string) => Promise<string>;
type AttrType = string | Array<string> | Translateable | Translateable[];

export class Translateable {
    static readonly NEED_TRANSLATE: Array<string> = [];

    getAttr = (attr: string): AttrType => {
        const val = this[attr as keyof this];

        if (val === undefined) {
            throw new Error(`Property ${attr} is not defined on ${this.constructor.name}`);
        }

        const isString = typeof val === 'string';
        const isTranslateable = val instanceof Translateable;
        const isValidArray = val instanceof Array && (
            val.every(i => typeof i === 'string') || 
            val.every(i => i instanceof Translateable)
        );

        if (!isString && !isTranslateable && !isValidArray) {
            throw new Error(`Property ${attr} on ${this.constructor.name} must be string, Translateable, or array of strings/Translateables`);
        }

        return val as AttrType;
    }

    walkAttr = async (callback: (field: string) => any) => {
        const arr = (this.constructor as typeof Translateable).NEED_TRANSLATE;

        await Promise.all(arr.map( async (item) => {
            const val = this.getAttr(item);

            if (val instanceof Translateable) {
                await val.walkAttr(callback);
            } else if (val instanceof Array && val.length > 0 && val.every(i => i instanceof Translateable)) {
                await Promise.all(
                    val.map(async (item) => {
                        await item.walkAttr(callback);
                    })
                );
            }

            await callback(item);
        }))
    }

    walkSetAttr = async (callback: walkCallback) => {
        const arr = (this.constructor as typeof Translateable).NEED_TRANSLATE;

        await Promise.all(arr.map( async (item) => {
            const val = this.getAttr(item);

            if (val instanceof Translateable) {
                await val.walkSetAttr(callback);
            } else if (typeof val === 'string' && val.trim().length > 0) {
                const translatedText = await callback(val);
                (this as any)[item] = translatedText;
                // FIXME: This is a workaround for TypeScript's type checking.
            } else if (val instanceof Array && val.length > 0) {
                if (val.every((i) => (i as any) instanceof Translateable)) {
                    await Promise.all(
                        val.map(async (item) => {
                            await (item as Translateable).walkSetAttr(callback);
                        })
                    );
                } else if (val.every((i) => typeof i === 'string')) {
                    await Promise.all(
                        val.map(async (item, index) => {
                            if (item === undefined || item.trim().length === 0) return;

                            val[index] = await callback(item as string);
                        })
                    );
                }
            }
        }));
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
        'mes_example',
    ];

    constructor({
        name, description, personality, scenario, first_mes, mes_example
    }: V1) {
        super();

        this.name = name;
        this.description = description;
        this.personality = personality;
        this.scenario = scenario;
        this.first_mes = first_mes;
        this.mes_example = mes_example;
    }
} 

export class CharaBookEntry extends Translateable implements CharacterBookEntry {
    keys: string[]
    content: string
    extensions: Record<string, any>
    enabled: boolean
    insertion_order: number
    case_sensitive: boolean | undefined
    name: string | undefined
    priority: number | undefined
    id: number | undefined
    comment: string | undefined
    selective: boolean | undefined
    secondary_keys: string[] | undefined
    constant: boolean | undefined
    position: 'before_char' | 'after_char' | undefined

    static NEED_TRANSLATE = [
        "keys",
        "secondary_keys",
        "content",
    ]

    constructor({
        keys, content, extensions = {}, enabled, insertion_order,
        case_sensitive, name, priority, id, comment, selective,
        secondary_keys, constant, position
    }: CharacterBookEntry) {
        super();
        
        this.keys = keys;
        this.content = content;
        this.extensions = extensions;
        this.enabled = enabled;
        this.insertion_order = insertion_order;
        this.case_sensitive = case_sensitive;
        this.name = name;
        this.priority = priority;
        this.id = id;
        this.comment = comment;
        this.selective = selective;
        this.secondary_keys = secondary_keys;
        this.constant = constant;
        this.position = position;
    }
}

export class CharaBook extends Translateable implements CharacterBook {
    name: string | undefined
    description: string | undefined
    scan_depth: number | undefined
    token_budget: number | undefined
    recursive_scanning: boolean | undefined
    extensions: Record<string, any> = {}
    entries: CharaBookEntry[]

    static NEED_TRANSLATE = [
        "name",
        "description",
        "entries",
    ]

    constructor({
        entries,
        name,
        description,
        scan_depth,
        token_budget,
        recursive_scanning,
        extensions = {},
    }: CharacterBook) {
        super();
        
        this.entries = entries.map(entry => new CharaBookEntry(entry));
        this.name = name;
        this.description = description;
        this.scan_depth = scan_depth;
        this.token_budget = token_budget;
        this.recursive_scanning = recursive_scanning;
        this.extensions = extensions;

    }
}

interface V2Data {
    name: string
    description: string
    personality: string
    scenario: string
    first_mes: string
    mes_example: string

    creator_notes: string
    system_prompt: string
    post_history_instructions: string
    alternate_greetings: string[]
    character_book?: CharacterBook | undefined
    tags: string[]
    creator: string
    character_version: string
    extensions: Record<string, any>
}

export class CharacterCardV2Data extends Translateable implements V2Data {
    name: string
    description: string
    personality: string
    scenario: string
    first_mes: string
    mes_example: string

    creator_notes: string
    system_prompt: string
    post_history_instructions: string
    alternate_greetings: string[]
    character_book: CharaBook | undefined
    tags: string[]
    creator: string
    character_version: string
    extensions: Record<string, any>

    static NEED_TRANSLATE = [
        'name',
        'description',
        'personality',
        'scenario',
        'first_mes',
        'mes_example',
    //  'creator_notes',
        'system_prompt',
        'post_history_instructions',
        'alternate_greetings',
        'character_book',
    ];

    constructor({
        name,
        description,
        personality,
        scenario,
        first_mes,
        mes_example,
        extensions,
        creator_notes,
        system_prompt,
        post_history_instructions,
        alternate_greetings,
        tags,
        creator,
        character_version,
        character_book
    }: V2Data) {
        super();
        
        this.name = name;
        this.description = description;
        this.personality = personality;
        this.scenario = scenario;
        this.first_mes = first_mes;
        this.mes_example = mes_example;
        this.extensions = extensions;
        this.creator_notes = creator_notes;
        this.system_prompt = system_prompt;
        this.post_history_instructions = post_history_instructions;
        this.alternate_greetings = alternate_greetings;
        this.tags = tags;
        this.creator = creator;
        this.character_version = character_version;

        if (character_book !== undefined) {
            this.character_book = new CharaBook(character_book);
        } else {
            this.character_book = undefined;
        }
    }
}

export class CharacterCardV2 extends Translateable implements V2 {
    spec: "chara_card_v2" = "chara_card_v2";
    spec_version: "2.0" = "2.0";
    data: CharacterCardV2Data;

    static NEED_TRANSLATE = [
        "data",
    ];

    constructor({
        data
    }: V2) {
        super();
        this.data = new CharacterCardV2Data(data);
    }
}

// TODO: Implement V2 interface properties

// TODO: Define LoreBook interface

export enum TopLevelSchema {
    CharacterCardV1,
    CharacterCardV2,
}

interface TranslateableConstructor {
    new(...args: any[]): Translateable;
}
// Constructor type for Translateable subclasses

export const getSchemaType = (card: Object): TopLevelSchema => {
    if ('spec' in card && 'spec_version' in card) {
        if (card['spec'] === 'chara_card_v2' && card['spec_version'] === '2.0') {
            return TopLevelSchema.CharacterCardV2;
        } else {
            throw new Error(`Unsupported spec: ${card['spec']} with version: ${card['spec_version']}`);
        }
    } else if ('name' in card && 'description' in card) {
        if ('entries' in card) {
            throw new Error('LoreBook is not supported yet');
        } else {
            return TopLevelSchema.CharacterCardV1;
        }
    } else {
        throw new Error('Unsupported schema type');
    }
}

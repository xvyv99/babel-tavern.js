// Main entry point for babel-tavern library

// Import classes for default export
import type { BaseService } from './service.js';
import { GoogleGenAIService, OpenAIService } from './service.js';
import { Translator, TranslateSource } from './translate.js';
import { Translateable, CharacterCardV1 } from './schema.js';

// Export services
export { GoogleGenAIService, OpenAIService };
export type { BaseService };

// Export translation functionality
export { Translator, TranslateSource };

// Export schemas and types
export { Translateable, CharacterCardV1 };

// Version information
export const VERSION = '0.1.0';

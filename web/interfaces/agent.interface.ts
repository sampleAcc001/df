export interface AgentConfig {
    supportedLanguageCodes: string[];
    parent: string;
    displayName: string;
    defaultLanguageCode: string;
    timeZone: string;
    description: string;
    avatarUri: string;
    enableLogging: boolean;
    matchMode: 'MATCH_MODE_HYBRID' | 'MATCH_MODE_ML_ONLY' | 'MATCH_MODE_RULE_BASED'; // Based on Dialogflow docs
    classificationThreshold: number;
    apiVersion: 'API_VERSION_V1' | 'API_VERSION_V2';
    tier: 'TIER_STANDARD' | 'TIER_ENTERPRISE';
}
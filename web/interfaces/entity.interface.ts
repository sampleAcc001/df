export interface Entity {
    id: string;
    displayName: string;
    kind: string;
    entities: Array<{ value: string, synonyms: Array<string> }>;
}
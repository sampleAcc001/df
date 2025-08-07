export interface DialogflowIntent {
    id: string;
    displayName: string;
    action?: string;
    events?: string[];
    trainingPhrases?: string[];
    responses?: string[];
    isFallback?: boolean;
    parentId?: string;
    subIntents?: DialogflowIntent[]; // Recursively nested
}

export interface OutputContext {
    name: string;
    lifespanCount: number;
}

export interface Message {
    text: {
        text: string[];
    };
}

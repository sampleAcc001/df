export interface project {
    count: number;
    projects: projects[];
}

export interface projects {
    projectId: string;
    name: string;
    projectNumber: string;
    lifecycleState: string;
}
const express = require('express');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const path = require('path');
const router = express.Router();
const { google } = require('googleapis');

// --- 🔐 Path to service account key ---
const KEY_PATH = path.join(__dirname, '../keys/healthbot-qtlp-071f70d177a8.json');
const projectId = require(KEY_PATH).project_id;

// --- 💡 Clients with auth ---
const intentsClient = new dialogflow.IntentsClient({ keyFilename: KEY_PATH });
const agentClient = new dialogflow.AgentsClient({ keyFilename: KEY_PATH });
const sessionClient = new dialogflow.SessionsClient({ keyFilename: KEY_PATH });

const axios = require('axios');


const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

// ---------- GET PROJECTS ----------
router.get('/projects', async (req, res) => {
    try {
        const authClient = await auth.getClient();

        const cloudResourceManager = google.cloudresourcemanager({
            version: 'v1',
            auth: authClient,
        });

        const result = await cloudResourceManager.projects.list();
        const projects = result.data.projects || [];

        res.status(200).json({
            count: projects.length,
            projects: projects.map(p => ({
                projectId: p.projectId,
                name: p.name,
                projectNumber: p.projectNumber,
                lifecycleState: p.lifecycleState,
            })),
        });
    } catch (err) {
        console.error('Error fetching GCP projects:', err);
        res.status(500).json({ error: 'Failed to list GCP projects.' });
    }
});


// ---------- GET AGENT ----------
router.get('/agent', async (req, res) => {
    try {
        const request = {
            parent: `projects/${projectId}`,
        };
        const [response] = await agentClient.getAgent(request);
        res.json(response);
    } catch (error) {
        console.error('Error fetching agent:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ---------- CREATE INTENT ----------
router.post('/create-intent', async (req, res) => {
    const { displayName, trainingPhrases, messages } = req.body;

    if (!displayName || !trainingPhrases || !messages) {
        return res.status(400).json({ error: 'displayName, trainingPhrases, and messages are required.' });
    }

    const parent = intentsClient.projectAgentPath(projectId);

    const intent = {
        displayName,
        trainingPhrases: trainingPhrases.map((phrase) => ({
            type: 'EXAMPLE',
            parts: [{ text: phrase }],
        })),
        messages: [
            {
                text: {
                    text: messages, // Array of response strings
                },
            },
        ],
    };

    const request = { parent, intent };

    try {
        const [response] = await intentsClient.createIntent(request);
        res.json({
            message: 'Intent created successfully!',
            intentId: response.name,
        });
    } catch (error) {
        console.error('Error creating intent:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ---------- DETECT INTENT ----------
router.post('/detect-intents', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const sessionId = uuid.v4();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: 'en',
            },
        },
    };

    try {
        const [response] = await sessionClient.detectIntent(request);
        const result = response.queryResult;

        res.json({
            response: result.fulfillmentText,
            intent: result.intent?.displayName || 'No Intent Matched',
        });
    } catch (error) {
        console.error('Dialogflow error:', error.message);
        res.status(500).json({ error: 'Error detecting intent' });
    }
});

// ---------- GET All INTENTS ----------
router.get('/intents', async (req, res) => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_PATH,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const authClient = await auth.getClient();
        const dialogflow = google.dialogflow({ version: 'v2', auth: authClient });

        const parent = `projects/${projectId}/agent`;

        const listResponse = await dialogflow.projects.agent.intents.list({
            parent,
            intentView: 'INTENT_VIEW_FULL', // This gives partial details
        });

        const shallowIntents = listResponse.data.intents || [];

        const detailedIntents = await Promise.all(
            shallowIntents.map(async (intent) => {
                const intentId = intent.name.split('/').pop();
                const response = await dialogflow.projects.agent.intents.get({
                    name: `${parent}/intents/${intentId}`,
                    intentView: 'INTENT_VIEW_FULL',
                });

                const intentData = response.data;

                const trainingPhrases = (intentData.trainingPhrases || []).map(tp =>
                    tp.parts.map(p => p.text).join('')
                );

                const responses = (intentData.messages || []).flatMap(msg =>
                    msg.text?.text || []
                );

                // Extract parent follow-up ID if exists
                const parentFollowupId = intentData.parentFollowupIntentName
                    ? intentData.parentFollowupIntentName.split('/').pop()
                    : undefined;

                return {
                    id: intentId,
                    displayName: intentData.displayName,
                    action: intentData.action || '',
                    events: intentData.events || [],
                    trainingPhrases,
                    responses,
                    isFallback: intentData.isFallback || false,
                    parentId: parentFollowupId // Add this field
                };
            })
        );


        res.json(detailedIntents);
    } catch (error) {
        console.error('Error fetching intents:', error);
        res.status(500).json({ error: 'Failed to fetch intents' });
    }
});


// ---------- CREATE FOLLOWUP INTENT ----------
router.post('/create-followup-intent', async (req, res) => {
    const { parentDisplayName, followupDisplayName, trainingPhrases, messages } = req.body;

    if (!parentDisplayName || !followupDisplayName || !trainingPhrases || !messages) {
        return res.status(400).json({
            error: 'parentDisplayName, followupDisplayName, trainingPhrases, and messages are required.',
        });
    }

    const parent = intentsClient.projectAgentPath(projectId);

    try {
        // Step 1: Find the parent intent
        const [existingIntents] = await intentsClient.listIntents({ parent });

        const parentIntent = existingIntents.find(intent => intent.displayName === parentDisplayName);

        if (!parentIntent) {
            return res.status(404).json({ error: 'Parent intent not found' });
        }

        const parentContextName = `${parentIntent.displayName}-followup`;

        // Step 2: Define the follow-up intent
        const intent = {
            displayName: `${parentIntent.displayName}-${followupDisplayName}`,
            messages: [
                {
                    text: {
                        text: messages,
                    },
                },
            ],
            trainingPhrases: trainingPhrases.map((phrase) => ({
                type: 'EXAMPLE',
                parts: [{ text: phrase }],
            })),
            inputContextNames: [
                `projects/${projectId}/agent/sessions/-/contexts/${parentContextName}`
            ],
            outputContexts: [
                {
                    name: `projects/${projectId}/agent/sessions/-/contexts/${parentIntent.displayName}-${followupDisplayName}-followup`,
                    lifespanCount: 5,
                }
            ],
            rootFollowupIntentName: parentIntent.rootFollowupIntentName || parentIntent.name,
            parentFollowupIntentName: parentIntent.name,
        };

        // Step 3: Create the follow-up intent
        const [response] = await intentsClient.createIntent({
            parent,
            intent,
        });

        res.json({
            message: 'Follow-up intent created successfully!',
            intentId: response.name,
        });
    } catch (error) {
        console.error('Error creating follow-up intent:', error.message);
        res.status(500).json({ error: error.message });
    }
});



// Helper to decode Dialogflow entity field value
function getValue(field) {
    switch (field.kind) {
        case 'stringValue':
            return field.stringValue;
        case 'numberValue':
            return field.numberValue;
        case 'boolValue':
            return field.boolValue;
        case 'structValue':
            return field.structValue.fields;
        case 'listValue':
            return field.listValue.values.map(getValue);
        default:
            return null;
    }
}


// ---------- UPDATE INTENT ----------
router.post('/update-intent', async (req, res) => {
    const { intentId, displayName, trainingPhrases, messages } = req.body;

    if (!intentId) {
        return res.status(400).json({ error: 'intentId is required' });
    }

    try {
        // Step 1: Get existing intent by ID
        const [existingIntent] = await intentsClient.getIntent({
            name: intentId,
            intentView: 'INTENT_VIEW_FULL',
        });

        // Step 2: Modify the fields (if provided)
        if (displayName) {
            existingIntent.displayName = displayName;
        }

        if (trainingPhrases) {
            existingIntent.trainingPhrases = trainingPhrases.map((phrase) => ({
                type: 'EXAMPLE',
                parts: [{ text: phrase }],
            }));
        }

        if (messages) {
            existingIntent.messages = [
                {
                    text: {
                        text: messages, // should be an array
                    },
                },
            ];
        }

        // Step 3: Update the intent
        const updateRequest = {
            intent: existingIntent,
            updateMask: {
                paths: ['display_name', 'training_phrases', 'messages'],
            },
        };

        const [updatedIntent] = await intentsClient.updateIntent(updateRequest);

        res.json({
            message: 'Intent updated successfully!',
            updatedIntentId: updatedIntent.name,
        });
    } catch (error) {
        console.error('Error updating intent:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ---------- GET INTENT BY ID ----------
router.get('/intents/:id', async (req, res) => {
    try {
        const intentId = req.params.id;

        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_PATH,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const authClient = await auth.getClient();
        const dialogflow = google.dialogflow({ version: 'v2', auth: authClient });

        const name = `projects/${projectId}/agent/intents/${intentId}`;
        const response = await dialogflow.projects.agent.intents.get({
            name,
            intentView: 'INTENT_VIEW_FULL', // <- This ensures trainingPhrases are included
        });

        const intent = response.data;

        // Optional: Simplify structure
        const simplified = {
            id: intentId,
            displayName: intent.displayName,
            action: intent.action,
            events: intent.events || [],
            trainingPhrases: (intent.trainingPhrases || []).map(tp =>
                tp.parts.map(p => p.text).join('') // Combine text parts
            ),
            responses: (intent.messages || []).flatMap(m => m.text?.text || []),
            isFallback: intent.isFallback || false,
        };

        res.json(simplified);
    } catch (error) {
        console.error('Error fetching intent by ID:', error);
        res.status(500).json({ error: 'Failed to fetch intent by ID' });
    }
});

// ---------- DELETE INTENT ----------
router.post('/delete-intent', async (req, res) => {
    const { intentId } = req.body;

    if (!intentId) {
        return res.status(400).json({ error: 'intentId is required' });
    }

    try {
        await intentsClient.deleteIntent({ name: intentId });
        res.json({ message: 'Intent deleted successfully!' });
    } catch (error) {
        console.error('Error deleting intent:', error.message);
        res.status(500).json({ error: 'Failed to delete intent' });
    }
});

// ---------- CREATE ENTITY ----------

// create entities
router.post('/entities', async (req, res) => {
    try {
        const { displayName, kind, entities } = req.body;

        if (!displayName || !kind || !Array.isArray(entities)) {
            return res.status(400).json({ error: 'Missing required fields: displayName, kind, entities[]' });
        }

        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_PATH,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const authClient = await auth.getClient();
        const dialogflow = google.dialogflow({ version: 'v2', auth: authClient });

        const parent = `projects/${projectId}/agent`;

        const createResponse = await dialogflow.projects.agent.entityTypes.create({
            parent,
            requestBody: {
                displayName,
                kind, // 'KIND_MAP' | 'KIND_LIST' | 'KIND_REGEXP'
                entities: entities.map(entry => ({
                    value: entry.value,
                    synonyms: entry.synonyms,
                })),
            },
        });

        res.status(201).json(createResponse.data);
    } catch (error) {
        console.error('Error creating entity:', error);
        res.status(500).json({ error: 'Failed to create entity' });
    }
});
// ---------- GET ENTITIES ----------
router.get('/entities', async (req, res) => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_PATH,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const authClient = await auth.getClient();
        const dialogflow = google.dialogflow({ version: 'v2', auth: authClient });

        const parent = `projects/${projectId}/agent`;
        const response = await dialogflow.projects.agent.entityTypes.list({
            parent,
        });

        const rawEntities = response.data.entityTypes || [];

        // Optional: simplify format
        const entities = rawEntities.map(entity => ({
            id: entity.name.split('/').pop(),
            displayName: entity.displayName,
            kind: entity.kind,
            autoExpansionMode: entity.autoExpansionMode,
            entities: entity.entities?.map(e => ({
                value: e.value,
                synonyms: e.synonyms,
            })) || []
        }));

        res.json(entities);
    } catch (error) {
        console.error('Error fetching entities:', error);
        res.status(500).json({ error: 'Failed to fetch entities' });
    }
});

// ---------- Update ENTITY ----------

router.put('/entities/:id', async (req, res) => {
    try {
        const entityId = req.params.id;
        const entityData = req.body;

        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_PATH,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const authClient = await auth.getClient();
        const dialogflow = google.dialogflow({ version: 'v2', auth: authClient });

        const name = `projects/${projectId}/agent/entityTypes/${entityId}`;

        const updateMaskFields = ['displayName', 'entities', 'kind', 'autoExpansionMode'];
        const updateMask = updateMaskFields.join(',');

        const response = await dialogflow.projects.agent.entityTypes.patch({
            name,
            updateMask,
            requestBody: {
                name,
                displayName: entityData.displayName,
                kind: entityData.kind || 'KIND_MAP',
                autoExpansionMode: entityData.autoExpansionMode || 'AUTO_EXPANSION_MODE_UNSPECIFIED',
                entities: entityData.entities || []
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error updating entity:', error);
        res.status(500).json({ error: 'Failed to update entity' });
    }
});
// ---------- DELETE ENTITY ----------
router.delete('/entities/:id', async (req, res) => {
    try {
        const entityId = req.params.id;

        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_PATH,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const authClient = await auth.getClient();
        const dialogflow = google.dialogflow({ version: 'v2', auth: authClient });

        const name = `projects/${projectId}/agent/entityTypes/${entityId}`;

        await dialogflow.projects.agent.entityTypes.delete({ name });

        res.json({ message: 'Entity deleted successfully' });
    } catch (error) {
        console.error('Error deleting entity:', error);
        res.status(500).json({ error: 'Failed to delete entity' });
    }
});
// ---------- GET ENTITY BY ID ----------
router.get('/entities/:entityId', async (req, res) => {
    try {
        const { entityId } = req.params;

        if (!entityId) {
            return res.status(400).json({ error: 'Entity ID is required' });
        }

        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_PATH,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const authClient = await auth.getClient();
        const dialogflow = google.dialogflow({ version: 'v2', auth: authClient });

        const name = `projects/${projectId}/agent/entityTypes/${entityId}`;

        const getResponse = await dialogflow.projects.agent.entityTypes.get({
            name,
        });

        res.status(200).json(getResponse.data);
    } catch (error) {
        console.error('Error fetching entity:', error.message);

        // Handle specific errors
        if (error.code === 404) {
            return res.status(404).json({ error: 'Entity not found' });
        }

        res.status(500).json({ error: 'Failed to fetch entity' });
    }
});
// ---------- CREATE FOLLOW-UP INTENT ----------
router.post('/add-followup', async (req, res) => {
    const { parentIntentId, category } = req.body;

    if (!parentIntentId || !category) {
        return res.status(400).json({ error: 'parentIntentId and category are required.' });
    }

    try {
        // Fetch the parent intent
        const [parentIntent] = await intentsClient.getIntent({ name: parentIntentId });

        const followupDisplayName = `${parentIntent.displayName} - ${category}`;

        // Generate default training phrases and responses (optional, can be customized later)
        const defaultTraining = [`${category}`];
        const defaultResponse = [`This is a ${category} follow-up response.`];

        const intent = {
            displayName: followupDisplayName,
            parentFollowupIntentName: parentIntent.name,
            followupIntentInfo: [],
            trainingPhrases: defaultTraining.map((phrase) => ({
                type: 'EXAMPLE',
                parts: [{ text: phrase }],
            })),
            messages: [
                {
                    text: {
                        text: defaultResponse,
                    },
                },
            ],
        };

        const parent = intentsClient.projectAgentPath(projectId);
        const request = { parent, intent };

        const [createdIntent] = await intentsClient.createIntent(request);

        res.json({
            message: 'Follow-up intent created successfully!',
            followupIntentId: createdIntent.name,
        });
    } catch (error) {
        console.error('Error creating follow-up intent:', error.message);
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;

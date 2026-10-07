import {
    DEFAULT_VAULT_FOLDER,
    secretTypeSchema,
    type Secret,
} from '@signalsafe/simulator-core/apps/contracts';

const CREATED_AT = '2026-10-05T12:00:00.000Z';
const TRAVEL_FOLDER = 'Travel';
const WORK_FOLDER = 'Work';

type DemoSecretInput = Pick<Secret, 'id' | 'title' | 'type' | 'folder' | 'value'> & Partial<Secret>;
function sampleSecret(input: DemoSecretInput): Secret {
    return {
        username: '',
        site: '',
        notes: '',
        createdAt: CREATED_AT,
        updatedAt: CREATED_AT,
        ...input,
    };
}

export function createDemoVaultFolders(): string[] {
    return [DEFAULT_VAULT_FOLDER, TRAVEL_FOLDER, WORK_FOLDER];
}

/** Every credential is an obvious dummy value, never a working account or password. */
export function createDemoSecrets(): Secret[] {
    return [
        sampleSecret({
            id: 'demo-note',
            title: 'Welcome note',
            type: secretTypeSchema.enum.note,
            folder: DEFAULT_VAULT_FOLDER,
            value: '',
            notes: 'Try adding a note or a fictional secret. Reset demo restores these starting records.',
        }),
        sampleSecret({
            id: 'demo-home-wifi',
            title: 'Example Wi-Fi code',
            type: secretTypeSchema.enum.secret,
            folder: DEFAULT_VAULT_FOLDER,
            value: 'DEMO-WIFI-NOT-A-REAL-PASSWORD',
            notes: 'A fictional value for trying reveal, copy and edit.',
        }),
        sampleSecret({
            id: 'demo-packing-list',
            title: 'Weekend packing list',
            type: secretTypeSchema.enum.note,
            folder: TRAVEL_FOLDER,
            value: '',
            notes: 'Water bottle\nRain jacket\nPicnic blanket\nCamera\nFavorite book\n\nA sample note related to the weekend email conversation.',
        }),
        sampleSecret({
            id: 'demo-lodge-login',
            title: 'Example lodge guest portal',
            type: secretTypeSchema.enum.credentials,
            folder: TRAVEL_FOLDER,
            username: 'demo-guest',
            value: 'DEMO-LODGE-NOT-A-REAL-PASSWORD',
            site: 'https://lodge.example.test',
            notes: 'Fictional guest account; the example domain does not provide a real service.',
        }),
        sampleSecret({
            id: 'demo-project-login',
            title: 'Example project portal',
            type: secretTypeSchema.enum.credentials,
            folder: WORK_FOLDER,
            username: 'learner@example.test',
            value: 'DEMO-PROJECT-NOT-A-REAL-PASSWORD',
            site: 'https://projects.example.test',
            notes: 'Dummy credentials for exploring the credentials editor.',
        }),
        sampleSecret({
            id: 'demo-recovery-code',
            title: 'Example recovery code',
            type: secretTypeSchema.enum.secret,
            folder: WORK_FOLDER,
            value: 'DEMO-0000-NOT-A-VALID-RECOVERY-CODE',
            notes: 'This sample code cannot unlock or recover any account.',
        }),
    ];
}

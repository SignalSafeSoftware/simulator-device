import {
    emptySimulatorStore,
    summarizeDevice,
    type DeviceStore,
    type DeviceCollection,
    type DeviceRecords,
    type DeviceQuery,
    type SimulatorStore,
} from '@signalsafe/simulator-core';

/** Example-only host adapter. The packages neither choose nor own persistence. */
export function createMemoryStore(changed: () => void): DeviceStore {
    let state = emptySimulatorStore();
    const records = <K extends DeviceCollection>(collection: K): DeviceRecords[K][] => {
        const collections: { [P in DeviceCollection]: DeviceRecords[P][] } = state;
        return collections[collection];
    };
    const commit = () => {
        state.revision += 1;
        changed();
        return true;
    };
    const filtered = <K extends DeviceCollection>(
        collection: K,
        query: DeviceQuery,
    ): DeviceRecords[K][] =>
        records(collection).filter((record) => {
            if (query.folder !== undefined && 'folder' in record && record.folder !== query.folder)
                return false;
            if (
                query.threadId !== undefined &&
                (!('threadId' in record) || record.threadId !== query.threadId)
            )
                return false;
            return (
                !query.search ||
                JSON.stringify(record).toLowerCase().includes(query.search.toLowerCase())
            );
        });
    return {
        get data() {
            return summarizeDevice(state).metadata;
        },
        get counts() {
            return summarizeDevice(state).counts;
        },
        error: '',
        busy: false,
        reload: async () => {
            changed();
        },
        get: async (collection, id) =>
            records(collection).find((record) => record.id === id) ?? null,
        page: async (collection, query) => {
            const matches = filtered(collection, query);
            const offset = query.offset ?? 0;
            return {
                records: matches.slice(offset, offset + (query.limit ?? 20)),
                total: matches.length,
                revision: state.revision,
            };
        },
        put: async (collection, record) => {
            const items = records(collection);
            const index = items.findIndex((item) => item.id === record.id);
            if (index < 0) items.push(record);
            else items.splice(index, 1, record);
            return commit();
        },
        remove: async (collection, id) => {
            const items = records(collection);
            const index = items.findIndex((item) => item.id === id);
            if (index >= 0) items.splice(index, 1);
            return commit();
        },
        save: async (metadata) => {
            state = { ...state, ...metadata };
            return commit();
        },
        folder: async (from, to, destination) => {
            state.vaultFolders = [
                ...new Set([
                    ...state.vaultFolders.filter((folder) => folder !== from),
                    to ?? destination,
                ]),
            ];
            for (const secret of state.secrets)
                if (secret.folder === from) secret.folder = to ?? destination;
            return commit();
        },
        exportBackup: async () => structuredClone(state),
        restore: async (next: SimulatorStore) => {
            state = structuredClone(next);
            return commit();
        },
    };
}

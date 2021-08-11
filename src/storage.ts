import _ from "lodash";

enum SchemaVersion {
    Initial = 0,
    CleanupUnnecessaryKeysAndEnsureUniqueIds = 1,
    SeparateKeysForSites = 2,
}

const CURRENT_SCHEMA_VERSION = SchemaVersion.SeparateKeysForSites;

const MIGRATIONS = {};
function registerMigration(version: SchemaVersion, migration: Function) {
    MIGRATIONS[version] = migration;
}

registerMigration(SchemaVersion.CleanupUnnecessaryKeysAndEnsureUniqueIds, () => {
    let sites = JSON.parse(Storage.getOrInit(StorageKey.Sites));

    let ids: number[] = [];

    Storage.set(StorageKey.Sites, JSON.stringify(sites.map(site => {
        let id = getGuranteedRandomIdWithExistingIds(ids);
        ids.push(id);

        return {
            id,
            name: site.name,
            url: site.url,
            imageUrl: site.imageUrl,
        }
    })));
});

registerMigration(SchemaVersion.SeparateKeysForSites, () => {
    let sites = JSON.parse(Storage.getOrInit(StorageKey.Sites));

    for (let site of sites) {
        Storage.set(Storage.siteKeyFromId(site.id), JSON.stringify(site));
    }

    Storage.set(StorageKey.Sites, JSON.stringify(sites.map(site => site.id)));
});

enum StorageKey {
    SchemaVersion = "version",
    Title = "title",
    Sites = "sites",
    SiteBase = "site.",
}

export type Site = {
    id: number,
    name: string,
    url: string,
    imageUrl: string,
    pendingDeletion: boolean | undefined,
    localEditMode: boolean | undefined,
}

export class Data {
    title: string;
    sites: Site[];

    private constructor(title: string, sites: Site[]) {
        this.title = title;
        this.sites = sites;
    }

    static fromStorage(): Data {
        console.group(`Loading data`);

        let version = _.toInteger(Storage.getOrInit(StorageKey.SchemaVersion)) as SchemaVersion;
        console.log(`Loaded version=${version}`);

        if (version > CURRENT_SCHEMA_VERSION) {
            throw new Error(`Unknown version=${version}`); // TODO: UI?
        }

        console.group(`Checking for and applying any migrations if necessary`);
        while (version !== CURRENT_SCHEMA_VERSION) {
            let nextVersion = (version + 1) as SchemaVersion;

            console.group(`Applying migration: ${version} -> ${nextVersion} (${SchemaVersion[nextVersion]})`);
            MIGRATIONS[nextVersion]();
            console.log(`Migration done`);
            Storage.set(StorageKey.SchemaVersion, nextVersion.toString());
            console.groupEnd();

            version = nextVersion;
        }
        console.log(`Now at current version=${version}`);
        console.groupEnd();

        let title = Storage.getOrInit(StorageKey.Title);
        let sites = JSON.parse(Storage.getOrInit(StorageKey.Sites));
        sites = sites.map(siteId => JSON.parse(Storage.get(Storage.siteKeyFromId(siteId))));
        let data = new Data(title, sites);

        console.log(`Loading complete`);
        console.groupEnd();

        return data;
    }

    commitAndSaveToStorage() {
        console.group(`Saving all data, version=${CURRENT_SCHEMA_VERSION}`);

        let newSites: Site[] = [];
        for (let site of this.sites) {
            const id = site.id;
            const key = Storage.siteKeyFromId(id);

            if (site.pendingDeletion) {
                Storage.remove(key);
            } else {
                let siteToSave = {
                    id,
                    name: site.name,
                    url: site.url,
                    imageUrl: site.imageUrl,
                };

                Storage.set(key, JSON.stringify(siteToSave));
                newSites.push(site);
            }
        }

        Storage.set(StorageKey.Sites, JSON.stringify(newSites.map(site => site.id)));

        Storage.set(StorageKey.Title, this.title);
        Storage.set(StorageKey.SchemaVersion, CURRENT_SCHEMA_VERSION.toString());

        console.log(`Saving complete`);
        console.groupEnd();

        this.sites = newSites;
    }

    getGuranteedRandomId(): number {
        return getGuranteedRandomIdWithExistingIds(this.sites.map(site => site.id));
    }
}

export class Storage {
    static siteKeyFromId(id: number) {
        return StorageKey.SiteBase + id.toString() as StorageKey
    }

    static defaultValue(key: StorageKey): string {
        switch (key) {
            case StorageKey.SchemaVersion:
                return CURRENT_SCHEMA_VERSION.toString();
            case StorageKey.Title:
                return "These Pages";
            case StorageKey.Sites:
                return "[]";
        }

        throw new Error(`Unsupported key="${key}" for defaultValue()`);
    }

    static get(key: StorageKey): string | undefined {
        console.log(`Loading item key="${key}"`);

        let data = window.localStorage.getItem(key);

        if (data) {
            return data;
        } else {
            return undefined;
        }
    }

    static getOrInit(key: StorageKey): string {
        let data = Storage.get(key);

        if (_.isUndefined(data)) {
            if (key === StorageKey.SchemaVersion && window.localStorage.length > 0) {
                console.warn(`Item key="${key}" not found, but there is at least 1 key in storage. Assuming version=${SchemaVersion.Initial}`);
                data = SchemaVersion.Initial.toString();
            } else {
                console.warn(`Item key="${key}" not found`);
                data = Storage.defaultValue(key);
            }

            Storage.set(key, data);
        }

        return data;
    }

    static set(key: StorageKey, value: string) {
        window.localStorage.setItem(key, value);
        console.log(`Saved item key="${key}"`);
    }

    static remove(key: StorageKey) {
        window.localStorage.removeItem(key);
        console.log(`Removed item key="${key}"`);
    }
}

function getGuranteedRandomIdWithExistingIds(ids: number[]): number {
    let array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    let id = array[0];

    while (!_.every(ids, existingId => existingId !== id)) {
        window.crypto.getRandomValues(array);
        id = array[0];
    }

    return id;
}

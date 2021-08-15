import _ from "lodash";

export enum SchemaVersion {
    Initial = 0,
    CleanupUnnecessaryKeysAndEnsureUniqueIds = 1,
    SeparateKeysForSites = 2,
}

export const CURRENT_SCHEMA_VERSION = SchemaVersion.SeparateKeysForSites;

const MIGRATIONS: { [key: number]: Function } = {};
function registerMigration(version: SchemaVersion, migration: Function) {
    MIGRATIONS[version] = migration;
}

registerMigration(SchemaVersion.CleanupUnnecessaryKeysAndEnsureUniqueIds, () => {
    let sites = JSON.parse(Storage.getOrInit(StorageKey.Sites));

    let ids: number[] = [];

    Storage.set(StorageKey.Sites, JSON.stringify(sites.map((site: Site) => {
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
        Storage.set(Storage.siteKeyForId(site.id), JSON.stringify(site));
    }

    Storage.set(StorageKey.Sites, JSON.stringify(sites.map((site: Site) => site.id)));
});

export enum StorageKey {
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
    pendingDeletion?: boolean,
    localEditMode?: boolean,
}

export class Data {
    title: string;
    sites: Site[];

    constructor(title: string, sites: Site[]) {
        this.title = title;
        this.sites = sites;
    }

    static performMigrationsUpTo(targetVersion: SchemaVersion) {
        let version = _.toInteger(Storage.getOrInit(StorageKey.SchemaVersion)) as SchemaVersion;

        if (version > CURRENT_SCHEMA_VERSION) {
            throw new Error(`Unknown version=${version}`); // TODO: UI?
        }

        console.log(`Checking for and applying any migrations if necessary: version=${version} target=${targetVersion}`);
        while (version < targetVersion) {
            let nextVersion = (version + 1) as SchemaVersion;

            console.log(`Applying migration: ${version} -> ${nextVersion} (${SchemaVersion[nextVersion]})`);
            MIGRATIONS[nextVersion]();
            Storage.set(StorageKey.SchemaVersion, nextVersion.toString());

            version = nextVersion;
        }
        console.log(`Now at target version=${version}`);
    }

    static fromStorage(): Data {
        Data.performMigrationsUpTo(CURRENT_SCHEMA_VERSION);

        let title = Storage.getOrInit(StorageKey.Title);
        let sites = JSON.parse(Storage.getOrInit(StorageKey.Sites));
        sites = sites.map((siteId: number) => JSON.parse(Storage.get(Storage.siteKeyForId(siteId))!));
        let data = new Data(title, sites);

        return data;
    }

    commitAndSaveToStorage() {
        let newSites: Site[] = [];
        for (let site of this.sites) {
            const id = site.id;
            const key = Storage.siteKeyForId(id);

            if (site.pendingDeletion) {
                Storage.remove(key);
            } else {
                Storage.set(key, JSON.stringify(_.pick(site, ["id", "name", "url", "imageUrl"])));
                newSites.push(site);
            }
        }

        Storage.set(StorageKey.Sites, JSON.stringify(newSites.map(site => site.id)));

        Storage.set(StorageKey.Title, this.title);
        Storage.set(StorageKey.SchemaVersion, CURRENT_SCHEMA_VERSION.toString());

        this.sites = newSites;
    }

    getGuranteedRandomId(): number {
        return getGuranteedRandomIdWithExistingIds(this.sites.map(site => site.id));
    }
}

export class Storage {
    static siteKeyForId(id: number) {
        return StorageKey.SiteBase + id.toString() as StorageKey
    }

    static defaultValue(key: StorageKey): string {
        switch (key) {
            case StorageKey.SchemaVersion:
                return CURRENT_SCHEMA_VERSION.toString();
            case StorageKey.Title:
                return "These Pages";
            case StorageKey.Sites:
                return JSON.stringify([]);
        }

        throw new Error(`Unsupported key="${key}" for defaultValue()`);
    }

    static get(key: StorageKey): string | undefined {
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
    }

    static remove(key: StorageKey) {
        window.localStorage.removeItem(key);
    }

    static exportAllData(): string {
        let keys = _.range(window.localStorage.length).map(n => window.localStorage.key(n)!);
        let values = keys.map(key => window.localStorage.getItem(key));

        return JSON.stringify(_.zipObject(keys, values));
    }

    static resetAndImportAllData(data: string) {
        let kv = JSON.parse(data);

        Storage.reset();

        for (let key of _.keys(kv)) {
            Storage.set(key as StorageKey, kv[key]);
        }
    }

    static reset() {
        window.localStorage.clear();
    }
}

const MAX_RANDOM: number = _.toSafeInteger(Infinity);
const random = () => _.random(MAX_RANDOM);

function getGuranteedRandomIdWithExistingIds(existingIds: number[]): number {
    let id = random();

    while (!_.every(existingIds, existingId => existingId !== id)) {
        id = random();
    }

    return id;
}

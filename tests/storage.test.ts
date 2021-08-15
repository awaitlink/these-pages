import _ from 'lodash';
import { Storage, StorageKey, Site, CURRENT_SCHEMA_VERSION, SchemaVersion, Data } from "../src/storage";

describe("Data", () => {
    describe("performMigrationsUpTo", () => {
        beforeEach(() => {
            Storage.reset();
            Storage.set(StorageKey.Title, "Test Title");
        });

        test("invalid version", () => {
            let invalidVersion = CURRENT_SCHEMA_VERSION + 12345;
            Storage.set(StorageKey.SchemaVersion, _.toString(invalidVersion));
            expect(() => Data.performMigrationsUpTo(CURRENT_SCHEMA_VERSION)).toThrow(`Unknown version=${invalidVersion}`);
        });

        test(SchemaVersion[SchemaVersion.CleanupUnnecessaryKeysAndEnsureUniqueIds], () => {
            let sites: Site[] = [];
            for (let i of _.range(7)) {
                sites.push({
                    id: i % 3,
                    name: `Site #${i}`,
                    url: `https://example.org/somewhere/${i}`,
                    imageUrl: `https://example.org/image/${i}.jpg`,
                    pendingDeletion: false,
                });
            }

            Storage.set(StorageKey.Sites, JSON.stringify(sites));

            Data.performMigrationsUpTo(SchemaVersion.CleanupUnnecessaryKeysAndEnsureUniqueIds);

            expect(Storage.get(StorageKey.SchemaVersion)).toBe(_.toString(SchemaVersion.CleanupUnnecessaryKeysAndEnsureUniqueIds));
            expect(Storage.get(StorageKey.Title)).toBe("Test Title");

            let sitesAfterMigration = JSON.parse(Storage.get(StorageKey.Sites)!);
            let seenIds = [];
            for (let i of _.range(7)) {
                expect(sitesAfterMigration[i]).toMatchObject({
                    name: sites[i].name,
                    url: sites[i].url,
                    imageUrl: sites[i].imageUrl,
                });

                expect(sitesAfterMigration[i]).not.toHaveProperty("pendingDeletion");
                expect(_.isFinite(sitesAfterMigration[i].id)).toBeTruthy();
                expect(seenIds).not.toContain(sitesAfterMigration[i].id);
                seenIds.push(sitesAfterMigration[i].id);
            }
        });

        test(SchemaVersion[SchemaVersion.SeparateKeysForSites], () => {
            Storage.set(StorageKey.SchemaVersion, _.toString(SchemaVersion.CleanupUnnecessaryKeysAndEnsureUniqueIds));

            let sites: Site[] = [];
            for (let i of _.range(7)) {
                sites.push({
                    id: i,
                    name: `Site #${i}`,
                    url: `https://example.org/somewhere/${i}`,
                    imageUrl: `https://example.org/image/${i}.jpg`,
                });
            }

            Storage.set(StorageKey.Sites, JSON.stringify(sites));

            Data.performMigrationsUpTo(SchemaVersion.SeparateKeysForSites);

            expect(Storage.get(StorageKey.SchemaVersion)).toBe(_.toString(SchemaVersion.SeparateKeysForSites));
            expect(Storage.get(StorageKey.Title)).toBe("Test Title");

            let sitesAfterMigration = JSON.parse(Storage.get(StorageKey.Sites)!);
            for (let i of _.range(7)) {
                let siteIdAfterMigration = sitesAfterMigration[i];
                expect(siteIdAfterMigration).toBe(i);

                let siteAfterMigration = JSON.parse(Storage.get(Storage.siteKeyForId(siteIdAfterMigration))!);
                expect(siteAfterMigration).toEqual(sites[siteIdAfterMigration]);
            }
        });
    });

    test("fromStorage", () => {
        const siteIds = _.range(25);

        Storage.reset();
        Storage.set(StorageKey.SchemaVersion, _.toString(CURRENT_SCHEMA_VERSION));
        Storage.set(StorageKey.Title, "Test Title");
        Storage.set(StorageKey.Sites, JSON.stringify(siteIds));

        let expectedSites: Site[] = [];
        for (let id of siteIds) {
            expectedSites.push({
                id,
                name: `Site #${id}`,
                url: `https://example.org/somewhere/${id}`,
                imageUrl: `https://example.org/image/${id}.jpg`
            });

            Storage.set(Storage.siteKeyForId(id), JSON.stringify(expectedSites[id]));
        }

        let { title, sites } = Data.fromStorage();
        expect(title).toEqual("Test Title");
        expect(sites).toEqual(expectedSites);
    });

    test("commitAndSaveToStorage", () => {
        Storage.reset();

        let originalSites: Site[] = [];
        for (let id of _.range(25)) {
            originalSites.push({
                id,
                name: `Site #${id}`,
                url: `https://example.org/somewhere/${id}`,
                imageUrl: `https://example.org/image/${id}.jpg`,
                pendingDeletion: (id % 7 == 0),
            });
        }

        new Data("Test Title", originalSites).commitAndSaveToStorage();

        let expectedRemainingSites = originalSites
            .filter(site => !site.pendingDeletion)
            .map(site => _.omit(site, ["pendingDeletion"]));

        let count = expectedRemainingSites.length;

        expect(Storage.get(StorageKey.SchemaVersion)).toBe(_.toString(CURRENT_SCHEMA_VERSION));
        expect(Storage.get(StorageKey.Title)).toBe("Test Title");
        let ids = JSON.parse(Storage.get(StorageKey.Sites)!);
        expect(ids).toEqual(expectedRemainingSites.map(site => site.id));
        for (let i of _.range(count)) {
            expect(JSON.parse(Storage.get(Storage.siteKeyForId(ids[i]))!)).toEqual(expectedRemainingSites[i]);
        }
    });
});

describe("Storage", () => {
    const siteIds = _.range(5);
    const sites: Site[] = [];

    beforeEach(() => {
        Storage.reset();

        Storage.set(StorageKey.SchemaVersion, _.toString(1));
        Storage.set(StorageKey.Title, "Test Title");

        Storage.set(StorageKey.Sites, JSON.stringify(siteIds));
        for (let id of siteIds) {
            sites.push({
                id,
                name: `Site #${id}`,
                url: `https://example.org/somewhere/${id}`,
                imageUrl: `https://example.org/image/${id}.jpg`
            });

            Storage.set(Storage.siteKeyForId(id), JSON.stringify(sites[id]));
        }
    });

    test("defaultValue", () => {
        expect(Storage.defaultValue(StorageKey.SchemaVersion)).toBe(CURRENT_SCHEMA_VERSION.toString());
        expect(Storage.defaultValue(StorageKey.Title)).toBe("These Pages");
        expect(Storage.defaultValue(StorageKey.Sites)).toBe("[]");

        expect(() => Storage.defaultValue(Storage.siteKeyForId(1234567890))).toThrow();
    });

    test.each([
        { id: 0, key: StorageKey.SiteBase + "0" },
        { id: 1234567890, key: StorageKey.SiteBase + "1234567890" },
    ])("siteKeyForId($id) is '$key'", ({ id, key }) => {
        expect(Storage.siteKeyForId(id)).toBe(key);
    });

    test("get", () => {
        expect(Storage.get(StorageKey.SchemaVersion)).toBe(_.toString(1));
        expect(Storage.get(StorageKey.Title)).toBe("Test Title");
        expect(JSON.parse(Storage.get(StorageKey.Sites)!)).toEqual(siteIds);
        for (let id of siteIds) {
            expect(JSON.parse(Storage.get(Storage.siteKeyForId(id))!)).toEqual(sites[id]);
        }
    });

    test("set", () => {
        expect(window.localStorage.length).toBe(3 + siteIds.length);
    });

    test("remove, getOrInit", () => {
        Storage.remove(StorageKey.Title);
        expect(window.localStorage.length).toBe(2 + siteIds.length);
        expect(Storage.get(StorageKey.Title)).toBe(undefined);
        expect(Storage.getOrInit(StorageKey.Title)).toBe(Storage.defaultValue(StorageKey.Title));
        expect(Storage.get(StorageKey.Title)).toBe(Storage.defaultValue(StorageKey.Title));
    });

    test("exportAllData", () => {
        let expected: any = {};
        expected[StorageKey.SchemaVersion] = "1";
        expected[StorageKey.Title] = "Test Title";
        expected[StorageKey.Sites] = JSON.stringify(siteIds);
        for (let id of siteIds) {
            expected[Storage.siteKeyForId(id)] = JSON.stringify(sites[id]);
        }

        expect(Storage.exportAllData()).toEqual(JSON.stringify(expected));
    });

    test("exportAllData -> resetAndImportAllData", () => {
        Storage.resetAndImportAllData(Storage.exportAllData());

        expect(Storage.get(StorageKey.SchemaVersion)).toBe("1");
        expect(Storage.get(StorageKey.Title)).toBe("Test Title");
        expect(JSON.parse(Storage.get(StorageKey.Sites)!)).toEqual(siteIds);
        for (let id of siteIds) {
            expect(JSON.parse(Storage.get(Storage.siteKeyForId(id))!)).toEqual(sites[id]);
        }
    });

    test("reset", () => {
        Storage.reset();
        expect(window.localStorage.length).toBe(0);
    });
});

<svelte:options tag="svelte-app" />

<script>
    import SiteCard from "./components/SiteCard.svelte";
    import InputField from "./components/InputField.svelte";

    import _ from "lodash";

    const SITES_STORAGE_KEY = "sites";
    const TITLE_STORAGE_KEY = "title";

    let editing = false;
    let sites = [];
    let title = document.title;

    function loadAll() {
        function getOrInit(key, defaultValue) {
            const data = window.localStorage.getItem(key);
            if (!_.isNil(data)) {
                return data;
            } else {
                saveAll();
                return defaultValue;
            }
        }

        try {
            sites = JSON.parse(getOrInit(SITES_STORAGE_KEY, sites));
            title = getOrInit(TITLE_STORAGE_KEY, title);
        } catch (e) {
            console.error(e);
        }
    }

    function saveAll() {
        window.localStorage.setItem(SITES_STORAGE_KEY, JSON.stringify(sites));
        window.localStorage.setItem(TITLE_STORAGE_KEY, title);
    }

    function toggleEditMode() {
        editing = !editing;

        if (!editing) {
            sites = sites.filter((site) => !site.pendingDeletion);
            saveAll();
        }
    }

    function addSite() {
        var array = new Uint32Array(1);
        window.crypto.getRandomValues(array);

        sites.push({
            id: array[0],
            name: "",
            url: "",
            imageUrl: "",
            pendingDeletion: false,
        });

        sites = sites;
    }

    loadAll();
    $: document.title = title;
</script>

<div class="container is-fluid my-5">
    <div class="field is-grouped is-grouped-multiline is-grouped-right mb-5">
        {#if editing}
            <p class="control">
                <InputField bind:content={title} />
            </p>
            <p class="control is-expanded" />
            <p class="control">
                <button class="button is-light" on:click={addSite}>
                    <span class="icon is-small">
                        <i class="fas fa-plus" />
                    </span>
                </button>
            </p>
        {/if}
        <p class="control">
            <button
                class="button is-{editing ? 'success' : 'white'}"
                on:click={toggleEditMode}
            >
                <span class="icon is-small">
                    <i class="fas fa-{editing ? 'save' : 'edit'}" />
                </span>
            </button>
        </p>
    </div>

    <div class="columns is-mobile is-multiline">
        {#each sites as site (site.id)}
            <SiteCard bind:site editable={editing} />
        {/each}
    </div>
</div>

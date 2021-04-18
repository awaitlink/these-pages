<svelte:options tag="svelte-app" />

<script>
    import SiteCard from "./components/SiteCard.svelte";

    const STORAGE_KEY = "sites";

    let editing = false;
    let sites = [];

    function load() {
        const storedValue = window.localStorage.getItem(STORAGE_KEY);
        if (storedValue) {
            return JSON.parse(storedValue);
        } else {
            return null;
        }
    }

    function save() {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
    }

    function toggleEditMode() {
        editing = !editing;

        if (!editing) {
            sites = sites.filter((site) => !site.pendingDeletion);
            save();
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

    try {
        let storedValue = load();
        if (storedValue) {
            sites = storedValue;
        } else {
            save();
        }
    } catch (e) {
        console.error(e);
    }
</script>

<div class="container is-fluid my-5">
    <div class="buttons mb-5">
        <button
            class="button is-{editing ? 'success' : 'white'}"
            on:click={toggleEditMode}
        >
            <span class="icon is-small">
                <i class="fas fa-{editing ? 'save' : 'edit'}" />
            </span>
        </button>

        {#if editing}
            <button class="button is-light" on:click={addSite}>
                <span class="icon is-small">
                    <i class="fas fa-plus" />
                </span>
            </button>
        {/if}
    </div>

    <div class="columns is-mobile is-multiline">
        {#each sites as site (site.id)}
            <SiteCard bind:site editable={editing} />
        {/each}
    </div>
</div>

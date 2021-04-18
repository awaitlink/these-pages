<svelte:options tag="svelte-app" />

<script>
    import SiteCard from "./components/SiteCard.svelte";

    let editing = false;
    let sites = [];

    function onHashChange() {
        let fragment = location.hash.substr(1);
        try {
            sites = JSON.parse(atob(fragment));
        } catch {}
    }

    window.onhashchange = onHashChange;
    onHashChange();

    function toggleEditMode() {
        editing = !editing;

        if (!editing) {
            sites = sites.filter(site => !site.pendingDeletion);
            window.location = "#" + btoa(JSON.stringify(sites));
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
</script>

<div class="container is-fluid my-5">
    <div class="field is-grouped mb-5">
        <p class="control">
            <button
                class="button is-{editing ? 'success' : 'white'}"
                on:click={toggleEditMode}
            >
                <span class="icon is-small">
                    <i class="fas fa-lock{editing ? '-open' : ''}" />
                </span>
            </button>
        </p>

        {#if editing}
            <p class="control">
                <button class="button is-light" on:click={addSite}>
                    <span class="icon is-small">
                        <i class="fas fa-plus" />
                    </span>
                </button>
            </p>
        {/if}
    </div>

    <div class="columns is-mobile is-multiline">
        {#each sites as site (site.id)}
            <SiteCard bind:site editable={editing} />
        {/each}
    </div>
</div>

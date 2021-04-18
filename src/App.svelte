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
            sites = sites.filter((site) => !site.pendingDeletion);
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
    <div class="buttons mb-5">
        <button
            class="button is-{editing ? 'success' : 'white'}"
            class:hide-inactive={!editing}
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

<style>
    button.hide-inactive {
        opacity: 0.1;
        transition: opacity 1s linear 1s;
    }

    button.hide-inactive:hover,
    button.hide-inactive:focus {
        opacity: 1;
        transition: opacity 0.25s linear 0s;
    }
</style>

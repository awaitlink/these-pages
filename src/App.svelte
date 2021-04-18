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
            window.location = '#' + btoa(JSON.stringify(sites));
        }
    }
</script>

<div class="container is-fluid my-5">
    <button
        class="button mb-5 is-{editing ? 'success' : 'white'}"
        on:click={toggleEditMode}
    >
        <span class="icon is-small">
            <i class="fas fa-lock{editing ? '-open' : ''}" />
        </span>
    </button>

    <div class="columns is-mobile is-multiline">
        {#each sites as site (site.id)}
            <SiteCard bind:site editable={editing} />
        {/each}
    </div>
</div>

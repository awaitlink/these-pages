<svelte:options tag="svelte-app"/>

<script>
    import SiteCard from './components/SiteCard.svelte';

    let sites = [];

    function onHashChange() {
        let fragment = location.hash.substr(1);
        try {
            sites = JSON.parse(atob(fragment));
        } catch { }
    }

    window.onhashchange = onHashChange;
    onHashChange();
</script>

<div class="container is-fluid my-5">
    <div class="columns is-mobile is-multiline">
        {#each sites as site (site.id)}
            <SiteCard {site}/>
        {/each}
    </div>
</div>

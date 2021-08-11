<svelte:options tag="svelte-app" />

<script>
    import SiteCard from "./components/SiteCard.svelte";
    import InputField from "./components/InputField.svelte";

    import { Data } from "./storage";

    let globalEditMode = false;

    let data = Data.fromStorage();

    function toggleGlobalEditMode() {
        globalEditMode = !globalEditMode;

        if (!globalEditMode) {
            data.commitAndSaveToStorage();

            data.sites.forEach((site) => (site.localEditMode = false));
        }
    }

    function addSite() {
        data.sites.push({
            id: data.getGuranteedRandomId(),
            name: "",
            url: "",
            imageUrl: "",
            pendingDeletion: false,
            localEditMode: true,
        });

        data.sites = data.sites;
    }

    $: document.title = data.title;
</script>

<div class="container is-fluid my-5">
    <div class="field is-grouped is-grouped-multiline is-grouped-right mb-5">
        {#if globalEditMode}
            <p class="control">
                <InputField bind:content={data.title} />
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
                class="button"
                class:is-link={!globalEditMode && data.sites.length === 0}
                class:is-white={!globalEditMode && data.sites.length > 0}
                class:is-success={globalEditMode}
                on:click={toggleGlobalEditMode}
            >
                <span class="icon is-small">
                    <i
                        class="fas"
                        class:fa-save={globalEditMode}
                        class:fa-ellipsis-h={!globalEditMode}
                    />
                </span>
            </button>
        </p>
    </div>

    <div class="columns is-mobile is-multiline">
        {#each data.sites as site (site.id)}
            <SiteCard bind:site {globalEditMode} />
        {/each}
    </div>
</div>

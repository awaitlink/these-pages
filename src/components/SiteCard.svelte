<svelte:options tag="svelte-site-card" />

<script>
    export let site;
    export let globalEditMode;

    let editable = false;
    $: editable = globalEditMode && site.localEditMode;

    import InputField from "./InputField.svelte";

    function togglePendingDeletion() {
        site.pendingDeletion = !site.pendingDeletion;
    }
</script>

<div
    class="column is-half-mobile is-one-third-tablet is-one-quarter-desktop is-one-fifth-widescreen"
>
    <a
        href={globalEditMode ? null : site.url}
        rel="noopener noreferrer nofollow"
        target="_top"
        class:disabled={globalEditMode}
    >
        <div
            class="card is-unselectable"
            class:editable={globalEditMode}
            class:has-background-danger-light={site.pendingDeletion}
        >
            <div class="card-header-title">
                {#if !editable}
                    <span class="is-clipped">{site.name}</span>
                {:else}
                    <InputField bind:content={site.name} />
                {/if}
            </div>
            {#if editable}
                <div class="card-content">
                    <InputField
                        small
                        icon="fas fa-link"
                        bind:content={site.url}
                    />
                    <InputField
                        small
                        icon="fas fa-file-image"
                        bind:content={site.imageUrl}
                    />
                </div>
            {:else if site.imageUrl}
                <div class="card-image">
                    <figure class="image is-16by9">
                        <img src={site.imageUrl} alt="Site" />
                    </figure>
                </div>
            {/if}

            {#if globalEditMode}
                <footer class="card-footer">
                    {#if !site.localEditMode && !site.pendingDeletion}
                        <button
                            class="button is-white card-footer-item has-text-link"
                            on:click={() => (site.localEditMode = true)}
                        >
                            <i class="fas fa-edit" />
                        </button>
                    {/if}

                    <button
                        class="button is-white card-footer-item"
                        class:has-text-danger={!site.pendingDeletion}
                        on:click={togglePendingDeletion}
                    >
                        <i
                            class="fas fa-{site.pendingDeletion
                                ? 'undo'
                                : 'trash'}"
                        />
                    </button>
                </footer>
            {/if}
        </div>
    </a>
</div>

<style>
    a.disabled {
        cursor: default;
    }

    .card {
        border: thick solid #ffffff00;
        transition: border 0.25s;
    }

    .card:not(.editable):hover,
    .card:not(.editable):focus {
        border: thick solid hsl(171, 100%, 41%); /* primary */
    }

    .is-clipped {
        text-overflow: ellipsis;
    }
</style>

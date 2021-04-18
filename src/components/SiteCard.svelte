<svelte:options tag="svelte-site-card" />

<script>
    export let site;
    export let editable;

    import InputField from "./InputField.svelte";

    function togglePendingDeletion() {
        site.pendingDeletion = !site.pendingDeletion;
    }
</script>

<div
    class="column is-half-mobile is-one-third-tablet is-one-quarter-desktop is-one-fifth-widescreen"
>
    <a
        href={editable ? null : site.url}
        rel="noopener noreferrer nofollow"
        target="_top"
        class:disabled={editable}
    >
        <div
            class="card is-unselectable"
            class:editable
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
                <footer class="card-footer">
                    <button
                        class="button is-white card-footer-item"
                        on:click={togglePendingDeletion}
                    >
                        <i
                            class="fas fa-{site.pendingDeletion
                                ? 'undo'
                                : 'trash'}"
                        />
                    </button>
                </footer>
            {:else if site.imageUrl}
                <div class="card-image">
                    <figure class="image is-16by9">
                        <img src={site.imageUrl} alt="Site" />
                    </figure>
                </div>
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

<svelte:options tag="svelte-input-field" />

<script>
    export let small;
    export let icon;
    export let content;
</script>

<div class="field">
    <p class="control" class:has-icons-left={icon}>
        <input
            class="input is-rounded"
            class:is-small={small}
            type="text"
            bind:value={content}
        />
        {#if icon}
            <span class="icon is-left" class:is-small={small}>
                <i class={icon} />
            </span>
        {/if}
    </p>
</div>

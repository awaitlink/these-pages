<svelte:options tag="svelte-input-field" />

<script lang="ts">
    export let small;
    export let icon;
    export let content;

    function handlePaste(event) {
        for (let item of event.clipboardData.items) {
            if (item.kind == "file" && item.type.startsWith("image/")) {
                var imageFile = item.getAsFile();
                var fileReader = new FileReader();
                fileReader.onloadend = function () {
                    content = fileReader.result;
                };
                fileReader.readAsDataURL(imageFile);
                break;
            }
        }
    }
</script>

<div class="field has-addons">
    <div class="control" class:has-icons-left={icon}>
        <input
            class="input is-rounded is-light"
            class:is-small={small}
            type="text"
            bind:value={content}
            on:paste={handlePaste}
        />
        {#if icon}
            <span class="icon is-left" class:is-small={small}>
                <i class={icon} />
            </span>
        {/if}
    </div>
    <div class="control">
        <button
            class="button is-rounded is-light"
            class:is-small={small}
            on:click={() => (content = "")}
        >
            <i class="fas fa-times" />
        </button>
    </div>
</div>

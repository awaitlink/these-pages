<svelte:options />

<script lang="ts">
    import SiteCard from "../SiteCard.svelte";
    import InputField from "../InputField.svelte";

    import { Data, Storage } from "$lib/storage";

    let globalEditMode = false;
    let data = Data.fromStorage();

    let importExportModalVisible = false;
    let importExportData = "";

    function toggleGlobalEditMode() {
        globalEditMode = !globalEditMode;

        if (!globalEditMode) {
            data.commitAndSaveToStorage();

            data.sites.forEach((site) => (site.localEditMode = false));
        }
    }

    function toggleImportExportModal() {
        importExportModalVisible = !importExportModalVisible;

        if (importExportModalVisible) {
            importExportData = Storage.exportAllData();
        }
    }

    function importData() {
        Storage.resetAndImportAllData(importExportData);
        importExportData = "";
        data = Data.fromStorage();
        toggleImportExportModal();
        toggleGlobalEditMode();
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

<svelte:head>
    <title>These Pages</title>
</svelte:head>

<div class="container is-fluid my-5">
    <div class="field is-grouped is-grouped-multiline is-grouped-right mb-5">
        {#if globalEditMode}
            <p class="control">
                <button
                    class="button is-rounded"
                    on:click={toggleImportExportModal}
                >
                    <span class="icon is-small">
                        <i class="fas fa-file-export" />
                    </span>
                    <span class="icon is-small">
                        <i class="fas fa-file-import" />
                    </span>
                </button>
            </p>
            <p class="control">
                <InputField
                    bind:content={data.title}
                    small={false}
                    icon={null}
                />
            </p>
            <p class="control is-expanded" />
            <p class="control">
                <button class="button is-rounded" on:click={addSite}>
                    <span class="icon is-small">
                        <i class="fas fa-plus" />
                    </span>
                </button>
            </p>
        {/if}
        <p class="control">
            <button
                class="button is-rounded"
                class:is-link={!globalEditMode && data.sites.length === 0}
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

<div class="modal" class:is-active={importExportModalVisible}>
    <div class="modal-background" on:click={toggleImportExportModal} />
    <div class="modal-content">
        <div class="box">
            <div class="field">
                <textarea
                    class="textarea is-family-code"
                    rows="10"
                    bind:value={importExportData}
                />
            </div>
            <div class="field is-grouped">
                <p class="control">
                    <button
                        class="button is-rounded"
                        on:click={toggleImportExportModal}
                    >
                        <span class="icon is-small">
                            <i class="fas fa-undo" />
                        </span>
                    </button>
                </p>
                <p class="control is-expanded" />
                <p class="control">
                    <button
                        class="button is-rounded is-danger"
                        on:click={importData}
                    >
                        <span class="icon is-small">
                            <i class="fas fa-save" />
                        </span>
                    </button>
                </p>
            </div>
        </div>
    </div>
    <button
        class="modal-close is-large"
        aria-label="close"
        on:click={toggleImportExportModal}
    />
</div>

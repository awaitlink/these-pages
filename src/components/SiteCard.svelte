<svelte:options tag="svelte-site-card" />

<script>
    export let site;
</script>

<div
    class="column is-half-mobile is-one-third-tablet is-one-quarter-desktop is-one-fifth-widescreen"
>
    <a href={site.url} rel="noopener noreferrer nofollow" target="_top">
        <div class="card">
            <div class="card-header-title">
                <span class="icon-text">
                    <span class="icon">
                        <i class="fas fa-link" />
                    </span>
                    <span>{site.name}</span>
                </span>
            </div>
            <div class="card-image">
                <figure class="image is-16by9">
                    <img
                        src="https://bulma.io/images/placeholders/640x360.png"
                        alt="Site"
                    />
                </figure>
            </div>
            <div class="card-content" />
        </div>
    </a>
</div>

<style>
    .card {
        border: thick solid #ffffff00;
    }

    .card:hover,
    .card:focus {
        border: thick solid hsl(171, 100%, 41%); /* primary */
    }
</style>

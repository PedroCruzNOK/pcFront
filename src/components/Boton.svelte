<script>
    import { Link } from "svelte-routing";
    export let tituloBoton;
    export let urlBoton;
</script>

<div>
    <Link to="{urlBoton}" class="block px-4 py-2 text-sm text-red-600 hover:text-gray-700 border-red-600 hover:border-gray-700" role="menuitem">{tituloBoton}</Link> 
</div>
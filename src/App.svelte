<script>
	import {Router, Link, Route} from "svelte-routing";
	import Home from './views/Home.svelte'
	import Login from './views/Login.svelte'
	import Agenda from './views/Agenda.svelte'
	import Empleados from './views/Empleados.svelte'
	import EditarEmpleados from './views/EditarEmpleados.svelte'
	import Navbar from './components/Navbar.svelte'
	import {onMount} from 'svelte'
	import {user} from './stores/User'
	

	onMount(async() =>{
		await user.current()
	})
	
    
</script>

{#if $user === false}
	<h1>Cargando ...</h1>
{:else}
	<div>
		
		<Router>
			<Route path="/">
				<Home />		
			</Route>
			
			<Route path="/login">
				<Login></Login>
			</Route>
			<Route path="/agenda">
				<Agenda />
			</Route>
			
			<Route path="/empleados">
				<Empleados/>
			</Route>
			<Route path="/empleados/ver">
				<EditarEmpleados />
			</Route>
			
		</Router>
	</div>
{/if}


<style global>
	@tailwind base;
	@tailwind components;
	@tailwind utilities;


</style>
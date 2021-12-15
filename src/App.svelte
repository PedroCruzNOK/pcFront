<script>
	import {Router, Link, Route} from "svelte-routing";
	import Home from './views/Home.svelte'
	import Login from './views/Login.svelte'
	import Agenda from './views/Agenda.svelte'
	import Empleados from './views/Empleados.svelte'
	import EditarEmpleados from './views/EditarEmpleados.svelte'
	import Navbar from './components/Navbar.svelte'
	
	

	
	
    
</script>


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


<style global>
	@tailwind base;
	@tailwind components;
	@tailwind utilities;


</style>

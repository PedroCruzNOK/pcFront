<script>
	import {Router, Link, Route} from "svelte-routing";
	import Agenda from './views/Agenda.svelte'
	import Empleados from './views/Empleados.svelte'
	import Navbar from './components/Navbar.svelte'
	
	

	
	
    
</script>


	<div>
		
		<Router>
			<Route path="/">
				<Empleados/>		
			</Route>
			<Route path="/agenda">
				<Agenda />
			</Route>
			<Route path="/empleados">
				<Empleados/>
			</Route>
			
			
		</Router>
	</div>


<style global>
	@tailwind base;
	@tailwind components;
	@tailwind utilities;


</style>

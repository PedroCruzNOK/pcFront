<script>
    import {user} from '../stores/User'

    import {auth, provider} from '../firebase'
import Titulo from '../components/Titulo.svelte'

 

    const procesarFormulario = async () =>{     
        try {
            const res = await auth.signInWithPopup(provider)
            console.log(res)
            user.setUser(res.user)
            navigate('/perfil', {replace: true})
        } catch (error) {
            console.log(error)
        }     
        
    }
</script>

<div class="container w-full md:w-5/5 xl:w-2/5  mx-auto px-20">
    <Titulo tituloPrincipal="Iniciar Sesion" />
    <div class="mb-10 mt-0 ml-0 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 px-10 py-5">
        <center>
            <form >
                <label class='block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2'>Usuario: </label>
                <input class='appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none  focus:border-gray-500' type="text" name="txtUsu">
                <br>
                <label class='block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2'>Password: </label>
                <input  class='appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none  focus:border-gray-500' type="password" name="txtPass">
                <br>
                <input  class="del-btn block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" type="submit" value="Iniciar sesión">
            </form>
        </center>
    </div>
    <Titulo tituloPrincipal="Otra forma" />
    <button type="submit" on:click={procesarFormulario} class="del-btn block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
        Acceder desde Google
    </button>
    
</div>
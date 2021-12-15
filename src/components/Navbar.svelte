<script>

    import {Link, links, navigate} from 'svelte-routing' 


    
</script>
<div class="row">

    <div id="sidebar" class="h-screen w-16 menu bg-white text-white px-4 flex items-center nunito static fixed shadow">
        <ul class="list-reset ">
            <li class="my-2 md:my-0">
                <Link to="/" class="block py-1  pl-1  text-gray-600 no-underline hover:text-red-600">
                    <i class="bi bi-house iconMenu"></i>
                    <span class="w-full inline-block pl-1"> Inicio</span>  
                </Link>
            </li>
            
            <li class="my-2 md:my-0">
                <Link to="/agenda" class="block py-1 md:py-3 pl-1 align-middle text-gray-600 no-underline hover:text-red-600">
                    <i class="bi bi-journal-bookmark-fill iconMenu"></i>
                    <span class="w-full inline-block pb-1 md:pb-0 pl-1"> Agenda</span>
                </Link>
            </li>
            <li class="my-2 md:my-0">
                <Link to="/empleados" class="block py-1 md:py-3 pl-1 align-middle text-gray-600 no-underline hover:text-red-600">
                    <i class="bi bi-person-check iconMenu"></i> 
                    <span class="w-full inline-block pb-1 md:pb-0 pl-1"> Empleados </span>
                </Link>
            </li>
        </ul>
    </div>

    <div class="flex flex-row flex-wrap flex-1 flex-grow content-start pl-16">
        <div class="h-40 lg:h-20 w-full flex flex-wrap"> 
            <nav id="header1" class="bg-gray-100 w-auto flex-1 border-b-1 border-gray-300 order-1 lg:order-2">
                <div class="flex h-full justify-between items-center">
                    
                    <br>
                    <div class="flex relative inline-block pr-6">
                        <div class="relative text-sm">
                            <button  class="btn-indigo flex items-center focus:outline-none mr-3">
                                <img class="w-8 h-8 rounded-full mr-4" src="http://i.pravatar.cc/300" alt="Avatar of User">
                               
                                
                                
                            </button>
                            
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    </div>
  

</div>

<style>


#sidebar {
    transition: ease-in-out all .3s;
    z-index: 2;
}

#sidebar span {
    opacity: 0;
    position: absolute;
    transition: ease-in-out all .6s;
}

#sidebar:hover {
    width: 150px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    /*shadow-2xl*/
}

#sidebar:hover span {
    opacity: 1;
}

.iconMenu{
    font-size: 22px;
}

/*Row Hover*/

</style>
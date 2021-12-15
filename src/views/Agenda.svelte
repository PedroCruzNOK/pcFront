<script>
 
    import Navbar from '../components/Navbar.svelte'
    import Titulo from '../components/Titulo.svelte'

    
    let toastEl;
    $: console.log(toastEl)
    const mostrarToast = (opciones) => {
        new Toast(toastEl).show()
    }
    let todos = [];
    let todo = {id: '', texto: '',estado: false};

    if (localStorage.getItem("todos")){
        todos = JSON.parse(localStorage.getItem("todos"))
    }
    $: localStorage.setItem("todos", JSON.stringify(todos));

    const addTodo = ()=> {
        if (!todo.texto.trim()){
            console.log("texto vacio")
            todo.texto =''
            return
        }
        todo.id = Date.now()
        todos = [...todos, todo]
        console.log(todos)
        todo = {id: '', texto: '',estado: false};

        mostrarToast()
        
    }
    const delTodo = id =>{
        todos = todos.filter(item => item.id !== id)
    }
    const editTodo = id => {
        todos = todos.map(item => {
            if (item.id === id){
                return {
                    ...item,
                    estado: !item.estado
                }
            }else{
                return item
            }
        })
        console.log(todos)
    }
    const classIcono=valor=>(
        valor? 'bi bi-arrow-clockwise' : 'bi bi-check2' 
    )
    const classEstado = valor => valor ? 'btn-success' : 'btn-warning'
</script>

<div class="">
    <Navbar />
    <div class="container w-full md:w-5/5 xl:w-5/5  mx-auto px-2">
        <Titulo tituloPrincipal="Agenda personal" />
        <form on:submit|preventDefault={addTodo}>
            <input 
                type="text"
                placeholder="Enter para agregar una nueva tarea"
                class="form-control shadow border-0"
                bind:value={todo.texto}
            >
        </form>
        {#each todos as item}
            <div class="shadow my-3 p-3 lead">
                <p class={item.estado ? 'text-decoration-line-through': ''}>
                    {item.texto}
                </p>
                <button class="btn btn-sm {classEstado(item.estado)}" on:click={editTodo(item.id)}>
                    <i class={classIcono(item.estado)}>Editar</i>
                </button>
                <button class="btn btn-sm btn-danger" on:click={delTodo(item.id)}>
                    <i class="bi bi-trash">Eliminar</i>
                </button>
            </div>
        {/each}
        <div class="toast-container position-absolute p-3 top-0 end-0">
            <div bind:this={toastEl} 
            class="toast align-items-center text-white bg-primary border-0" role="alert" 
            aria-live="assertive" 
            aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        Hello, world! This is a toast message.
                    </div>
                    <button type="button" 
                    class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" 
                    aria-label="Close"></button>
                </div>
            </div>
        </div>
    </div>
</div> 
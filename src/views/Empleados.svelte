<script>

  import { onMount } from "svelte";
  import { Datatable, rows } from "svelte-simple-datatables";
  import Modal from "@svelte-parts/modal";
  import Titulo from '../components/Titulo.svelte'
  import Boton from '../components/Boton.svelte'
  import Navbar from '../components/Navbar.svelte'
  import ModalEditarEmpleado from "../components/ModalEditarEmpleado.svelte";
  
    let open = false;
   
    let row = {};
  
   
  
    let data = [];
    const API = "http://backend:3001/empleados";
    onMount(async () => {
      const response = await fetch(API);
      data = await response.json();
    });
  
    
    const settings = {
      columnFilter: true,
      labels: {
        noRows: "No se encontro  registro",
        search: "Buscar Resgistro", // search input placeholer
        filter: "Filter", // filter inputs placeholder
        info: "Total: {rows} Registros Encontrados",
        previous: "Anterior",
        next: "Siguiente",
      },
      scrollY: false,
    };
  
    const getUser = async (id) => {
      const APII = `http://backend:3001/empleados/${id}`;
      const response = await fetch(APII);
      row = await response.json();
      open = true
    };
    
  </script>
  
  <Modal {open} onClose={() => (open = false)}>
    <div class="modal">
       
            <div id="header" class="flex items-center mb-4"> 
               <img alt="avatar" class="w-20 rounded-full border-2 border-gray-300" src="https://picsum.photos/seed/picsum/200" />
               <div id="header-text" class="leading-5 ml-6 sm">
                  <h4 id="name" class="text-xl font-semibold">{row.nombre}</h4>
                  <h5 id="job" class="font-semibold text-blue-600">{row.dependencia}</h5>
               </div>
            </div>
            <div id="quote">
               <q class="italic text-gray-600">{row.RFC}</q>
            </div>
         </div>
  </Modal>

 

  <Navbar />
  <div class="row">
    <div class="origin-top-right absolute right-0 mt-4 mr-5 w-30 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5" aria-labelledby="mobile-menu" role="menu">
      <Boton urlBoton="/vacaciones" tituloBoton="Nuevo empleado"></Boton>  
    </div>
    <Titulo tituloPrincipal="Empleados" />
    <div class="w-auto md:w-5/5 xl:w-5/5  md:ml-40 md:mr-6 mt-6">
      <Datatable {settings} {data} class="tabla" style="height: 300px;">
        <thead>
          <th data-key="nombre">NOMBRE</th>
          <th data-key="fechaNacimiento">FECHA DE NACIMIENTO</th>
          <th data-key="antiguedad">ANTIGUEDAD</th>
          <th data-key="dependencia">DEPARTAMENTO</th>
          <th data-key="RFC">RFC, CURP, NSS</th>
          <th data-key="SD">SD</th>
          <th data-key="SDI">SDI</th>
          <th data-key="estado">ESTADO</th>
          <th data-key="empresa">EMPRESA</th>
          <th data-key="SDI">Ver</th>
          <th data-key="estado">Editar</th>
          <th data-key="empresa">Eliminar</th>
          
        </thead>
        <tbody>
          {#each $rows as row}
            <tr>
              <td><span style="" class="text-red-500 no-underline hover:text-gray-400">{row.nombre}</span><br></td>
              <td class="text-gray-500">{row.fechaNacimiento}</td>
              <td>Ingreso: <span style="" class="text-gray-500"> {row.fechaIngreso}</span><br>Antiguedad: <span style="" class="text-gray-500"> {row.antiguedad}</span> </td>
              <td>Departamento: <span style="" class="text-gray-500"> {row.dependencia}</span><br>Puesto: <span style=""class="text-gray-500"> {row.areaPuesto}</span> </td>
              <td>RFC: <span style="" class="text-gray-500"> {row.RFC}</span> <br>CURP:  <span style="" class="text-gray-500">{row.CURP}</span><br>NSS: <span style=""class="text-gray-500"> {row.NSS}</span></td>
              <td class="text-gray-500">{row.SD}</td>
              <td class="text-gray-500">{row.SDI}</td>
              <td class="text-gray-500">{row.estado}</td>
              <td class="text-gray-500">{row.empresa}</td>
              <td class="centrar">
                
                <i class=" bi bi-eye-fill pl-2 block py-1 md:py-3 pl-1 align-middle text-green-500 no-underline hover:text-gray-400" on:click={getUser(row.id_empleado)} />
              </td>
              <td class="centrar">
                
                <ModalEditarEmpleado nombre = {row.nombre} aPaterno = {row.ap_paterno} fechaIngreso= {row.fechaIngreso} dependencia = {row.dependencia} puesto= {row.areaPuesto} id={row.id_empleado}/>
              </td>
              <td class="centrar">
                <i class="bi bi-trash pl-2 block py-1 md:py-3 pl-1 align-middle text-red-500 no-underline hover:text-gray-400"></i>
              </td>
            </tr>
          {/each}
        </tbody>
      </Datatable>
    </div>
  </div>
  
  
  <style>
    .modal {
      background-color: white;
      padding: 2em;
      border-radius: 0.5em;
      min-width: 30vw;
    }
    .centrar{
      text-align: center;
    }
    th:first-child {
      width: 300px;
    }
    td {
      
      padding: 4px 0;
    }
  </style>

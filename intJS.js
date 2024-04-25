
 const dirApi = 'https://fakestoreapi.com/products';
const dvHTML = document.getElementById("gridd");
const prod = dvHTML.querySelectorAll('.productCard')
const descripc = dvHTML.querySelector('#descrip')
var pcdes =[]; // TIENE TODOS LOS PRODUCTOS CON LOS % DE DESC
var productId = [];//arreglo con carrito
var pcdesa =[];

//consumo la api
const obtProductos = ()=> {
    fetch(dirApi)
    .then(response => response.json())
    .then(datos => {
      datos.sort((a, b) => a.id - b.id);
       consuDesc(datos); //Envio la api con todos los productos a donde manejo los descuentos
      })
    .catch(error =>{
        console.log("ERROR",error)
    })
}

//consumo los descuentos
function consuDesc(allProd){
  fetch('http://localhost:3001/integrador-web2/')
    .then(response => {
      if (!response.ok) {
        throw new Error('La conexion no se produjo');
      }
      return response.json();
    })
    .then(proDes => {

      allProd.forEach(element =>{
        for (let i = 0; i < proDes.length; i++) {
          if (element.id == proDes[i].id){
            element.descuento = proDes[i].descuento //le agrego la propiedad descuento y su % a lo extraido de JSON
            i = proDes.length
          }
          
        }
        showCont(element)
      })
    })
    .catch(error => {
      console.error('Se produjo un error =C:', error);
    });
    pcdes = allProd; //ASIGNO LOS PRODUCTOS C LOS DESCUENTOS
    
    console.log(pcdes)
}

function traducirTexto(textoParaTraducir) {
  return fetch('http://localhost:3001/traducir', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ texto: textoParaTraducir }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error en la solicitud POST');
    }
    return response.json();
  })
  .then(data => {
    return data.translation;
  })
  .catch(error => {
    console.error('Error en la solicitud:', error);
  });
}





//funcion tarjetas completas
const showCont = cont =>{

  const apli = ()=>{
    if(cont.hasOwnProperty('descuento')){
     
      //retorno un nuevo div con el precio orig tachado y el porcentaje de desc
      return `<div style="display: flex; align-items: center;"><s style="font-weight:normal; font-size:0.75em;">$${cont.price}</s> <span style="color:white;font-weight:bold; padding:3%; font-size:0.77em; background-color: red; border-radius:15%; margin-left: 5px;">-${cont.descuento}%</span></div> <span style="color:red; font-size:1.1rem; font-weight:bold;">$${((cont.price - (cont.price * cont.descuento / 100)).toFixed(2))}</span>`  
     } else {
      return `$${cont.price}`;
    }
  }

Promise.all([
  traducirTexto(cont.title),
  traducirTexto(cont.description.slice(0,30))
]).then(([tituloTraducido, descripcionTraducida]) => {

  const prod =`
    <div class="productCard" id="p_${cont.id}">
      <div style="position: relative;">
        <img src=${cont.image} id="img"> </img>
        ${cont.hasOwnProperty('descuento') ? `<div style="position: absolute; top:45%; left: 0; width: 100%; height: 7%; background:rgb(0 0 0 / 63%); color: white; display: flex; justify-content: center; align-items: center; font-weight:bold; font-size: 0.9em ;">OFERTA</div>` : ''}
        ${cont.hasOwnProperty('descuento') ? `<div style="position: absolute; top: 0; left: 0; background-color:#217dffc4;border-radius:10%; color: white; padding: 2px; font-size: 0.9em ; font-weight: bold">-$ ${(cont.price * cont.descuento / 100).toFixed(2)}</div>`: ''}
      </div>
      <h3 id ="titulo">${tituloTraducido}</h3>
      <p id="descrip" >${descripcionTraducida}</p>
      <p id="cat">${cont.category.toUpperCase()}</p>
      <p id="precio">${apli()}</p> 
      <button class="añadir">Añadir al carrito</button>
    </div>
  `;
  dvHTML.insertAdjacentHTML('beforeend',prod);
}).catch(error => {
  console.error('Error en la traducción:', error);
});

}


dvHTML.addEventListener('mouseover', function(event) {
  if (event.target.classList.contains('productCard')) {
      event.target.classList.add('hoverEffect');
  }
});

dvHTML.addEventListener('mouseout', function(event) {
  const relatedTarget = event.relatedTarget;
  const productCards = document.querySelectorAll('.productCard');

  productCards.forEach(prod => {
      if (!prod.contains(relatedTarget)) {
          prod.classList.remove('hoverEffect');
      }
  });
  
});

//Captura el id del prod desde el botón añadir al carrito y los guarda en un arreglo
function actCant() {
  const contador = () => { 
    var cn = 0;
    for (const i of productId) {
      cn += i.cantidad;
    }
    return cn;
  }

  if (productId.length > 0) {
    document.getElementById('cart-count').textContent = contador();
    document.getElementById('cart-count').style.backgroundColor = 'red';
  }
}

window.addEventListener('DOMContentLoaded', (event) => {
  let carroProd = localStorage.getItem('añadidos');
  if (carroProd) {
      productId = JSON.parse(carroProd);
      actCant();
  }
});

dvHTML.addEventListener('click', function(event) {
  if (event.target.classList.contains('añadir')) {
    const button = event.target;
    if (button.disabled) {
      return;
    }
    button.disabled = true;

    const originalColor = button.style.color;
    button.innerHTML = '<span><i class="fas fa-check-circle" style="color: #39c740; font-size: 1.1em;"></i></span>';
    setTimeout(() => {
      button.innerHTML = 'Añadir al carrito';
      button.style.color = originalColor;
      button.disabled = false;
    }, 800);

 
    let idProducto = event.target.closest('.productCard').id.split('_')[1];
   
    let productoEncontrado = productId.find(prod => prod.id === idProducto);
    if (productoEncontrado) {;//si el producto ya está en el carrito, aumenta la cantidad
      productoEncontrado.cantidad++
    } else {//si el producto no está en el carrito, lo agrega con cantidad de 1
      productId.push({ id: idProducto, cantidad: 1 });
    }
    

    const contador = ()=>{ 
    var cn = 0;
    for (const i of productId) {
      cn += i.cantidad ;
    }
    console.log(cn)
    return cn
    }

    if (productId.length > 0) {
      document.getElementById('cart-count').textContent = contador();
      document.getElementById('cart-count').style.backgroundColor = 'red';
    }
    
  localStorage.setItem('añadidos', JSON.stringify(productId))//cuando se agrega ootro prod, lo envia a la pagina del carro
   actCant();
  }
});


//abre desde el carro la nueva pagina 
document.getElementById('carri').addEventListener('click',function(){
  localStorage.setItem('prodcutos', JSON.stringify(pcdes));
  localStorage.setItem('añadidos', JSON.stringify(productId))
  window.open('./carro.html')
})



//crear un elemento para mostrar la descripción completa
let tooltip = document.createElement('div');
tooltip.id = 'tooltip';
document.body.appendChild(tooltip);

dvHTML.addEventListener('mouseover', function(event) {
  const idP = event.target.closest('.productCard').id.split('_')[1];
  const descripElement = event.target.closest('#descrip');
  if (descripElement) {
    fetch(dirApi + '/' + idP)
      .then(response => response.json())
      .then(product => {
        traducirTexto(product.description).then(descripcionTraducida => {
          tooltip.textContent = descripcionTraducida;
          tooltip.style.display = 'block';
          tooltip.style.left = event.pageX + 'px';
          tooltip.style.top = event.pageY + 'px';
        }).catch(error => {
          console.error('Error en la traducción:', error);
        });
      })
      .catch(error => {
        console.log("ERROR", error);
      });
  } else {
    tooltip.style.display = 'none';
    const descripElements = document.querySelectorAll('#descrip');
    descripElements.forEach(element => {
      const truncatedDescription = element.textContent.slice(0, 30) + '...';
      element.textContent = truncatedDescription;
    });
  }
});


window.addEventListener('storage', function(event){
  if (event.key == 'añadidos'){
      var dataRecibida = JSON.parse(event.newValue);
      console.log(dataRecibida);
     location.reload(); // Refresca la página
    }
  });

obtProductos();

document.addEventListener('DOMContentLoaded', function() {
  const acercaDeNosotrosLink = document.getElementById('acerca-de-nosotros-link');
  const terminosLink = document.getElementById('terminos-link');
  const contactoLink = document.getElementById('contacto-link');
  const devolucionesLink = document.getElementById('devoluciones-link');
  const popupOverlay = document.getElementById('divCartel');
  const closePopupBtn = document.getElementById('botX');
  const popupContent = document.getElementById('contMsje');

  acercaDeNosotrosLink.addEventListener('click', function(event) {
      event.preventDefault();
      mostrarPopup('Acerca de nosotros', '.FakeStore es una página de venta de productos internacionales.');
  });

  terminosLink.addEventListener('click', function(event) {
      event.preventDefault();
      mostrarPopup('Términos y condiciones', 'Aquí puedes encontrar los términos y condiciones de uso de nuestro sitio.');
  });

  contactoLink.addEventListener('click', function(event) {
      event.preventDefault();
      mostrarPopup('Contacto', 'Puedes contactarnos a través de nuestro formulario de contacto o en nuestras redes sociales.');
  });

  devolucionesLink.addEventListener('click', function(event) {
      event.preventDefault();
      mostrarPopup('Devoluciones', 'Consulta nuestra política de devoluciones para obtener más información sobre cómo devolver un producto.');
  });

  closePopupBtn.addEventListener('click', function() {
      ocultarPopup();
  });

  function mostrarPopup(titulo, contenido) {
      popupContent.innerHTML = `<h3>${titulo}</h3><p>${contenido}</p>`;
      popupOverlay.style.display = 'block';
  }

  function ocultarPopup() {
      popupOverlay.style.display = 'none';
  }
});

var allProd = localStorage.getItem('prodcutos');
var carroProd = localStorage.getItem('añadidos')
const carro = JSON.parse(carroProd)
const productos = JSON.parse(allProd);
const vwDocument = document.getElementById("pro");
var detalleCompra = {
  productos: [],
  cantidadTotal: 0,
  totalCompra: 0,
  idCompra: 0
};
var emptyCartIcon = document.getElementById('emptyCartIcon');
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


//ACTUALIZO EL CARRITO CUANDO DESDE LA PAG DE PRODUCTOS AGREGO MAS AL CARRO

window.addEventListener('storage', function (event) {
  if (event.key == 'añadidos') {
    var dataRecibida = JSON.parse(event.newValue);
    console.log(dataRecibida);
    location.reload();
    
  }
});

//CONSTRUYE LOS PRODUCTOS DEL CARRO EN PANTALLA
const showCont = cont => {
  
  traducirTexto(cont.title.slice(0, 84)).then(tituloTraducido => {
    const apli = () => {
      if (cont.hasOwnProperty('descuento')) {
        // Retorno un nuvo div con el precio original tachado y el porcentaje de descuento
        return `<div class="precioTachado" style="display: flex; align-items: center;">
                  <s style="font-weight:normal; font-size:0.75em;">$${cont.price}</s>
                  <span style="color:white;font-weight:bold; padding:3%; font-size:0.77em; background-color: red; border-radius:15%; margin-left: 5px;">-${cont.descuento}%</span>
                </div>
                <span class"preecioDesc" style="color:red; font-size:1.1rem; font-weight:bold;">$${((cont.price - (cont.price * cont.descuento / 100)).toFixed(2))}</span>`;
      } else {
        return `$${cont.price}`;
      }
    };

    const prod = `
      <div class="productCard" id="p_${cont.id}">
        <img src=${cont.image} alt="Imagen del producto">
        <div>
          <h3 class="title">${tituloTraducido}...</h3>
          <div class="ca">
            <i class="fa fa-plus" aria-hidden="true"></i>
            <input readONLY class="cantNum" value='${cont.cantidad}'></input><i class="fa fa-minus" aria-hidden="true" id="menos"></i>
            <i class="fas fa-trash"></i>
          </div>
        </div>
        <p id="precio">${apli()}</p> 
      </div>
    `;

    document.querySelector('#pro').insertAdjacentHTML('beforeend', prod);
  }).catch(error => {
    console.error('Error en la traducción:', error);
  });
};


//agrego los productos del carro a pantalla
carro.forEach(element => {

  for (let i = 0; i < productos.length; i++) {
    if (element.id == productos[i].id) {
      productos[i].cantidad = element.cantidad;
      showCont(productos[i]);
      detalleCompra.productos.push(productos[i])
    }

  }
  emptyCartIcon.style.display = 'none';
});


document.addEventListener('click', function (event) {
  const prodCard = event.target.closest('.productCard');
  const prodId = prodCard.id.split('_')[1]; //ID del producto que modifico cant
  const pos = carro.findIndex(pr => pr.id === prodId);
  if (event.target.classList.contains('fa-trash')) {
    carro.splice(pos, 1)
    prodCard.remove()
    if(carro.length == 0){
      emptyCartIcon.style.display = 'block';
    }
  }

})

const finCompra = () => {
  const dv = document.querySelector('.cantTotal');
  const fechaHora = new Date().toLocaleString();
  const contadorCant = () => {
    var cn = 0;
    for (const i of carro) {
      cn += i.cantidad;
    }
    return cn;
  }

  const subttl = () => {//CALCULA EL SUBTOTAL
    var subt = 0, cant = 0, id = 0;
    productos.forEach(element => {
      for (let i = 0; i < carro.length; i++) {
        if (element.id == carro[i].id) {
          subt = (element.price * carro[i].cantidad) + subt
        }
      }
    })
    return subt
  }


  const ttal = () => {
    var ttl = 0;
    productos.forEach(element => {
      carro.forEach(item => {
        if (element.id == item.id) {
          if (element.hasOwnProperty('descuento')) {
            ttl += ((element.price - (element.price * element.descuento / 100)) * item.cantidad);
          } else {
            ttl += (element.price * item.cantidad);
          }
        }
      });
    });
    return ttl.toFixed(2);
  }


  const datos = `
    <p class= "cant" >Productos:  (${contadorCant()})</p>
    <p class= "subttl">Subtotal: $ ${subttl().toFixed(2)} </p>
    <p class= "ttl">TOTAL: $ ${ttal()} </p>

  `
  dv.innerHTML = datos;
  detalleCompra.totalCompra = ttal();
  detalleCompra.cantidadTotal = contadorCant();
  detalleCompra.idCompra = Math.floor(Math.random() * 100000) + 1;
  detalleCompra.fechaHora = fechaHora;

  console.log(detalleCompra)
}

function actualizarDetalleCompra() {
  detalleCompra.productos = carro.map(item => {
    const productoEncontrado = productos.find(prod => prod.id === item.id);
    if (productoEncontrado) {
      return { ...productoEncontrado, cantidad: item.cantidad };
    }
    return item;
  });

  //actualiza la cantidad total y el total de la compra
  detalleCompra.cantidadTotal = carro.reduce((total, item) => total + item.cantidad, 0);
  detalleCompra.totalCompra = carro.reduce((total, item) => {
    const productoEncontrado = productos.find(prod => prod.id === item.id);
    if (productoEncontrado) {
      if (productoEncontrado.hasOwnProperty('descuento')) {
        return total + ((productoEncontrado.price - (productoEncontrado.price * productoEncontrado.descuento / 100)) * item.cantidad);
      } else {
        return total + (productoEncontrado.price * item.cantidad);
      }
    }
    return total;
  }, 0).toFixed(2);
}

document.addEventListener('click', function (event) {
  const prodCard = event.target.closest('.productCard');
  if (prodCard) {
    const input = prodCard.querySelector('.cantNum');
    const prodId = prodCard.id.split('_')[1];
    const pos = carro.findIndex(pr => pr.id === prodId);
    
    console.log(carro.length)
    if (event.target.classList.contains('fa-plus')) {
      input.value = parseInt(input.value) + 1;
      if (pos === -1) {
        carro.push({ id: prodId, cantidad: 1 });
      } else {
        carro[pos].cantidad = parseInt(input.value); 
      }
    } else if (event.target.classList.contains('fa-minus')) {
      if (parseInt(input.value) > 0) {
        
        input.value = parseInt(input.value) - 1;
        if (pos !== -1) {
          carro[pos].cantidad = parseInt(input.value);
          
        }
      }
      
    }

    if (parseInt(input.value) === 0 && pos !== -1) {
      carro.splice(pos, 1); //elimina el elemento del carrito si la cantidad es 0
      prodCard.remove();
    }

    localStorage.setItem('añadidos', JSON.stringify(carro));
    actualizarDetalleCompra();
    finCompra();

  }
});


async function enviarCompra(detalleCompra) {
  try {
    let historialCompras = JSON.parse(localStorage.getItem('historialCompras')) || [];
    historialCompras.push(detalleCompra);
    localStorage.setItem('historialCompras', JSON.stringify(historialCompras));

    console.log('Compra enviada al servidor:', detalleCompra); 

    const response = await fetch('http://localhost:3001/ruta-de-compra', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(historialCompras),
    });
    if (!response.ok) {
      throw new Error(`HTTP error!`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error al enviar la compra:', error);
  }
}

///////////////////////


document.querySelector('.comprar').addEventListener('click', async function (event) {
  try {
    event.preventDefault()
    if (carro.length === 0) {
      console.log('No hay productos en el carrito. No se puede realizar la compra.');
      return;
    }
    const data = await enviarCompra(detalleCompra);
    if (data) {
    
      const confirmationDiv = document.getElementById('confirmacionCompra');
      confirmationDiv.style.display = 'block';

      console.log('Compra registrada con éxito:', data);
      carro.length = 0; 
      localStorage.removeItem('añadidos');
      setTimeout(() => {
        emptyCartIcon.style.display = 'block';
      }, 2000);
      
      
    }
  } catch (error) {
    console.error('Error en la compra:', error);
  }
});




finCompra();


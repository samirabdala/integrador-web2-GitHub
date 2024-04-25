const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
app.use(express.json());
const port = 3001;
app.use(cors());



app.post('/ruta-de-compra', (req, res) => {
  const detalleCompra = req.body;
  fs.writeFile('detalleCompra.json', JSON.stringify(detalleCompra), (err) => {
    if (err) {
      console.error('Error al guardar los detalles de la compra:', err);
      res.status(500).json({ error: 'Error al guardar los detalles de la compra' });
      return;
    }
    console.log('Detalles de la compra guardados correctamente');
    res.json({ message: 'Compra registrada con éxito' }); 
  });
});


app.get('/ruta-de-compra', (req, res) => {
  res.send('Esta es la ruta de compra');
});

const traductor = require("node-google-translate-skidz");

app.post('/traducir', (req, res) => {
  const { texto} = req.body; 

  traductor({
    text: texto,
    source: 'en'
,    target: 'es'
  }, function(result) {
    res.json(result);
  });
});

app.get('/traducir', (req, res) => {
  res.send('Esta es traducir');
});




app.get('/integrador-web2', (req, res) => {
  fs.readFile('./prodDesc.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al leer el archivo de ofertas');
      return;
    }
    res.json(JSON.parse(data));
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

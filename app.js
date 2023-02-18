const express = require('express')
const fs = require('fs/promises')
const url = require('url')
const post = require('./post.js')
const { v4: uuidv4 } = require('uuid')
const mysql = require('mysql2');


// Wait 'ms' milliseconds
function wait (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Start HTTP server
const app = express()

// Set port number
const port = process.env.PORT || 3000

// Publish static files from 'public' folder
app.use(express.static('public'))

// Activate HTTP server
const httpServer = app.listen(port, appListen)
function appListen () {
  console.log(`Listening for HTTP queries on: http://localhost:${port}`)
}

// Set URL rout for POST queries
app.post('/dades', getDades)
async function getDades (req, res) {
  let receivedPOST = await post.getPostObject(req)
  let result = {};

  var textFile = await fs.readFile("./public/consoles/consoles-list.json", { encoding: 'utf8'})
  var objConsolesList = JSON.parse(textFile)
  /*CREATE TABLE Usuaris (
  id INT NOT NULL AUTO_INCREMENT,
  nom VARCHAR(50) NOT NULL,
  cognom VARCHAR(50) NOT NULL,
  correo VARCHAR(100) NOT NULL,
  telefon INTEGER NOT NULL,
  direccio VARCHAR(100) NOT NULL,
  ciutat VARCHAR(50) NOT NULL,
  PRIMARY KEY (id)
);
*/
  if (receivedPOST) {
    if (receivedPOST.type == "test") {
        result = { status: "OK"}
    }
    if (receivedPOST.type == "insertar"){
      await wait(1000);
      await queryDatabase("INSERT INTO Usuaris (nom,cognom,correo,telefon,direccio,ciutat) VALUES ('"+receivedPOST.nom+"','"+receivedPOST.cognom+"','"+receivedPOST.correo+"','"+receivedPOST.telefon+"','"+receivedPOST.direccio+"','"+receivedPOST.ciutat+"')");
      result = {status: "OK"}
    }
    if (receivedPOST.type == "comproUsuario"){
      await wait(1000);
      var conteo = await queryDatabase('SELECT COUNT(*) FROM Usuaris WHERE correo="'+receivedPOST.correo+'"');
      if (Object.values(conteo[0])==0){
        result = {status: "OK"};
      } else{
        result = {status: "NO", result: "errorUsuario"};
      }
    }
    if (receivedPOST.type == "comproNomCognom"){
      await wait(1000);
      var regex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ]+$/;//Se utiliza para comprobar que solo contiene las letras indicadas
      if(regex.test(receivedPOST.nom)){
      	regex = /^[ a-zA-ZñÑáéíóúÁÉÍÓÚ]+$/;//Se utiliza para comprobar que solo contiene las letras indicadas y espacio
        if(regex.test(receivedPOST.cognom)){
          if(receivedPOST.cognom.trim()==""){
            result = {status: "NO", result: "errorApellido"}  
          }else{
            result = {status: "OK"};
          }
        }else{
          result = {status: "NO", result: "errorApellido"}  
        }
      }else{
      	result = {status: "NO", result: "errorNombre"} 
      }
    }
    if (receivedPOST.type == "comproCorreo"){
      await wait(1000);
      var regex = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;//Se utiliza para comprobar que tiene los caracteres caracteristicos del correo (sacado de internet)
      if (regex.test(receivedPOST.correo)){
        result = {status: "OK"};
      } else {
        result = {status: "NO", result: "errorCorreo"} 
      }
    }
    if (receivedPOST.type == "comproTelefono"){
      await wait(1000);
      var regex = /^(\d{9})$/;//Se utiliza para comprobar que contiene exactamente 9 numeros como los telefonos de españa
      if (regex.test(receivedPOST.telefon)){
        result = {status: "OK"};
      } else {
        result = {status: "NO", result: "errorTelefono"} 
      }
    }
    if (receivedPOST.type == "comproDireccio"){
      await wait(1000);
      if(isNaN(receivedPOST.direccio)){
        if (receivedPOST.direccio.trim() == ""){
          result = {status: "NO", result: "errorDireccio"} 
        }else{
          result = {status: "OK"};
        }
      }else{
          result = {status: "NO", result: "errorDireccio"}
      }
    }
    if (receivedPOST.type == "comproCiutat"){
      await wait(1000);
      var regex = /^[ a-zA-ZñÑáéíóúÁÉÍÓÚ]+$/;//Se utiliza para comprobar que solo contiene las letras indicadas y espacio
      if(regex.test(receivedPOST.ciutat)){
      	result = {status: "OK"}
      }else{
      	result = {status: "NO", result: "errorCiutat"} 
      }
    }
    if (receivedPOST.type == "test2") {
      await wait(2000);
      result = { status: "OK"}
    }
    if (receivedPOST.type == "usuarios"){
      await wait(1000);
      var usuarios = await queryDatabase('SELECT id,nom FROM Usuaris');
      result = { status: "OK", result: usuarios}
    }
    if (receivedPOST.type == "usuario"){
      await wait(1000);
      var usuario = await queryDatabase('SELECT * FROM Usuaris WHERE id='+receivedPOST.id);
      result = { status: "OK", result: usuario[0]}
    }
    if (receivedPOST.type == "comprobacionModificar"){
      var array=[];
      await wait(100);
      var conteo = await queryDatabase('SELECT COUNT(*) FROM Usuaris WHERE correo="'+receivedPOST.correo+'" AND id!='+receivedPOST.id);
      if (Object.values(conteo[0])!=0){
        array.push("errorUsuario");
      }
      var regex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ]+$/;//Se utiliza para comprobar que solo contiene las letras indicadas
      if(regex.test(receivedPOST.nom)){
      	regex = /^[ a-zA-ZñÑáéíóúÁÉÍÓÚ]+$/;//Se utiliza para comprobar que solo contiene las letras indicadas y espacio
        if(regex.test(receivedPOST.cognom)){
          if(receivedPOST.cognom.trim()==""){
            array.push("errorNombreApellido"); ;
          } 
        }else{
          array.push("errorNombreApellido"); 
        }
      }else{
        array.push("errorNombreApellido");
      }
      regex = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;//Se utiliza para comprobar que tiene los caracteres caracteristicos del correo (sacado de internet)
      if (!regex.test(receivedPOST.correo)){
        array.push("errorCorreo");
      }
      regex = /^(\d{9})$/;//Se utiliza para comprobar que contiene exactamente 9 numeros como los telefonos de españa
      if (!regex.test(receivedPOST.telefon)){
        array.push("errorTelefono");
      }
      if(isNaN(receivedPOST.direccio)){
        if (receivedPOST.direccio.trim() == ""){
          array.push("errorDireccio");
        }
      }else{
          array.push("errorDireccio");
      }
      regex = /^[ a-zA-ZñÑáéíóúÁÉÍÓÚ]+$/;//Se utiliza para comprobar que solo contiene las letras indicadas y espacio
      if(regex.test(receivedPOST.ciutat)){
        if(receivedPOST.ciutat.trim()==""){
      	  array.push("errorCiutat");
        }
      } else{
        array.push("errorCiutat");
      }
      result = {status: "OK", result:array}
    }
    if (receivedPOST.type == "modificar"){
      await wait(100);
      await queryDatabase("UPDATE Usuaris SET nom='"+receivedPOST.nom+"', cognom='"+receivedPOST.cognom+"', correo='"+receivedPOST.correo+"', telefon='"+receivedPOST.telefon+"', direccio='"+receivedPOST.direccio+"', ciutat='"+receivedPOST.ciutat+"' WHERE id="+receivedPOST.id);
      result = {status: "OK"}
    }
    }

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(result))
}

// Run WebSocket server
const WebSocket = require('ws')
const wss = new WebSocket.Server({ server: httpServer })
const socketsClients = new Map()
console.log(`Listening for WebSocket queries on ${port}`)

// What to do when a websocket client connects
wss.on('connection', (ws) => {

  console.log("Client connected")

  // Add client to the clients list
  const id = uuidv4()
  const color = Math.floor(Math.random() * 360)
  const metadata = { id, color }
  socketsClients.set(ws, metadata)

  // Send clients list to everyone
  sendClients()

  // What to do when a client is disconnected
  ws.on("close", () => {
    socketsClients.delete(ws)
  })

  // What to do when a client message is received
  ws.on('message', (bufferedMessage) => {
    var messageAsString = bufferedMessage.toString()
    var messageAsObject = {}
    
    try { messageAsObject = JSON.parse(messageAsString) } 
    catch (e) { console.log("Could not parse bufferedMessage from WS message") }

    if (messageAsObject.type == "bounce") {
      var rst = { type: "bounce", message: messageAsObject.message }
      ws.send(JSON.stringify(rst))
    } else if (messageAsObject.type == "broadcast") {
      var rst = { type: "broadcast", origin: id, message: messageAsObject.message }
      broadcast(rst)
    } else if (messageAsObject.type == "private") {
      var rst = { type: "private", origin: id, destination: messageAsObject.destination, message: messageAsObject.message }
      private(rst)
    } 
  })
})

// Send clientsIds to everyone
function sendClients () {
  var clients = []
  socketsClients.forEach((value, key) => {
    clients.push(value.id)
  })
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      var id = socketsClients.get(client).id
      var messageAsString = JSON.stringify({ type: "clients", id: id, list: clients })
      client.send(messageAsString)
    }
  })
}

// Send a message to all websocket clients
async function broadcast (obj) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      var messageAsString = JSON.stringify(obj)
      client.send(messageAsString)
    }
  })
}

// Send a private message to a specific client
async function private (obj) {
  wss.clients.forEach((client) => {
    if (socketsClients.get(client).id == obj.destination && client.readyState === WebSocket.OPEN) {
      var messageAsString = JSON.stringify(obj)
      client.send(messageAsString)
      return
    }
  })
}

// Perform a query to the database
function queryDatabase (query) {

  return new Promise((resolve, reject) => {
    var connection = mysql.createConnection({
      host: process.env.MYSQLHOST || "containers-us-west-36.railway.app",
      port: process.env.MYSQLPORT || 5461,
      user: process.env.MYSQLUSER || "root",
      password: process.env.MYSQLPASSWORD || "cvCnFaljTJbezDks0ZWi",
      database: process.env.MYSQLDATABASE || "railway"
    });

    connection.query(query, (error, results) => { 
      if (error) reject(error);
      resolve(results)
    });
     
    connection.end();
  })
}
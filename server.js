// ENVIRONMET 
process.env.NODE_ENV = 'development';


// IMPORT CONFIGURATION FROM EXPRESS
var express = require ('./config/express')


// INITIALIZE HTTP SERVER:
const app = express();
const serverAdress = "127.0.0.1";
const serverPort = 3000;


// LAUNCH SERVER ON PORT 3000:
const server = app.listen(serverPort, serverAdress, () => {
   const host = server.address().address;
   const port = server.address().port;
   console.log('running at http://' + host + ':' + port)
   console.log('running in: ' + process.env.NODE_ENV +' mode');
});
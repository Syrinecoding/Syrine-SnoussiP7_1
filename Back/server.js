// importation du package http
const http = require('http');
// importation de l'app
const app = require('./app');

// renvoi d'un port valide
const normalizePort = val => {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;

    }
    return false;
};
// indiquer à l'app sur quel port tourner
const port = normalizePort(process.env.PORT || '8080');
app.set('port', port);
// gestion des erreurs de port
const errorHandler = error => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe' + address : 'port' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use.');
            process.exit(1);
            break;
        default: 
            throw error;
    }
};
// création du server 
const server = http.createServer(app);
// appel de la fonction de gestion d'erreurs
server.on('error', errorHandler);
// écoute du port d'execution
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe' + address : 'port ' + port;
    console.log('Listening on ' + bind);
});
// Ecoute des requêtes envoyées par le port disponible
server.listen(port);

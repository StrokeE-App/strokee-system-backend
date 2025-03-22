import http from 'http';
import app from './boostrap'

const server = http.createServer(app);

const envPort = process.env.NODE_ENV === 'staging' ? process.env.PORT : process.env.PORT_API

const port = envPort || 4000

server.listen(port, () => {
    console.log('Server is running on port', port);
})
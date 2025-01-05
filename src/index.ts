import http from 'http';
import app from './boostrap'

const server = http.createServer(app);

server.listen(3000, () => {
    console.log('Server is running');
})
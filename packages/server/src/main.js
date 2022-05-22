import { createServer } from 'http';
import { parse } from 'querystring';

const server = createServer((request, response) => {
	let path;

	switch (request.url) {
		case '/status':
			response.writeHead(200, {
				'Content-Type': 'application/json',
			});
			response.write(JSON.stringify({"status": "Okay"}));
			response.end()
			break;
		case '/authenticate':
			let data = '';
			request.on('data', (chunk) => {
				data += chunk;
			});
			request.on('end', () => {
				const authData = parse(data);
				response.end();
			})
			break;
		default:
			response.writeHead(404, 'Service not found');
			response.end();
	}
});

const PORT = process.env.PORT ? parseInt(processs.env.PORT) : 8000;
const HOSTNAME = process.env.HOSTNAME || '192.168.0.231';

server.listen(PORT, HOSTNAME, () => {
	console.log(`Server listening at ${HOSTNAME}:${PORT}`);
});


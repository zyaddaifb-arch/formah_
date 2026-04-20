const { spawn } = require('child_process');

const args = [
    'mcp-remote',
    'https://mcp.rapidapi.com',
    '--header', 'x-api-host: edb-with-videos-and-images-by-ascendapi.p.rapidapi.com',
    '--header', 'x-api-key: 6b2015c2e7msh8ca04620cce05e0p1df693jsn818a4827198b'
];

const child = spawn('npx.cmd', args, {
    stdio: ['pipe', 'pipe', 'inherit'],
    shell: true
});


let output = '';
child.stdout.on('data', (data) => {
    output += data.toString();
    console.log('RECV:', data.toString());
});

const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
};


// Send initialize then listTools (standard MCP handshake)
const initialize = {
    jsonrpc: '2.0',
    id: 0,
    method: 'initialize',
    params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'formah-mapper', version: '1.0.0' }
    }
};

setTimeout(() => {
    console.log('SEND: initialize');
    child.stdin.write(JSON.stringify(initialize) + '\n');
}, 1000);

setTimeout(() => {
    console.log('SEND: listTools');
    child.stdin.write(JSON.stringify(request) + '\n');
}, 3000);

setTimeout(() => {
    child.kill();
}, 10000);

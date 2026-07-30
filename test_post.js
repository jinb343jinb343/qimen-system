const http = require('http');

const data = JSON.stringify({
    session_id: "test_01",
    raw_qimen_json: "test_qimen",
    user_cmd: "现在排盘的信息是什么"
});

const options = {
    hostname: '127.0.0.1',
    port: 8086,
    path: '/api/qimen/chat',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    res.on('data', d => {
        process.stdout.write(d);
    });
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();

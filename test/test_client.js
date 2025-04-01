const net = require('net');

console.log('开始连接服务器...');

const client = new net.Socket();

client.connect(3000, '192.168.199.170', () => {
    console.log('成功连接到服务器');
    
    // 发送测试消息
    client.write('测试消息\n');
});

client.on('data', (data) => {
    console.log('服务器响应：', data.toString());
    client.end();
});

client.on('error', (err) => {
    console.log('连接失败：', err);
});

client.on('close', () => {
    console.log('连接已关闭');
}); 
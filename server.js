const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let activeNicknames = new Set(); // Хранение активных никнеймов

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('новый пользователь подключился');

    socket.on('setNickname', (nickname) => {
        if (activeNicknames.has(nickname)) {
            socket.emit('nicknameError', 'Этот никнейм уже занят, выберите другой.');
        } else {
            activeNicknames.add(nickname);
            socket.nickname = nickname; 

            socket.emit('nicknameSuccess', `Ваш никнейм установлен: ${nickname}`);
        
        io.emit('message', { nickname: 'Система', msg: `${nickname} присоединился к чату.` }); // Уведомление о входе
        }
    });

    socket.on('message', (msg) => {
        if (socket.nickname) {
            console.log('Message: ' + msg);
            io.emit('message', { nickname: socket.nickname, msg }); // Отправка сообщения всем подключенным клиентам
            
        }
    });

    socket.on('disconnect', () => {
        console.log('пользователь отключился');
        activeNicknames.delete(socket.nickname); // Удаляем никнейм из активных при отключении
        if (socket.nickname) {
            io.emit('message', { nickname: 'Система', msg: `${socket.nickname} покинул чат.` }); // Уведомление о выходе
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`сервер включен на  http://localhost:${PORT}`);
});
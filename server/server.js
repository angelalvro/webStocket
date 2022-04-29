var WebSocketServer = require('ws').Server;
wss = new WebSocketServer({ port: 9001 });

//array para almacenar las figuras 
var elementos = { "objects": [] , "clientsId":[]};

wss.on('connection', function connection(ws) {
    ws.id = wss.getUniqueID();

    wss.clients.forEach(function each(client) {
        console.log('Client.ID: ' + client.id);
        if(!elementos.clientsId.includes(client.id)){
            elementos.clientsId.push(client.id);
            console.log(' elementos.clientsId: ' +  elementos.clientsId);
        }
    });

    ws.on('message', function incoming(message) {
        if (isJson(message)) {
            var obj = JSON.parse(message);
            
            console.log('obj: %s', JSON.stringify(obj));

            //Cuando movemos enviamos todo el canvas de nuevo
            if (elementos.objects.filter(function(e) { return e.id === obj.id; }).length > 0) {
                elementIndex = elementos.objects.findIndex((elemento => elemento.id == obj.id));
                elementos.objects[elementIndex] = obj;

                wss.broadcast(message, this);
            }else{
                elementos.objects.push(obj)

                wss.broadcast(message, this);
                console.log('broadcasting data');
            }
        }
        console.log('received: %s', message);
    });
    console.log('sending initial Data %s', JSON.stringify(elementos));

    ws.send(JSON.stringify(elementos));
});

wss.broadcast = function broadcast(data, sentBy) {
    this.clients.forEach(function (cl) {
        if (sentBy.id != cl.id) {
            var figura = { "objects": [] , "clientsId":[]};
            var ultimoObj = [];
            
            var obj = JSON.parse(data);
            ultimoObj.push(obj)
            Array.prototype.push.apply(figura.objects, ultimoObj);

            wss.clients.forEach(function each(client) {
                if(!figura.clientsId.includes(client.id)){
                    figura.clientsId.push(client.id);
                }
            });

            cl.send(JSON.stringify(figura));
        }
    })
};

function isJson(str) {
    try {
        JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    return true;
}

wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

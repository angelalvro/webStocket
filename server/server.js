var WebSocketServer = require('ws').Server;
wss = new WebSocketServer({ port: 9001 });

//array para almacenar las figuras 
var elementos = { "objects": [] };
var persons;

wss.on('connection', function connection(ws) {
    ws.id = wss.getUniqueID();

    wss.clients.forEach(function each(client) {
        console.log('Client.ID: ' + client.id);
    });

    ws.on('message', function incoming(message) {
        if (isJson(message)) {
            var obj = JSON.parse(message);
            
            //if(!elementos.objects.includes(message)){
                console.log('Añado el objeto: %s', JSON.stringify(obj));
                //Funaciona:
                elementos.objects.push(obj)
                //elementos.objects.push(obj[0])
                //Array.prototype.push.apply(elementos.objects, obj);
                console.log('Todos los objetos son: %s', JSON.stringify(elementos));
                wss.broadcast(message, this);
                console.log('broadcasting data');
                console.log('obj: %s', JSON.stringify(obj));
            //}
            
            //if (currentSlideData.indexv != obj.indexv || currentSlideData.indexh != obj.indexh) {
            //actualizar información de currentSlideData
            //}
        }
        console.log('received: %s', message);
    });
    console.log('sending initial Data %s', JSON.stringify(elementos));
    //mandar datos iniciales de sincronización
    if(elementos.objects.length != 0){
        ws.send(JSON.stringify(elementos));
    }
});

wss.broadcast = function broadcast(data, sentBy) {
    console.log('data: %s', data);
    console.log('sentBy.id: %s', sentBy.id);
    console.log('this.clients: %s', this.clients);

    this.clients.forEach(function (cl) {
        console.log('Entra en clientes');
        console.log('cl.id: %s', cl.id);
        if (sentBy.id != cl.id) {
            var figura = { "objects": [] };
            var ultimoObj = [];
            
            var obj = JSON.parse(data);
            ultimoObj.push(obj)
            Array.prototype.push.apply(figura.objects, ultimoObj);
            //Por aqui
            console.log('obj: %s', JSON.stringify(obj));
            console.log('obj[obj.length-1]: %s', JSON.stringify(obj[obj.length-1]));
            console.log('ultimoObj: %s', ultimoObj);
            //Array.prototype.push.apply(figura.objects, ultimoObj);
            console.log('Envia datos para el cl.id: %s', cl.id);
            console.log('JSON.stringify(figura): %s', JSON.stringify(figura));
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

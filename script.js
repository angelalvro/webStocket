window.addEventListener("load", init);

function init() {
    initServer();
    canvas = new fabric.Canvas('canvas');
    canvas.freeDrawingBrush.color = 'green';
    canvas.freeDrawingBrush.lineWidth = 10;
    addCircle.addEventListener('click', addCircleHandler);
    addRectangle.addEventListener('click', addRectangleHandler);
    addTriangle.addEventListener('click', addTriangleHandler);
    selection.addEventListener('click', selectionHandler)
}
function isJson(str) {
    try {
        JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    return true;
}

function addCircleHandler() {
    const obj = {
        id: getUniqueID(),
        radius: randomNumber(),
        fill: randomColor(),
        left: randomNumber(),
        top: randomNumber()
    };
    addObject('Circle', obj);
    sendObject('Circle', obj);
}

function addRectangleHandler() {
    var obj = {
        id: getUniqueID(),
        width: randomNumber(),
        height: randomNumber(),
        fill: randomColor(),
        left: randomNumber(),
        top: randomNumber(),
    };
    addObject('Rectangle', obj);
    sendObject('Rectangle', obj);
}

function addTriangleHandler() {
    var obj = {
        id: getUniqueID(),
        width: randomNumber(),
        height: randomNumber(),
        fill: randomColor(),
        left: randomNumber(),
        top: randomNumber()
    };
    addObject('Triangle', obj);
    sendObject('Triangle', obj);
}

function pencilHandler() {
    canvas.isDrawingMode = true;
}

function selectionHandler() {
    canvas.isDrawingMode = false;
}

function initServer() {
    websocket = new WebSocket('ws://localhost:9001');
    websocket.onopen = connectionOpen;
    websocket.onmessage = onMessageFromServer;
}

function connectionOpen() {
    websocket.send('connection open');
}

function onMessageFromServer(message) {
    console.log('received onMessageFromServer: ' + message.data);
    console.log('received: ' + message);
    if (isJson(message.data)) {
        var obj = JSON.parse(message.data);
        console.log("got data from server");

        var shapes = JSON.parse(message.data);

        var ul = document.getElementById("clients");
        ul.innerHTML = '';
        shapes.clientsId.forEach(showClients);

        var listObjects = canvas.getObjects();

        if(listObjects.filter(function(e) { return e.id === shapes.objects[0].id; }).length > 0){
            console.log("Ha sido un movimiento de objetos");
            elementIndex = listObjects.findIndex((elemento => elemento.id == shapes.objects[0].id));

            //Actualizamos la posicion del objeto del canvas
            canvas.getObjects()[elementIndex].setLeft(shapes.objects[0].left);
            canvas.getObjects()[elementIndex].setTop(shapes.objects[0].top);
            canvas.renderAll();
        }else{
            console.log("Ha sido una creaccion de objetos");
            if (shapes.objects.length != 0) {
                fabric.util.enlivenObjects(shapes.objects, function (enlivenedObjects) {
                    enlivenedObjects.forEach(function (obj, index) {
                        canvas.add(obj);
                    });
                    canvas.renderAll();
                });
            }
        }
    }
}

function showClients(cl) {
    var ul = document.getElementById("clients");
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(cl));
    ul.appendChild(li);
}

function addObject(type, obj) {
    var shape;
    if (type == 'Triangle') {
        shape = new fabric.Triangle(obj);
    }
    else if (type == 'Rectangle') {
        shape = new fabric.Rect(obj);
    }
    else if (type == 'Circle') {
        shape = new fabric.Circle(obj);
    }
    canvas.add(shape)
}

function sendObject() {
    //No se puede mandar todo el canvas solo el objeto en cuestion 
    var listObjects = canvas.getObjects();

    var lastObject = listObjects[listObjects.length - 1];

    //Lo convertimos en un objeto generico para agregarle el id
    var objGenerico = JSON.parse(JSON.stringify(lastObject));
    objGenerico.id = lastObject.id;
    console.log("objGenerico" + JSON.stringify(objGenerico));
    websocket.send(JSON.stringify(objGenerico));
}

function randomNumber() {
    return Math.random() * 250;
}

function randomColor() {
    const colores = ["blue", "green", "red", "black", "gray", "yellow"];
    const index = Math.round(Math.random() * (colores.length - 1));
    return colores[index];
}

function getUniqueID(){
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

window.addEventListener("load", function (event) {
    var isObjectMoving = false;
    canvas.on('object:moving', function (event) {
        isObjectMoving = true;
    });

    canvas.on('mouse:up', function (event) {
        if (isObjectMoving) {
            isObjectMoving = false;

            //Lo convertimos en un objeto generico para agregarle el id
            var objGenerico = JSON.parse(JSON.stringify(event.target));
            objGenerico.id = event.target.id;

            console.log("objGenerico" + JSON.stringify(objGenerico));
            websocket.send(JSON.stringify(objGenerico));
        }
    });
});


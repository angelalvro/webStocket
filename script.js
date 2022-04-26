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
        width: randomNumber(),
        height: randomNumber(),
        fill: randomColor(),
        left: randomNumber(),
        top: randomNumber()
    };
    addObject('Rectangle', obj);
    sendObject('Rectangle', obj);
}

function addTriangleHandler() {
    var obj = {
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
        fabric.util.enlivenObjects(shapes.objects, function (enlivenedObjects) {
            enlivenedObjects.forEach(function (obj, index) {
                console.log('canvas.add(obj): ' + obj);
                canvas.add(obj);
            });
            canvas.renderAll();
        });
        //añadimos el objeto
    }
}

function addObject(type, obj) {
    console.log("add");
    console.log(type);
    console.log(obj);
    console.log(canvas);
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
    //Put the shape on the Canvas
    console.log("shape: " + JSON.stringify(shape));
    canvas.add(shape)
}

function sendObject() {
    //No se puede mandar todo el canvas solo el objeto en cuestion 
    console.log("Enviamos datos al servidor");
    console.log("Objetos del canvas" + JSON.stringify(canvas.getObjects()));


    var listObjects = canvas.getObjects();
    console.log("listObjects" + listObjects);

    var lastObject = listObjects[listObjects.length-1];
    console.log("lastObject" + lastObject);
    console.log("JSON.stringify(lastObject)" + JSON.stringify(lastObject));
    //Enviamos el Json como string. SOlo el ultimo objeto creado
    websocket.send(JSON.stringify(lastObject));
}

function randomNumber() {
    return Math.random() * 250;
}

function randomColor() {
    const colores = ["blue", "green", "red", "black", "gray", "yellow"];
    const index = Math.round(Math.random() * (colores.length - 1));
    return colores[index];
}
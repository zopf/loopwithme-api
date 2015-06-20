var WebSocketServer = require('websocket').server;
var http = require('http');
var _ = require('underscore');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

var port = process.env.PORT || 5000;
server.listen(port, function() { 
  console.log((new Date()) + ' Server is listening on port ' + port);
});

// create a global event emitter
var EventEmitter = require('events').EventEmitter;
var event_server = new EventEmitter();

// create the server
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

var gridState = {
  "rows": 3,
  "cols": 3,
  "loop_length": 16,
  "cells": [

  ]
};

function initializeGridState() {
  for(var row=0; row < gridState.rows; row++) {
    for(var col=0; col < gridState.cols; col++) {
      gridState.cells.push(
        {
          "row": row,
          "col": col,
          "loop": Array.apply(null, 
              Array( gridState.loop_length )
            ).map( Number.prototype.valueOf, 0 )
        }
      );
    }
  }
}
initializeGridState();

function getGridState() {
  return gridState;
}

function updateCell(row, col, loop) {
  var cell = _.where(gridState.cells, {"row":row, "col":col})[0];
  cell.loop = loop;
  console.log((new Date()) + ' Cell (' + row + ',' + col + ') updated.');
  event_server.emit('cell_update', {
    action: 'cell_update',
    row: cell.row,
    col: cell.col,
    loop: cell.loop
  });
  console.log((new Date()) + ' Update for cell (' + row + ',' + col + ') pushed to clients.');
}

function routeIncomingMessage(obj) {
  if(obj.action=='cell_update') {
    updateCell(obj.row, obj.col, obj.loop);
  }
}

// WebSocket server
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept(null, request.origin);
    console.log((new Date()) + ' Connection accepted.');
    var gridMessage = {};
    _.extend(gridMessage, getGridState());
    gridMessage.action='grid_update';
    connection.sendUTF(JSON.stringify(gridMessage));
    console.log((new Date()) + ' Initial grid state sent.');

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            try {
              var obj = JSON.parse(message.utf8Data);
              // route message according to action
              routeIncomingMessage(obj);
            } catch(e) {
              console.log('oops, error: '+e);
            }
        }
    });

    event_server.on('cell_update', function(updated_cell) {
      connection.sendUTF(JSON.stringify(updated_cell));
    });

    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
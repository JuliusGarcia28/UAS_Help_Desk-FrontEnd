const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({

  name:'HelpDesk Inventory Agent',

  description: 'Recolecta inventario de hardware y software',

  script: path.join(__dirname, 'agent.js')

});

svc.on('install',function(){

  svc.start();

  console.log('Servicio instalado.');

});

svc.install();

/*
// INSTALACION
const Service = require('node-windows').Service;

const svc = new Service({

  name:'HelpDesk Inventory Agent',

  description: 'Recolecta inventario de hardware y software',

  script: 'C:\\Users\\Julius\\Desktop\\Agente_Recolector\\agent.js'

});

svc.on('install',function(){

  svc.start();

  console.log('Servicio instalado y ejecutándose.');

});

svc.install();

// DESINTALACION

const Service = require('node-windows').Service;

const svc = new Service({
  name:'HelpDesk Inventory Agent',
   script: 'C:\\Users\\Julius\\Desktop\\Agente_Recolector\\agent.js'
});

svc.on('uninstall',function(){
  console.log('Servicio eliminado correctamente');
});

svc.uninstall();*/
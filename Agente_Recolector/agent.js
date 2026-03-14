const si = require('systeminformation');
const axios = require('axios');

async function collectInventory() {

    const cpu = await si.cpu();
    const mem = await si.mem();
    const os = await si.osInfo();
    const system = await si.system();
    const network = await si.networkInterfaces();

    const ip = network.find(n => !n.internal && n.ip4);

    return {

        hostname: os.hostname,

        asset_type: "desktop",

        model: system.model,

        serial_number: system.serial,

        operative_system: os.distro + " " + os.release,

        ip_address: ip ? ip.ip4 : null,

        cpu: cpu.brand,

        ram: Math.round(mem.total / (1024 * 1024 * 1024)) // convertir a GB
    };

}

async function sendInventory() {

    try {

        const data = await collectInventory();

        await axios.post(
            "http://localhost:8000/assets/agent/register/",
            data
        );

        console.log("Inventario enviado");

    } catch (error) {

        console.error("Error:", error.message);

    }

}

async function startAgent() {

    console.log("Agente iniciado");

    await sendInventory();

    setInterval(sendInventory, 1000 * 60 * 10);

}

startAgent();
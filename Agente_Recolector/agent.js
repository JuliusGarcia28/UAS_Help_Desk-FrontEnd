const si = require('systeminformation');
const axios = require('axios');

const API_URL = "http://localhost:8000/assets/agent";

// =============================
// Obtener inventario
// =============================
async function collectInventory() {
    try {
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
            ram: Math.round(mem.total / (1024 * 1024 * 1024))
        };

    } catch (error) {
        console.error("Error recolectando inventario:", error.message);
        throw error;
    }
}

// =============================
// Comparar cambios
// =============================
function getDifferences(localData, serverData) {
    const changes = {};

    for (const key in localData) {
        if (localData[key] !== serverData[key]) {
            changes[key] = localData[key];
        }
    }

    return changes;
}

// =============================
// Lógica principal
// =============================
async function syncInventory() {

    try {
        const data = await collectInventory();

        console.log("Verificando equipo:", data.serial_number);

        // 1. Verificar si existe
        const response = await axios.get(
            `${API_URL}/${data.serial_number}/`
        );

        // 2. Si NO existe → registrar
        if (!response.data.exists) {

            console.log("Equipo no registrado. Registrando...");

            await axios.post(
                `${API_URL}/register/`,
                data
            );

            console.log("Equipo registrado correctamente");
            return;
        }

        // 3. Si existe → comparar
        const serverData = response.data.data;

        const changes = getDifferences(data, serverData);

        if (Object.keys(changes).length === 0) {
            console.log("Sin cambios. No se actualiza.");
            return;
        }

        console.log("Cambios detectados:", changes);

        // 4. Actualizar solo cambios
        await axios.patch(
            `${API_URL}/register/${data.serial_number}/`,
            changes
        );

        console.log("Equipo actualizado");

    } catch (error) {

        if (error.response) {
            console.error("Error servidor:", error.response.data);
        } else if (error.request) {
            console.error("Servidor no responde");
        } else {
            console.error("Error:", error.message);
        }
    }
}

// =============================
// Inicio del agente
// =============================
async function startAgent() {

    console.log("Agente iniciado");

    // Primera ejecución
    await syncInventory();

    // Ejecutar cada vez que inicia sistema (puedes dejarlo así o quitar intervalo)
    setInterval(syncInventory, 1000 * 60 * 10);
}

startAgent();

//Anterior

/*const si = require('systeminformation');
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

startAgent();*/
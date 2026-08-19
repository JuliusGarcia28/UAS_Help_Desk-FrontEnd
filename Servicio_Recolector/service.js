// Manejo de errores globales
process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION");
    console.error(err);
});

process.on("unhandledRejection", (reason) => {
    console.error("UNHANDLED PROMISE");
    console.error(reason);
});

console.log("================================");
console.log("Inventory Service iniciado");
console.log("Node:", process.version);
console.log("================================");

const si = require('systeminformation');
const axios = require('axios');

const API_URL = "https://uas-helpdesk-backend.onrender.com/assets/agent";

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
            `${API_URL}/update/${data.serial_number}/`,
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
// Inicio del servicio
// =============================
async function startService() {

    console.log("Servicio iniciado");

    // Primera ejecución
    await syncInventory();

    // Ejecutar cada vez que inicia sistema
    setInterval(syncInventory, 1000 * 60 * 10);

    // Revisión diaria completa
    setInterval(async () => {
        console.log("Revisión diaria completa del inventario...");

        try {
            const data = await collectInventory();

            const response = await axios.get(
                `${API_URL}/${data.serial_number}/`
            );

            if (!response.data.exists) {
                console.log("No existe en revisión diaria, registrando...");
                await axios.post(`${API_URL}/register/`, data);
                return;
            }

            const serverData = response.data.data;
            const changes = getDifferences(data, serverData);

            if (Object.keys(changes).length === 0) {
                console.log("Revisión diaria: sin cambios");
                return;
            }

            console.log("Revisión diaria: cambios detectados", changes);

            await axios.patch(
                `${API_URL}/update/${data.serial_number}/`,
                changes
            );

            console.log("Revisión diaria: equipo actualizado");

        } catch (error) {
            console.error("Error en revisión diaria:", error.message);
        }

    }, 1000 * 60 * 60 * 24);
}

startService();
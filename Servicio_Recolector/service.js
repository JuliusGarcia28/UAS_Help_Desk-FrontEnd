// require("dotenv").config();

const path = require("path");

// 1. Detectar si estamos ejecutando el binario compilado (.exe) o con node normal
const isCompiled = typeof process.pkg !== 'undefined';

// 2. Obtener la ruta de la carpeta donde realmente está el ejecutable
const baseDir = isCompiled ? path.dirname(process.execPath) : __dirname;

// 3. Cargar el .env explícitamente desde esa carpeta
require("dotenv").config({ path: path.join(baseDir, "agent.env") });

// =============================
// Manejo de errores globales
// =============================

process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION");
    console.error(err);
});

process.on("unhandledRejection", (reason) => {
    console.error("UNHANDLED PROMISE");
    console.error(reason);
});

console.log("================================");
console.log("HelpDesk Inventory Service");
console.log("Node:", process.version);
console.log("================================");

const si = require("systeminformation");
const axios = require("axios");

// =============================
// Configuración
// =============================

const API_URL =
    "https://uas-helpdesk-backend.onrender.com/assets/agent";

const API_KEY = process.env.HELPDESK_AGENT_API_KEY;

if (!API_KEY) {
    console.error(
        "ERROR: No está configurada la variable HELPDESK_AGENT_API_KEY"
    );

    process.exit(1);
}

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        "X-Agent-Key": API_KEY,
        "Content-Type": "application/json"
    }
});

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

        const ip = network.find(
            n => !n.internal && n.ip4
        );

        const serial =
            system.serial &&
            system.serial !== "unknown"
                ? system.serial.trim()
                : null;

        if (!serial) {
            throw new Error(
                "No se pudo obtener el número de serie del equipo"
            );
        }

        return {

            hostname: os.hostname,

            asset_type: "desktop",

            model: system.model || null,

            serial_number: serial,

            operative_system:
                `${os.distro} ${os.release}`.trim(),

            ip_address:
                ip ? ip.ip4 : null,

            cpu:
                cpu.brand || null,

            ram:
                Math.round(
                    mem.total /
                    (1024 * 1024 * 1024)
                )
        };

    } catch (error) {

        console.error(
            "Error recolectando inventario:",
            error.message
        );

        throw error;
    }
}

// =============================
// Comparar cambios
// =============================

function getDifferences(localData, serverData) {

    const changes = {};

    for (const key of Object.keys(localData)) {

        if (localData[key] !== serverData[key]) {

            changes[key] = localData[key];

        }
    }

    return changes;
}

// =============================
// Sincronizar inventario
// =============================

async function syncInventory() {

    try {

        const data = await collectInventory();

        console.log(
            "Verificando equipo:",
            data.serial_number
        );

        // =============================
        // 1. Consultar equipo
        // =============================

        const response = await api.get(
            `/${encodeURIComponent(data.serial_number)}/`
        );

        // =============================
        // 2. Registrar si no existe
        // =============================

        if (!response.data.exists) {

            console.log(
                "Equipo no registrado. Registrando..."
            );

            await api.post(
                "/register/",
                data
            );

            console.log(
                "Equipo registrado correctamente"
            );

            return;
        }

        // =============================
        // 3. Comparar
        // =============================

        const serverData =
            response.data.data;

        const changes =
            getDifferences(
                data,
                serverData
            );

        if (
            Object.keys(changes).length === 0
        ) {

            console.log(
                "Sin cambios. No se actualiza."
            );

            return;
        }

        console.log(
            "Cambios detectados:",
            changes
        );

        // =============================
        // 4. Actualizar
        // =============================

        await api.patch(
            `/update/${encodeURIComponent(data.serial_number)}/`,
            changes
        );

        console.log(
            "Equipo actualizado"
        );

    } catch (error) {

        if (error.response) {

            console.error(
                "Error servidor:",
                error.response.status,
                error.response.data
            );

        } else if (error.request) {

            console.error(
                "Servidor no responde:",
                error.message
            );

        } else {

            console.error(
                "Error:",
                error.message
            );
        }
    }
}

// =============================
// Inicio del servicio
// =============================

async function startService() {

    console.log(
        "Servicio iniciado"
    );

    // Primera sincronización
    await syncInventory();

    // Cada 10 minutos
    setInterval(
        syncInventory,
        1000 * 60 * 10
    );

    // =============================
    // Revisión diaria
    // =============================

    setInterval(
        async () => {

            console.log(
                "Revisión diaria completa..."
            );

            await syncInventory();

        },
        1000 * 60 * 60 * 24
    );
}

startService();

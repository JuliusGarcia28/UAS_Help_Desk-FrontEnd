const { app, BrowserWindow, shell, nativeTheme } = require("electron");
const path = require("path");

function createWindow() {

    const win = new BrowserWindow({

        width: 1400,

        height: 900,

        minWidth: 1100,

        minHeight: 700,

        autoHideMenuBar: true,

        // Se muestra al terminar de pintar para evitar el destello blanco inicial.
        show: false,

        backgroundColor: nativeTheme.shouldUseDarkColors ? "#0B1220" : "#F4F7FB",

        title: "HelpDesk",

        webPreferences: {

            preload: path.join(__dirname, "preload.js"),

            contextIsolation: true,

            nodeIntegration: false

        }

    });

    win.once("ready-to-show", () => win.show());

    // Enlaces externos (p. ej. descarga del instalador) se abren en el navegador
    // del sistema en lugar de crear otra ventana de Electron.
    win.webContents.setWindowOpenHandler(({ url }) => {

        if (/^https?:\/\//i.test(url)) {
            shell.openExternal(url);
        }

        return { action: "deny" };

    });

    // La aplicacion es una SPA cargada desde disco: cualquier navegacion
    // externa se envia al navegador del sistema.
    win.webContents.on("will-navigate", (event, url) => {

        if (/^https?:\/\//i.test(url)) {
            event.preventDefault();
            shell.openExternal(url);
        }

    });

    // win.webContents.openDevTools();

    /*win.webContents.on("did-fail-load", (event, code, description) => {

        console.error("Error cargando la página");

        console.error(code);

        console.error(description);

    });*/

    /*win.webContents.on("console-message", (_, level, message) => {

        console.log("[Renderer]", message);

    });*/

    const isDev = !app.isPackaged;

    let indexPath;

    if (isDev) {

        indexPath = path.join(

            __dirname,

            "..",

            "Help_Desk_Frontend",

            "dist",

            "Help_Desk_Frontend",

            "browser",

            "index.html"

        );

    } else {

        indexPath = path.join(

            process.resourcesPath,

            "frontend",

            "Help_Desk_Frontend",

            "browser",

            "index.html"

        );

    }

    console.log("Cargando:");

    console.log(indexPath);

    win.loadFile(indexPath)
        .catch(console.error);

}

app.whenReady().then(() => {

    createWindow();

    app.on("activate", () => {

        if (BrowserWindow.getAllWindows().length === 0) {

            createWindow();

        }

    });

});

app.on("window-all-closed", () => {

    if (process.platform !== "darwin") {

        app.quit();

    }

});
const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {

    const win = new BrowserWindow({

        width: 1400,

        height: 900,

        minWidth: 1100,

        minHeight: 700,

        autoHideMenuBar: true,

        show: true,

        webPreferences: {

            preload: path.join(__dirname, "preload.js"),

            contextIsolation: true,

            nodeIntegration: false

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
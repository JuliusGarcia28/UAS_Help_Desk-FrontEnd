const {
    contextBridge
} = require("electron");


contextBridge.exposeInMainWorld(
    "electronAPI",
    {

        version: () => {

            return "1.0.0";

        }

    }
);
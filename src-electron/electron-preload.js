/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 */
import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('recipeApi', {
    request: async (url) => {
        return await ipcRenderer.invoke('request', url)
    },
    writeJSON: async (fileName, data) => {
        return await ipcRenderer.invoke('writeJSON', fileName, data)
    },
    readJSON: async (fileName) => {
        return await ipcRenderer.invoke('readJSON', fileName)
    },
})

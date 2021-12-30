import { boot } from 'quasar/wrappers'
import { Platform } from 'quasar'

export default boot(({ app }) => {
    if (!Platform.is.electron && !Platform.is.capacitor) {
        window.recipeApi = {
            writeJSON: async (fileName, data) => {
                console.log(`write fileName = ${fileName}, data = ${data}`)
            },
            readJSON: async (fileName) => {
                console.log(`read fileName = ${fileName}`)
                return [];
            },
            request: async (url) => {
                console.log(`request ${url}`)
            },
        };
    }
})

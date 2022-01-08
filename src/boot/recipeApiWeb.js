import { boot } from 'quasar/wrappers'
import { Platform } from 'quasar'

const checkResponse = (response) => {
    if (response.status > 400)
        throw 'Unauthorized';
}

export default boot(({ app }) => {
    if (!Platform.is.electron && !Platform.is.capacitor) {
        window.recipeApi = {
            writeJSON: async (fileName, data) => {
                const dataString = JSON.stringify({data,});
                localStorage.setItem(fileName, dataString);
                const response = await fetch(`${process.env.API}/api/io/write/${fileName}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: dataString,
                });
                checkResponse(response);
            },
            readJSON: async (fileName) => {
                if (!navigator.onLine) {
                    const localValue = localStorage.getItem(fileName);
                    if (!localValue) {
                        throw 'Unauthorized';
                    } else {
                        return JSON.parse(localValue);
                    }
                } else {
                    const response = await fetch(`${process.env.API}/api/io/read/${fileName}`, {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                    checkResponse(response);
                    const jsonData = await response.json();
                    if (jsonData.data) {
                        localStorage.setItem(fileName, jsonData.data);
                        return JSON.parse(jsonData.data);
                    }
                    return [];
                }
            },
            request: async (url) => {
                const response = await fetch(`${process.env.API}/api/io/fetch`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: url,
                });
                checkResponse(response);
                return await response.text();
            },
        };
    }
})
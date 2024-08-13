export const request = path =>{
    // define .env/VITE_BASEURL
    return fetch(`${import.meta.env.VITE_BASEURL}${path}`)
}
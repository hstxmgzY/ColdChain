import { http } from "./request"

export const getData = () => {
    return http.get('/data')
}


import axios from 'axios'
import { BASE_URL } from '../config'

export const login = async (username, password) => {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)

    const response = await axios.post(`${BASE_URL}/login`, formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })

    return response.data
}

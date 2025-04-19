import axios from 'axios';
import {BASE_URL} from "@/config.js";

// 验证 token 是否有效
export const verifyToken = async (token) => {
    try {
        const response = await axios.get(`${BASE_URL}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,  // 使用 Bearer token 作为 Authorization 头
            }
        });
        return response.data.valid; // 返回 token 是否有效(True)
    } catch (error) {
        console.error('Token verification failed:', error);
        return false; // 如果验证失败，返回 false
    }
};

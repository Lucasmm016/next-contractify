import axios, {} from 'axios';
export function createAxiosInstance(config) {
    return axios.create({
        headers: {
            'Content-Type': 'application/json',
        },
        ...config,
    });
}
//# sourceMappingURL=axiosInstance.js.map
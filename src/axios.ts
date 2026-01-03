import axios, { type CreateAxiosDefaults } from 'axios'

export function createAxiosInstance(config?: CreateAxiosDefaults) {
  return axios.create({
    headers: {
      'Content-Type': 'application/json',
    },
    ...config,
  })
}
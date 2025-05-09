import axios from 'axios'
const baseUrl = '/api/users'

const getAll = () => {
  return axios.get(baseUrl).then((response) => response.data)
}

export default { getAll }

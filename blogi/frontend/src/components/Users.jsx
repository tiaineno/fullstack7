import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import userService from '../services/users'
import { Table } from 'react-bootstrap'

const Users = () => {
  const [users, setUsers] = useState([])

  useEffect(() => {
    userService.getAll().then((users) => setUsers(users))
  }, [])

  return (
    <div>
      <Table striped>
        <thead>
          <tr>
            <th>Nimi</th>
            <th>Blogien määrä</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <Link to={`/users/${user.id}`}>{user.name}</Link>
              </td>
              <td>{user.blogs.length}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

export default Users

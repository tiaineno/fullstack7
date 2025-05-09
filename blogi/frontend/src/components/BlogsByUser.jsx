import { useParams } from 'react-router-dom'

const BlogsByUser = ({ blogs }) => {
    const { id } = useParams()

    const userBlogs = blogs.filter(blog => blog.user.id === id)

    return (
        <div>
            <h2>Blogs by User</h2>
            {userBlogs.map(blog => (
                <div key={blog.id}>
                  {blog.title}
                </div>
            ))}
        </div>
    )
}

export default BlogsByUser

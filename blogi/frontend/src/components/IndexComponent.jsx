import Blog from './Blog'
import Togglable from './Togglable'
import NewBlog from './NewBlog'

const Index = ({ blogs, handleCreate, handleVote, handleDelete, blogFormRef }) => (
  <div>
    <Togglable buttonLabel="create new blog" ref={blogFormRef}>
      <NewBlog doCreate={handleCreate} />
    </Togglable>
    {blogs.sort((a, b) => b.likes - a.likes).map((blog) => (
      <Blog
        key={blog.id}
        blog={blog}
        handleVote={handleVote}
        handleDelete={handleDelete}
      />
    ))}
  </div>
)

export default Index

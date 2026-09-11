import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function Student() {
  const [code, setCode] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault() // stops the page from reloading on submit
    if (code.trim() === '') return // ignore empty submissions
    navigate(`/student/assessment/${code.trim()}`)
  }

  return (
    <div>
      <h1>Student Portal</h1>
      <p>Enter the review code your teacher gave you.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. MED-8942"
        />
        <button type="submit">Enter Assessment Room</button>
      </form>

      <Link to="/">← Back to Home</Link>
    </div>
  );
}

export default Student;
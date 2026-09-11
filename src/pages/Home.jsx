import { Link } from 'react-router-dom'

function Home() {
  return (
    <div>
      <h1>MedTechEval</h1>
      <p>Welcome! Choose your role to continue.</p>
      <nav>
        <Link to="/student">I'm a Student</Link>
        {' | '}
        <Link to="/teacher">I'm a Teacher</Link>
      </nav>
    </div>
  );
}

export default Home;
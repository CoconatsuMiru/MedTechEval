import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">MedTechEval</h1>
        <p className="text-slate-600 mb-6">Welcome! Choose your role to continue.</p>
        <div className="flex justify-center gap-4">
          <Link
            to="/student"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            I'm a Student
          </Link>
          <Link
            to="/teacher"
            className="bg-slate-800 hover:bg-slate-900 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            I'm a Teacher
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
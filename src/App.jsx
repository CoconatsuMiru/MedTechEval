import { Routes, Route } from 'react-router-dom'
import { ReviewerProvider } from './context/ReviewerContext'
import Home from './pages/Home'
import Student from './pages/Student'
import Teacher from './pages/Teacher'
import Assessment from './pages/Assessment'
import CreateReviewer from './pages/CreateReviewer'

function App() {
  return (
    <ReviewerProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student" element={<Student />} />
        <Route path="/student/assessment/:code" element={<Assessment />} />
        <Route path="/teacher" element={<Teacher />} />
        <Route path="/teacher/create" element={<CreateReviewer />} />
      </Routes>
    </ReviewerProvider>
  )
}

export default App
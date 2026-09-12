import { Routes, Route } from 'react-router-dom'
import { ReviewerProvider } from './context/ReviewerContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Student from './pages/Student'
import Teacher from './pages/Teacher'
import Assessment from './pages/Assessment'
import CreateReviewer from './pages/CreateReviewer'
import EditReviewer from './pages/EditReviewer'
import SignUp from './pages/SignUp'
import Login from './pages/Login'

function App() {
  return (
    <AuthProvider>
      <ReviewerProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />

          {/* Student-only routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRole="student">
                <Student />
              </ProtectedRoute>
            }
          />

          {/* Teacher-only routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRole="teacher">
                <Teacher />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/create"
            element={
              <ProtectedRoute allowedRole="teacher">
                <CreateReviewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/edit/:code"
            element={
              <ProtectedRoute allowedRole="teacher">
                <EditReviewer />
              </ProtectedRoute>
            }
          />

          {/* Assessment: any logged-in user can take a quiz */}
          <Route
            path="/student/assessment/:code"
            element={
              <ProtectedRoute>
                <Assessment />
              </ProtectedRoute>
            }
          />
        </Routes>
      </ReviewerProvider>
    </AuthProvider>
  )
}

export default App
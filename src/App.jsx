import { Routes, Route } from 'react-router-dom'
import { ReviewerProvider } from './context/ReviewerContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import Toast from './components/Toast'
import Home from './pages/Home'
import Student from './pages/Student'
import Teacher from './pages/Teacher'
import ManageBookChapters from './pages/ManageBookChapters'
import BookChapters from './pages/BookChapters'
import Assessment from './pages/Assessment'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import StudentHistory from './pages/StudentHistory'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ReviewerProvider>
          <Toast />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />

            <Route path="/student" element={<ProtectedRoute allowedRole="student"><Student /></ProtectedRoute>} />
            <Route path="/student/book/:code" element={<ProtectedRoute allowedRole="student"><BookChapters /></ProtectedRoute>} />
            <Route path="/student/history" element={<ProtectedRoute allowedRole="student"><StudentHistory /></ProtectedRoute>} />

            <Route path="/teacher" element={<ProtectedRoute allowedRole="teacher"><Teacher /></ProtectedRoute>} />
            <Route path="/teacher/books/:bookId" element={<ProtectedRoute allowedRole="teacher"><ManageBookChapters /></ProtectedRoute>} />

            <Route path="/student/assessment/:reviewerId" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
          </Routes>
        </ReviewerProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
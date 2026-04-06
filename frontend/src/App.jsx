import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TasksPage from './pages/TasksPage'
import DocumentsPage from './pages/DocumentsPage'
import ProtectedRoute from './components/common/ProtectedRoute'

/**
 * Root application component with routing.
 * Public route: /login
 * Protected routes: /dashboard, /tasks, /documents
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />

      <Route path="/tasks" element={
        <ProtectedRoute>
          <TasksPage />
        </ProtectedRoute>
      } />

      <Route path="/documents" element={
        <ProtectedRoute>
          <DocumentsPage />
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

import { useAuth } from '../context/AuthContext'
import Layout from '../components/layout/Layout'
import AdminDashboard from '../components/dashboard/AdminDashboard'
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard'

/**
 * Dashboard page that renders role-specific dashboard content.
 */
export default function DashboardPage() {
  const { isAdmin } = useAuth()

  return (
    <Layout>
      {isAdmin ? <AdminDashboard /> : <EmployeeDashboard />}
    </Layout>
  )
}

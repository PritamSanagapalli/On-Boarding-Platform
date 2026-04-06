import { useState, useEffect } from 'react'
import api from '../../services/api'
import StatCard from './StatCard'
import Badge from '../common/Badge'
import LoadingSpinner from '../common/LoadingSpinner'
import {
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineCheckCircle,
  HiOutlineClock,
} from 'react-icons/hi'

/**
 * Admin dashboard showing total stats and per-employee progress.
 */
export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/admin')
      setData(res.data.data)
    } catch (error) {
      console.error('Failed to fetch admin dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading dashboard..." />

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Unable to load dashboard data.</p>
      </div>
    )
  }

  const completionRate = data.totalTasks > 0
    ? Math.round((data.completedTasks / data.totalTasks) * 100)
    : 0

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={HiOutlineUsers}
          label="Total Employees"
          value={data.totalEmployees}
          color="primary"
        />
        <StatCard
          icon={HiOutlineClipboardList}
          label="Total Tasks"
          value={data.totalTasks}
          color="blue"
        />
        <StatCard
          icon={HiOutlineCheckCircle}
          label="Completed Tasks"
          value={data.completedTasks}
          color="emerald"
        />
        <StatCard
          icon={HiOutlineClock}
          label="Pending Tasks"
          value={data.pendingTasks}
          color="amber"
        />
      </div>

      {/* Completion progress bar */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Overall Completion</h3>
          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{completionRate}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full gradient-primary transition-all duration-1000 ease-out"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Employee progress table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Employee Progress</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-dark-bg">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tasks</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Documents</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {data.employeeProgress?.map((emp) => {
                const progress = emp.totalTasks > 0
                  ? Math.round((emp.completedTasks / emp.totalTasks) * 100)
                  : 0
                return (
                  <tr key={emp.userId} className="hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=6366f1&color=fff&size=32`}
                          alt={emp.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{emp.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{emp.totalTasks}</td>
                    <td className="px-6 py-4">
                      <Badge variant="completed">{emp.completedTasks}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="text-emerald-600 dark:text-emerald-400">{emp.submittedDocuments}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-gray-600 dark:text-gray-300">{emp.pendingDocuments + emp.submittedDocuments}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{progress}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {(!data.employeeProgress || data.employeeProgress.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No employees found. New employees will appear here after they log in.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

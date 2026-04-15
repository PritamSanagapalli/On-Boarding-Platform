import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import StatCard from './StatCard'
import Badge from '../common/Badge'
import LoadingSpinner from '../common/LoadingSpinner'
import {
  HiOutlineClipboardList,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineLightningBolt,
  HiOutlineArrowRight,
} from 'react-icons/hi'
import { Link } from 'react-router-dom'

/**
 * Animated progress ring
 */
function ProgressRing({ percentage, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const getColor = (pct) => {
    if (pct >= 75) return '#10b981'  // emerald
    if (pct >= 50) return '#f59e0b'  // amber
    return '#6366f1'                 // primary
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="progress-ring">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(percentage)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{percentage}%</span>
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Complete</span>
      </div>
    </div>
  )
}

/**
 * Quick action card
 */
function QuickAction({ icon: Icon, label, description, to, color }) {
  return (
    <Link
      to={to}
      className="group glass-card-hover p-5 flex items-start gap-4"
    >
      <div className={`p-2.5 rounded-xl bg-${color}-50 dark:bg-${color}-500/10 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-5 h-5 text-${color}-500`} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {label}
        </h4>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <HiOutlineArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 group-hover:translate-x-1 transition-all mt-1" />
    </Link>
  )
}

/**
 * Employee dashboard showing personal task stats and upcoming deadlines.
 */
export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/employee')
      setData(res.data.data)
    } catch (error) {
      console.error('Failed to fetch employee dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Unable to load dashboard data.</p>
        <button onClick={fetchDashboard} className="btn-primary mt-4">Retry</button>
      </div>
    )
  }

  const completionRate = data.totalTasks > 0
    ? Math.round((data.completedTasks / data.totalTasks) * 100)
    : 0

  const docTotal = (data.pendingDocuments || 0) + (data.submittedDocuments || 0) + (data.approvedDocuments || 0) + (data.rejectedDocuments || 0)
  const docApproved = data.approvedDocuments || 0
  const docRate = docTotal > 0 ? Math.round((docApproved / docTotal) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner with progress ring */}
      <div className="gradient-hero rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cmVjdCB3aWR0aD0iMiIgaGVpZ2h0PSI0MCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
            <p className="mt-2 text-primary-200 text-sm max-w-md">
              {completionRate === 100
                ? 'You\'ve completed all your onboarding tasks. Amazing work! 🎉'
                : completionRate >= 50
                  ? `You're making great progress! ${100 - completionRate}% more to go.`
                  : 'Let\'s get started with your onboarding tasks!'}
            </p>
            {/* Mini progress bar */}
            <div className="mt-4 w-72 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-xs text-primary-200/70 mt-1.5">
              {data.completedTasks} of {data.totalTasks} tasks completed
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
              <ProgressRing percentage={completionRate} />
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={HiOutlineClipboardList} label="Total Tasks" value={data.totalTasks} color="primary" />
        <StatCard icon={HiOutlineCheckCircle} label="Completed" value={data.completedTasks} color="emerald" />
        <StatCard icon={HiOutlineClock} label="Pending" value={data.pendingTasks} color="amber" />
        <StatCard icon={HiOutlineDocumentText} label="Documents" value={`${docApproved}/${docTotal}`} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming deadlines — 2/3 width */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HiOutlineCalendar className="w-5 h-5 text-primary-500" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h3>
            </div>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-dark-bg px-2 py-1 rounded-full">
              Next 7 days
            </span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-dark-border">
            {data.upcomingDeadlines?.length > 0 ? (
              data.upcomingDeadlines.map((task, idx) => (
                <div
                  key={task.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors animate-slide-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${
                      task.priority === 'HIGH' ? 'bg-red-500' :
                      task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={task.priority?.toLowerCase()}>{task.priority}</Badge>
                    <span className="text-xs font-medium text-red-500 dark:text-red-400 whitespace-nowrap">
                      📅 {new Date(task.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <span className="text-3xl">🎉</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No upcoming deadlines this week!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions — 1/3 width */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">Quick Actions</h3>
          <QuickAction
            icon={HiOutlineClipboardList}
            label="View Tasks"
            description="Check your pending tasks"
            to="/tasks"
            color="primary"
          />
          <QuickAction
            icon={HiOutlineDocumentText}
            label="Upload Documents"
            description="Submit requested documents"
            to="/documents"
            color="blue"
          />
          <QuickAction
            icon={HiOutlineLightningBolt}
            label="Onboarding Progress"
            description={`${completionRate}% complete`}
            to="/tasks"
            color="amber"
          />
        </div>
      </div>
    </div>
  )
}

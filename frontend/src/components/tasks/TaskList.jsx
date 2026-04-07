import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import Badge from '../common/Badge'
import Modal from '../common/Modal'
import LoadingSpinner from '../common/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineFilter,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineEye,
  HiOutlineXCircle,
  HiOutlineRefresh,
} from 'react-icons/hi'

function TaskFilters({ filters, setFilters }) {
  return (
    <div className="glass-card p-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <HiOutlineFilter className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
      </div>

      <div className="relative flex-1 min-w-[200px]">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="input-field pl-9 py-2 text-sm"
          id="task-search-input"
        />
      </div>

      <select
        value={filters.status}
        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        className="input-field w-auto py-2 text-sm"
        id="task-status-filter"
      >
        <option value="">All Status</option>
        <option value="PENDING">Pending</option>
        <option value="IN_REVIEW">In Review</option>
        <option value="COMPLETED">Completed</option>
        <option value="REJECTED">Rejected</option>
      </select>

      <select
        value={filters.priority}
        onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
        className="input-field w-auto py-2 text-sm"
        id="task-priority-filter"
      >
        <option value="">All Priority</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>

      <input
        type="date"
        value={filters.deadline}
        onChange={(e) => setFilters(prev => ({ ...prev, deadline: e.target.value }))}
        className="input-field w-auto py-2 text-sm"
        id="task-deadline-filter"
      />

      {(filters.search || filters.status || filters.priority || filters.deadline) && (
        <button
          onClick={() => setFilters({ search: '', status: '', priority: '', deadline: '' })}
          className="btn-ghost text-xs"
        >
          Clear
        </button>
      )}
    </div>
  )
}

function TaskForm({ task, users, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'PENDING',
    priority: task?.priority || 'MEDIUM',
    deadline: task?.deadline || '',
    assignedToId: task?.assignedTo?.id || '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
          className="input-field"
          required
          id="task-title-input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
          className="input-field min-h-[80px] resize-y"
          rows="3"
          id="task-description-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value }))}
            className="input-field"
            id="task-priority-input"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
            className="input-field"
            id="task-status-input"
          >
            <option value="PENDING">Pending</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => setForm(prev => ({ ...prev, deadline: e.target.value }))}
            className="input-field"
            id="task-deadline-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign To *</label>
          <select
            value={form.assignedToId}
            onChange={(e) => setForm(prev => ({ ...prev, assignedToId: e.target.value }))}
            className="input-field"
            required
            id="task-assign-input"
          >
            <option value="">Select employee</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}

function StatusIcon({ status }) {
  switch (status) {
    case 'COMPLETED':
      return <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />
    case 'IN_REVIEW':
      return <HiOutlineEye className="w-5 h-5 text-purple-500" />
    case 'REJECTED':
      return <HiOutlineXCircle className="w-5 h-5 text-red-500" />
    default:
      return <HiOutlineClock className="w-5 h-5 text-amber-500" />
  }
}

function StatusLabel({ status }) {
  const labels = {
    PENDING: 'Pending',
    IN_REVIEW: 'In Review',
    COMPLETED: 'Approved',
    REJECTED: 'Rejected',
  }
  return labels[status] || status
}

export default function TaskList() {
  const { user, isAdmin } = useAuth()
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', deadline: '' })
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchTasks()
    if (isAdmin) fetchUsers()
  }, [filters, page])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params = {
        page,
        size: 10,
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.deadline && { deadline: filters.deadline }),
        ...(filters.search && { search: filters.search }),
      }

      let res
      if (isAdmin) {
        res = await api.get('/tasks', { params })
      } else {
        res = await api.get(`/tasks/user/${user.id}`, { params })
      }

      const pageData = res.data.data
      setTasks(pageData.content || [])
      setTotalPages(pageData.totalPages || 0)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data.data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleCreate = () => {
    setEditingTask(null)
    setModalOpen(true)
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const handleSubmit = async (form) => {
    try {
      setSaving(true)
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, form)
        toast.success('Task updated successfully')
      } else {
        await api.post('/tasks', form)
        toast.success('Task created successfully')
      }
      setModalOpen(false)
      setEditingTask(null)
      fetchTasks()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save task')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    try {
      await api.delete(`/tasks/${id}`)
      toast.success('Task deleted')
      fetchTasks()
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  // Employee: submit task for review (PENDING → IN_REVIEW)
  const handleSubmitForReview = async (task) => {
    try {
      await api.put(`/tasks/${task.id}`, {
        ...task,
        status: 'IN_REVIEW',
        assignedToId: task.assignedTo?.id,
      })
      toast.success('Task submitted for review! ✅')
      fetchTasks()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit task')
    }
  }

  // Employee: resubmit rejected task (REJECTED → PENDING)
  const handleResubmit = async (task) => {
    try {
      await api.put(`/tasks/${task.id}`, {
        ...task,
        status: 'PENDING',
        assignedToId: task.assignedTo?.id,
      })
      toast.success('Task reopened for rework')
      fetchTasks()
    } catch (error) {
      toast.error('Failed to resubmit task')
    }
  }

  // Admin: approve task (IN_REVIEW → COMPLETED)
  const handleApprove = async (task) => {
    try {
      await api.put(`/tasks/${task.id}`, {
        ...task,
        status: 'COMPLETED',
        assignedToId: task.assignedTo?.id,
      })
      toast.success('Task approved! 🎉')
      fetchTasks()
    } catch (error) {
      toast.error('Failed to approve task')
    }
  }

  // Admin: reject task (IN_REVIEW → REJECTED)
  const handleReject = async (task) => {
    try {
      await api.put(`/tasks/${task.id}`, {
        ...task,
        status: 'REJECTED',
        assignedToId: task.assignedTo?.id,
      })
      toast.success('Task sent back for rework')
      fetchTasks()
    } catch (error) {
      toast.error('Failed to reject task')
    }
  }

  const inReviewCount = tasks.filter(t => t.status === 'IN_REVIEW').length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isAdmin ? 'Manage and assign onboarding tasks' : 'View and complete your assigned tasks'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && inReviewCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
              <HiOutlineEye className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                {inReviewCount} awaiting review
              </span>
            </div>
          )}
          {isAdmin && (
            <button onClick={handleCreate} className="btn-primary flex items-center gap-2" id="create-task-button">
              <HiOutlinePlus className="w-4 h-4" />
              New Task
            </button>
          )}
        </div>
      </div>

      <TaskFilters filters={filters} setFilters={setFilters} />

      {loading ? (
        <LoadingSpinner message="Loading tasks..." />
      ) : tasks.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <HiOutlineClipboardList className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="mt-3 text-gray-500 dark:text-gray-400">No tasks found</p>
          {isAdmin && (
            <button onClick={handleCreate} className="btn-primary mt-4">Create your first task</button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task, idx) => (
            <div
              key={task.id}
              className={`glass-card p-5 hover:shadow-xl transition-all duration-300 animate-slide-up ${
                task.status === 'IN_REVIEW' && isAdmin ? 'ring-2 ring-purple-200 dark:ring-purple-500/30' : ''
              } ${task.status === 'REJECTED' ? 'border-l-4 border-red-400' : ''}`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-0.5 flex-shrink-0">
                    <StatusIcon status={task.status} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-semibold ${
                      task.status === 'COMPLETED'
                        ? 'line-through text-gray-400 dark:text-gray-500'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{task.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge variant={task.status?.toLowerCase()}>{StatusLabel({ status: task.status })}</Badge>
                      <Badge variant={task.priority?.toLowerCase()}>{task.priority}</Badge>
                      {task.deadline && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <HiOutlineCalendar className="w-3.5 h-3.5" />
                          {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                      {task.assignedTo && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <img
                            src={task.assignedTo.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignedTo.name)}&size=16&background=6366f1&color=fff`}
                            alt=""
                            className="w-4 h-4 rounded-full"
                          />
                          {task.assignedTo.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Employee actions */}
                  {!isAdmin && task.status === 'PENDING' && (
                    <button
                      onClick={() => handleSubmitForReview(task)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors flex items-center gap-1.5"
                      title="Submit for admin review"
                    >
                      <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                      Mark Done
                    </button>
                  )}
                  {!isAdmin && task.status === 'IN_REVIEW' && (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      ⏳ Awaiting Approval
                    </span>
                  )}
                  {!isAdmin && task.status === 'REJECTED' && (
                    <button
                      onClick={() => handleResubmit(task)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
                      title="Resubmit for review"
                    >
                      <HiOutlineRefresh className="w-3.5 h-3.5" />
                      Rework & Resubmit
                    </button>
                  )}
                  {!isAdmin && task.status === 'COMPLETED' && (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      ✓ Approved
                    </span>
                  )}

                  {/* Admin actions */}
                  {isAdmin && task.status === 'IN_REVIEW' && (
                    <>
                      <button
                        onClick={() => handleApprove(task)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
                        title="Approve this task"
                      >
                        <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(task)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
                        title="Reject this task"
                      >
                        <HiOutlineXCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  )}
                  {isAdmin && (
                    <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-200 dark:border-dark-border">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                        title="Edit"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn-secondary text-sm"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="btn-secondary text-sm"
          >
            Next
          </button>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null) }}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
      >
        <TaskForm
          task={editingTask}
          users={users}
          onSubmit={handleSubmit}
          onCancel={() => { setModalOpen(false); setEditingTask(null) }}
          loading={saving}
        />
      </Modal>
    </div>
  )
}

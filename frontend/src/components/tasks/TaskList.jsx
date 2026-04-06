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
} from 'react-icons/hi'

/**
 * Task filters bar with status, priority, deadline, and search.
 */
function TaskFilters({ filters, setFilters }) {
  return (
    <div className="glass-card p-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <HiOutlineFilter className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
      </div>

      {/* Search */}
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

      {/* Status filter */}
      <select
        value={filters.status}
        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        className="input-field w-auto py-2 text-sm"
        id="task-status-filter"
      >
        <option value="">All Status</option>
        <option value="PENDING">Pending</option>
        <option value="COMPLETED">Completed</option>
      </select>

      {/* Priority filter */}
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

      {/* Deadline filter */}
      <input
        type="date"
        value={filters.deadline}
        onChange={(e) => setFilters(prev => ({ ...prev, deadline: e.target.value }))}
        className="input-field w-auto py-2 text-sm"
        id="task-deadline-filter"
      />

      {/* Clear filters */}
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

/**
 * Task form used in modal for creating/editing tasks (Admin).
 */
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
            <option value="COMPLETED">Completed</option>
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

/**
 * Task list component with cards, CRUD operations, and filtering.
 */
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

  const handleStatusToggle = async (task) => {
    const newStatus = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING'
    try {
      await api.put(`/tasks/${task.id}`, {
        ...task,
        status: newStatus,
        assignedToId: task.assignedTo?.id,
      })
      toast.success(`Task marked as ${newStatus.toLowerCase()}`)
      fetchTasks()
    } catch (error) {
      toast.error('Failed to update task status')
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isAdmin ? 'Manage and assign onboarding tasks' : 'View and complete your assigned tasks'}
          </p>
        </div>
        {isAdmin && (
          <button onClick={handleCreate} className="btn-primary flex items-center gap-2" id="create-task-button">
            <HiOutlinePlus className="w-4 h-4" />
            New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <TaskFilters filters={filters} setFilters={setFilters} />

      {/* Task cards */}
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
              className="glass-card p-5 hover:shadow-xl transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Status toggle button */}
                  <button
                    onClick={() => handleStatusToggle(task)}
                    className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.status === 'COMPLETED'
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                    }`}
                    title={task.status === 'COMPLETED' ? 'Mark as pending' : 'Mark as completed'}
                  >
                    {task.status === 'COMPLETED' && (
                      <HiOutlineCheckCircle className="w-4 h-4" />
                    )}
                  </button>

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
                      <Badge variant={task.status?.toLowerCase()}>{task.status}</Badge>
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

                {/* Actions */}
                {isAdmin && (
                  <div className="flex items-center gap-1 flex-shrink-0">
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
          ))}
        </div>
      )}

      {/* Pagination */}
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

      {/* Create/Edit Modal */}
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

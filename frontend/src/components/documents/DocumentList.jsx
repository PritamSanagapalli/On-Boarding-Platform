import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import Badge from '../common/Badge'
import Modal from '../common/Modal'
import LoadingSpinner from '../common/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  HiOutlineDocumentText,
  HiOutlinePlus,
  HiOutlineUpload,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineDownload,
  HiOutlinePhotograph,
  HiOutlineDocumentDuplicate,
  HiOutlineCloudUpload,
  HiOutlineX,
  HiOutlineEye,
  HiOutlineShieldCheck,
  HiOutlineXCircle,
  HiOutlineChatAlt,
  HiOutlineBan,
} from 'react-icons/hi'

// ─── Status helpers ──────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING: { label: '⏳ Pending', icon: HiOutlineClock, color: 'amber', variant: 'pending' },
  SUBMITTED: { label: '📤 Submitted', icon: HiOutlineUpload, color: 'blue', variant: 'submitted' },
  APPROVED: { label: '✅ Approved', icon: HiOutlineCheckCircle, color: 'emerald', variant: 'approved' },
  REJECTED: { label: '❌ Rejected', icon: HiOutlineXCircle, color: 'red', variant: 'rejected' },
}

function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
}

// ─── File type icon ──────────────────────────────────────────

function FileIcon({ filename }) {
  const ext = filename?.split('.').pop()?.toLowerCase()
  const imgExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  const docExts = ['pdf', 'doc', 'docx', 'txt', 'rtf']

  if (imgExts.includes(ext)) {
    return <HiOutlinePhotograph className="w-5 h-5 text-pink-500" />
  }
  if (docExts.includes(ext)) {
    return <HiOutlineDocumentDuplicate className="w-5 h-5 text-blue-500" />
  }
  return <HiOutlineDocumentText className="w-5 h-5 text-gray-500" />
}

// ─── Drag-and-drop file upload ───────────────────────────────

function FileDropZone({ onFileSelect, uploading }) {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const files = e.dataTransfer?.files
    if (files?.length > 0) {
      onFileSelect(files[0])
    }
  }, [onFileSelect])

  const handleClick = () => fileInputRef.current?.click()

  const handleInputChange = (e) => {
    if (e.target.files?.length > 0) {
      onFileSelect(e.target.files[0])
    }
  }

  return (
    <div
      className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleInputChange}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.rtf"
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-primary-600 dark:text-primary-400">Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
            <HiOutlineCloudUpload className="w-7 h-7 text-primary-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Drop your file here or <span className="text-primary-600 dark:text-primary-400">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, DOC, JPG, PNG up to 10MB
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Uploaded file preview ───────────────────────────────────

function FilePreview({ file, uploadResult, onRemove }) {
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border">
      <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center flex-shrink-0">
        <FileIcon filename={file?.name || uploadResult?.originalName} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          {file?.name || uploadResult?.originalName}
        </p>
        <p className="text-xs text-gray-400">
          {file ? formatSize(file.size) : uploadResult?.size ? formatSize(parseInt(uploadResult.size)) : ''}
          {uploadResult && <span className="text-emerald-500 ml-2">✓ Uploaded</span>}
        </p>
      </div>
      {onRemove && (
        <button onClick={onRemove} className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors">
          <HiOutlineX className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  )
}

// ─── Admin feedback display ──────────────────────────────────

function AdminFeedbackBanner({ doc }) {
  if (!doc.feedback && !doc.verifiedBy) return null

  const isApproved = doc.status === 'APPROVED'

  return (
    <div className={`mt-3 p-3 rounded-xl border text-xs ${
      isApproved
        ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20'
        : 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'
    }`}>
      {doc.feedback && (
        <div className="flex items-start gap-2">
          <HiOutlineChatAlt className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
            isApproved ? 'text-emerald-500' : 'text-red-500'
          }`} />
          <p className={`${isApproved ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
            {doc.feedback}
          </p>
        </div>
      )}
      {doc.verifiedBy && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <img
            src={doc.verifiedBy.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.verifiedBy.name)}&size=14&background=6366f1&color=fff`}
            alt=""
            className="w-3.5 h-3.5 rounded-full"
          />
          <span className="text-gray-500 dark:text-gray-400">
            Verified by {doc.verifiedBy.name}
            {doc.verifiedAt && ` · ${new Date(doc.verifiedAt).toLocaleDateString()}`}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────

/**
 * Document list with:
 * - Admin: create requests, review/verify submitted documents
 * - Employee: view status, submit files, see admin feedback
 */
export default function DocumentList() {
  const { user, isAdmin } = useAuth()
  const [documents, setDocuments] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitModalOpen, setSubmitModalOpen] = useState(false)
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [createForm, setCreateForm] = useState({ documentName: '', userId: '' })
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)

  // Verification form state
  const [verifyFeedback, setVerifyFeedback] = useState('')
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    fetchDocuments()
    if (isAdmin) fetchUsers()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      if (isAdmin) {
        const res = await api.get('/documents')
        setDocuments(res.data.data || [])
      } else {
        const res = await api.get(`/documents/user/${user.id}`)
        setDocuments(res.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
      toast.error('Failed to load documents')
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

  const handleFileSelect = async (file) => {
    setSelectedFile(file)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUploadResult(res.data.data)
      toast.success('File uploaded')
    } catch (error) {
      toast.error('Failed to upload file')
      setSelectedFile(null)
    } finally {
      setUploading(false)
    }
  }

  const handleCreateRequest = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await api.post('/documents', createForm)
      toast.success('Document requested successfully')
      setModalOpen(false)
      setCreateForm({ documentName: '', userId: '' })
      fetchDocuments()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request document')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitDocument = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await api.put(`/documents/${selectedDoc.id}`, {
        fileUrl: uploadResult?.downloadUrl || '',
        status: 'SUBMITTED',
      })
      toast.success('Document submitted successfully! 🎉')
      setSubmitModalOpen(false)
      setSelectedDoc(null)
      setSelectedFile(null)
      setUploadResult(null)
      fetchDocuments()
    } catch (error) {
      toast.error('Failed to submit document')
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyDocument = async (status) => {
    try {
      setVerifying(true)
      await api.put(`/documents/${selectedDoc.id}/verify`, {
        status,
        feedback: verifyFeedback.trim() || null,
      })
      const action = status === 'APPROVED' ? 'approved' : 'rejected'
      toast.success(`Document ${action} successfully!`)
      setVerifyModalOpen(false)
      setSelectedDoc(null)
      setVerifyFeedback('')
      fetchDocuments()
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to verify document'
      toast.error(errorMsg)
    } finally {
      setVerifying(false)
    }
  }

  const openSubmitModal = (doc) => {
    setSelectedDoc(doc)
    setSelectedFile(null)
    setUploadResult(null)
    setSubmitModalOpen(true)
  }

  const openVerifyModal = (doc) => {
    setSelectedDoc(doc)
    setVerifyFeedback('')
    setVerifyModalOpen(true)
  }

  const pendingCount = documents.filter(d => d.status === 'PENDING').length
  const submittedCount = documents.filter(d => d.status === 'SUBMITTED').length
  const approvedCount = documents.filter(d => d.status === 'APPROVED').length
  const rejectedCount = documents.filter(d => d.status === 'REJECTED').length

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isAdmin ? 'Request, track, and verify employee documents' : 'View and submit requested documents'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Mini stats */}
          <div className="hidden sm:flex items-center gap-4 mr-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{pendingCount} Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{submittedCount} Submitted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{approvedCount} Approved</span>
            </div>
            {rejectedCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{rejectedCount} Rejected</span>
              </div>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary flex items-center gap-2"
              id="request-document-button"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Request Document
            </button>
          )}
        </div>
      </div>

      {/* Document cards */}
      {loading ? (
        <LoadingSpinner message="Loading documents..." />
      ) : documents.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-dark-bg flex items-center justify-center mx-auto mb-4">
            <HiOutlineDocumentText className="w-10 h-10 text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No documents yet</h3>
          <p className="mt-1 text-sm text-gray-400">
            {isAdmin ? 'Request your first document from an employee.' : 'No documents have been requested yet.'}
          </p>
          {isAdmin && (
            <button onClick={() => setModalOpen(true)} className="btn-primary mt-4">
              Request first document
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc, idx) => {
            const statusCfg = getStatusConfig(doc.status)
            const StatusIcon = statusCfg.icon
            const isVerified = doc.status === 'APPROVED' || doc.status === 'REJECTED'

            return (
              <div
                key={doc.id}
                className="glass-card-hover p-5 group animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Status header */}
                <div className="flex items-center justify-between mb-4">
                  <Badge variant={statusCfg.variant}>
                    {statusCfg.label}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                        title="View file"
                      >
                        <HiOutlineDownload className="w-4 h-4" />
                      </a>
                    )}
                    {/* Admin: Review button for SUBMITTED documents */}
                    {isAdmin && doc.status === 'SUBMITTED' && (
                      <button
                        onClick={() => openVerifyModal(doc)}
                        className="p-1.5 rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                        title="Review document"
                        id={`review-doc-${doc.id}`}
                      >
                        <HiOutlineEye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Document info */}
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 bg-${statusCfg.color}-50 dark:bg-${statusCfg.color}-500/10`}>
                    <StatusIcon className={`w-5 h-5 text-${statusCfg.color}-500`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {doc.documentName}
                    </h3>
                    {doc.user && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <img
                          src={doc.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.user.name)}&size=16&background=6366f1&color=fff`}
                          alt=""
                          className="w-4 h-4 rounded-full"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{doc.user.name}</p>
                      </div>
                    )}
                    {doc.fileUrl && (
                      <p className="text-xs text-primary-500 mt-1.5 truncate" title={doc.fileUrl}>
                        📎 {doc.fileUrl.split('/').pop()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Admin feedback section (visible to both admin and employee) */}
                {isVerified && <AdminFeedbackBanner doc={doc} />}

                {/* Submit button for employees (only PENDING docs) */}
                {!isAdmin && doc.status === 'PENDING' && (
                  <button
                    onClick={() => openSubmitModal(doc)}
                    className="mt-4 w-full btn-outline flex items-center justify-center gap-2 text-sm"
                  >
                    <HiOutlineUpload className="w-4 h-4" />
                    Upload & Submit
                  </button>
                )}

                {/* Admin: Prominent review button for SUBMITTED docs */}
                {isAdmin && doc.status === 'SUBMITTED' && (
                  <button
                    onClick={() => openVerifyModal(doc)}
                    className="mt-4 w-full btn-primary flex items-center justify-center gap-2 text-sm"
                    id={`verify-doc-btn-${doc.id}`}
                  >
                    <HiOutlineShieldCheck className="w-4 h-4" />
                    Review & Verify
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ─── Create Document Request Modal (Admin) ─── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Request Document">
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Document Name *</label>
            <input
              type="text"
              value={createForm.documentName}
              onChange={(e) => setCreateForm(prev => ({ ...prev, documentName: e.target.value }))}
              className="input-field"
              placeholder="e.g. Resume, ID Proof, Address Proof"
              required
              id="document-name-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Employee *</label>
            <select
              value={createForm.userId}
              onChange={(e) => setCreateForm(prev => ({ ...prev, userId: e.target.value }))}
              className="input-field"
              required
              id="document-user-select"
            >
              <option value="">Select employee</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-dark-border">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Requesting...' : 'Request Document'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Submit Document Modal (Employee) ─── */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => { setSubmitModalOpen(false); setSelectedDoc(null); setSelectedFile(null); setUploadResult(null) }}
        title={`Submit: ${selectedDoc?.documentName || ''}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmitDocument} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload File
            </label>

            {selectedFile && uploadResult ? (
              <FilePreview
                file={selectedFile}
                uploadResult={uploadResult}
                onRemove={() => { setSelectedFile(null); setUploadResult(null) }}
              />
            ) : (
              <FileDropZone onFileSelect={handleFileSelect} uploading={uploading} />
            )}
          </div>

          {!uploadResult && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-dark-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white dark:bg-dark-card text-gray-400">or enter a URL</span>
              </div>
            </div>
          )}

          {!uploadResult && (
            <div>
              <input
                type="text"
                value={uploadResult?.downloadUrl || ''}
                onChange={(e) => setUploadResult({ downloadUrl: e.target.value })}
                className="input-field"
                placeholder="Paste a link (Google Drive, Dropbox, etc.)"
                id="document-url-input"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-dark-border">
            <button
              type="button"
              onClick={() => { setSubmitModalOpen(false); setSelectedDoc(null); setSelectedFile(null); setUploadResult(null) }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || (!uploadResult)}
              className="btn-primary flex items-center gap-2"
            >
              <HiOutlineCheckCircle className="w-4 h-4" />
              {saving ? 'Submitting...' : 'Submit Document'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Verify Document Modal (Admin) ─── */}
      <Modal
        isOpen={verifyModalOpen}
        onClose={() => { setVerifyModalOpen(false); setSelectedDoc(null); setVerifyFeedback('') }}
        title="Review Document"
        maxWidth="max-w-xl"
      >
        {selectedDoc && (
          <div className="space-y-5">
            {/* Document info header */}
            <div className="p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                  <HiOutlineDocumentText className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{selectedDoc.documentName}</h4>
                  {selectedDoc.user && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <img
                        src={selectedDoc.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoc.user.name)}&size=16&background=6366f1&color=fff`}
                        alt=""
                        className="w-4 h-4 rounded-full"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Submitted by {selectedDoc.user.name}
                      </span>
                    </div>
                  )}
                </div>
                <Badge variant="submitted">📤 Submitted</Badge>
              </div>
            </div>

            {/* File preview / link */}
            {selectedDoc.fileUrl && (
              <div className="p-4 bg-primary-50 dark:bg-primary-500/5 rounded-xl border border-primary-200 dark:border-primary-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HiOutlineDocumentDuplicate className="w-5 h-5 text-primary-500" />
                    <span className="text-sm font-medium text-primary-700 dark:text-primary-400 truncate">
                      {selectedDoc.fileUrl.split('/').pop()}
                    </span>
                  </div>
                  <a
                    href={selectedDoc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5"
                    id="preview-file-link"
                  >
                    <HiOutlineEye className="w-3.5 h-3.5" />
                    View File
                  </a>
                </div>
              </div>
            )}

            {/* Feedback input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Feedback <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={verifyFeedback}
                onChange={(e) => setVerifyFeedback(e.target.value)}
                className="input-field min-h-[80px] resize-y"
                placeholder="Add a comment for the employee..."
                rows={3}
                id="verify-feedback-input"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-dark-border">
              <button
                type="button"
                onClick={() => { setVerifyModalOpen(false); setSelectedDoc(null); setVerifyFeedback('') }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleVerifyDocument('REJECTED')}
                  disabled={verifying}
                  className="btn-danger flex items-center gap-2"
                  id="reject-document-button"
                >
                  <HiOutlineBan className="w-4 h-4" />
                  {verifying ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleVerifyDocument('APPROVED')}
                  disabled={verifying}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  id="approve-document-button"
                >
                  <HiOutlineShieldCheck className="w-4 h-4" />
                  {verifying ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

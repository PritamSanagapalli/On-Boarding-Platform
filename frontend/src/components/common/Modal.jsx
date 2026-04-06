import { useEffect, useRef } from 'react'
import { HiX } from 'react-icons/hi'

/**
 * Reusable modal dialog with backdrop blur and slide-up animation.
 */
export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  const modalRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        ref={modalRef}
        className={`relative ${maxWidth} w-full mx-4 bg-white dark:bg-dark-card rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto custom-scrollbar`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-dark-card flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-border rounded-t-2xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
            id="modal-close-button"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Status/priority badge with color coding.
 */
export default function Badge({ variant = 'default', children }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    high: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    employee: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400',
  }

  return (
    <span className={`badge ${variants[variant] || variants.default}`}>
      {children}
    </span>
  )
}

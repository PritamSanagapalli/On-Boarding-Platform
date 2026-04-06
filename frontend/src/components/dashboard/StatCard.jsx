/**
 * Stat card with icon, gradient accent, and animated counter.
 */
export default function StatCard({ icon: Icon, label, value, color = 'primary', trend }) {
  const colorMap = {
    primary: {
      bg: 'bg-primary-50 dark:bg-primary-500/10',
      icon: 'text-primary-500',
      accent: 'from-primary-500 to-primary-600',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      icon: 'text-emerald-500',
      accent: 'from-emerald-500 to-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      icon: 'text-amber-500',
      accent: 'from-amber-500 to-amber-600',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      icon: 'text-blue-500',
      accent: 'from-blue-500 to-blue-600',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-500/10',
      icon: 'text-red-500',
      accent: 'from-red-500 to-red-600',
    },
  }

  const colors = colorMap[color] || colorMap.primary

  return (
    <div className="glass-card-hover p-5 relative overflow-hidden group">
      {/* Gradient accent stripe */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className={`mt-1 text-xs font-medium ${
              trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-red-500' : 'text-gray-400'
            }`}>
              {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors.bg} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
    </div>
  )
}

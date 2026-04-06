import Sidebar from './Sidebar'
import Navbar from './Navbar'

/**
 * Main layout wrapper with sidebar and navbar.
 * Content is placed in the main area to the right of the sidebar.
 */
export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Sidebar />
      <div className="ml-64">
        <Navbar />
        <main className="p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}

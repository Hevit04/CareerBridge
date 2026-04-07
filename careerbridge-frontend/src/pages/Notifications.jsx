import { useState, useEffect } from 'react'
import { api } from '../api/api'
import { Bell, Check, Trash2, CheckCircle, Clock } from 'lucide-react'
import { useToast } from '../hooks/useToast'

export default function Notifications({ onNav }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'unread'
  const toast = useToast()

  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.list()
      setNotifications(data)
    } catch (err) {
      toast('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAsRead = async (id) => {
    if (id === 'sys-next-interview') {
      toast('System notifications cannot be modified manually')
      return
    }
    try {
      await api.notifications.markRead(id)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
    } catch (err) {
      toast('Failed to mark as read')
    }
  }

  const markAllRead = async () => {
    try {
      await api.notifications.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      toast('All notifications marked as read')
    } catch (err) {
      toast('Failed to mark all as read')
    }
  }

  const deleteNotification = async (id) => {
    if (id === 'sys-next-interview') {
      toast('System notifications cannot be modified manually')
      return
    }
    try {
      await api.notifications.delete(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast('Notification deleted')
    } catch (err) {
      toast('Failed to delete notification')
    }
  }

  const systemNotifications = []
  const now = new Date()
  if ((now.getDay() === 0 || now.getDay() === 6) && now.getHours() < 16) {
    systemNotifications.push({
      id: 'sys-next-interview',
      title: 'Upcoming Mock Interview',
      message: 'You have a Technical Round mock interview scheduled for today at 4:00 PM.',
      type: 'interview',
      link: '/interview',
      is_read: false,
      created_at: new Date(new Date().setHours(9, 0, 0, 0)).toISOString()
    })
  }

  const allNotifications = [...systemNotifications, ...notifications]

  const filteredNotifications = allNotifications.filter(n => {
    if (filter === 'unread') return !n.is_read
    return true
  })

  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff_seconds = Math.floor((now - date) / 1000)
    
    if (diff_seconds < 60) return 'Just now'
    if (diff_seconds < 3600) return `${Math.floor(diff_seconds / 60)} minutes ago`
    if (diff_seconds < 86400) return `${Math.floor(diff_seconds / 3600)} hours ago`
    return `${Math.floor(diff_seconds / 86400)} days ago`
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'internship': return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      case 'assessment': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      case 'interview': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'application': return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-purple-400" />
            Notifications
          </h1>
          <p className="text-zinc-400 mt-2 text-lg">Stay updated on your career journey</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-zinc-800/50 p-1 rounded-lg border border-zinc-700/50 flex">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'unread' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Unread
            </button>
          </div>
          <button
            onClick={markAllRead}
            disabled={!notifications.some(n => !n.is_read)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            Mark all read
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-zinc-500">Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
            <Bell className="w-12 h-12 text-zinc-600 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-zinc-300">You're all caught up!</h3>
            <p className="text-zinc-500 mt-2">No {filter === 'unread' ? 'unread ' : ''}notifications at the moment.</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id}
              className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                notification.is_read 
                  ? 'bg-zinc-900/40 border-zinc-800/50 opacity-75 hover:opacity-100' 
                  : 'bg-zinc-800/80 border-purple-500/30 hover:border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.05)]'
              }`}
            >
              {/* Type Badge */}
              <div className={`mt-1 flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border uppercase tracking-wider ${getTypeColor(notification.type)}`}>
                {notification.type}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-base font-medium truncate pr-4 ${notification.is_read ? 'text-zinc-300' : 'text-white'}`}>
                    {notification.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 whitespace-nowrap">
                    <Clock className="w-3 h-3" />
                    {formatDate(notification.created_at)}
                  </div>
                </div>
                <p className={`text-sm ${notification.is_read ? 'text-zinc-500' : 'text-zinc-400'} line-clamp-2`}>
                  {notification.message}
                </p>
                {notification.link && (
                  <button 
                    onClick={() => {
                      if (!notification.is_read) markAsRead(notification.id)
                      onNav(notification.link.replace('/', ''))
                    }}
                    className="mt-3 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1"
                  >
                    View Details &rarr;
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notification.is_read && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                    title="Mark as read"
                    className="p-2 bg-zinc-800 hover:bg-purple-500/20 text-zinc-400 hover:text-purple-400 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                  title="Delete notification"
                  className="p-2 bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

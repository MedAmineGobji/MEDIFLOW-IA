'use client'

import { useState } from 'react'
import { Bell, X, Check, CheckCheck } from 'lucide-react'
import { useNotifications } from '../lib/useNotifications'
import { createPortal } from 'react-dom'

interface NotificationDropdownProps {
  className?: string
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotifications()

  const dropdownContent = isOpen ? (
    <>
      {/* Overlay transparent pour fermer */}
      <div 
        className="fixed inset-0"
        style={{ zIndex: 99997 }}
        onClick={() => setIsOpen(false)}
      />
      
      {/* Dropdown compact en haut à droite */}
      <div 
        className="fixed top-20 right-4 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[600px] flex flex-col"
        style={{ 
          zIndex: 99998,
          animation: 'slideDown 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête compact */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-white/90 hover:text-white px-2 py-1 bg-white/20 rounded hover:bg-white/30 transition-all"
                title="Tout marquer comme lu"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Liste des notifications avec scroll */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-6 text-center text-gray-500">
              Chargement...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-gray-50 transition-colors ${
                    notification.isRead === 0 ? 'bg-blue-50/50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg ${
                      notification.isRead === 0 ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {notification.type === 'interview_scheduled' ? '📅' : 
                       notification.type === 'application_status' ? '📄' : '🔔'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {notification.title}
                        </h4>
                        {notification.isRead === 0 && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {notification.isRead === 0 && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                          title="Marquer comme lu"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                        title="Supprimer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  ) : null

  return (
    <div className={className}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {typeof window !== 'undefined' && createPortal(
        dropdownContent,
        document.body
      )}
      
      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
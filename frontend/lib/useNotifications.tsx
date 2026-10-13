'use client'

import { useState, useEffect } from 'react'

interface Notification {
  id: number
  title: string
  message: string
  type: string
  relatedId: number
  isRead: number
  createdAt: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setNotifications(result.data || [])
      } else {
        setError('Erreur lors du chargement des notifications')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, isRead: 1 } : notif
          )
        )
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: 1 }))
        )
      }
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error)
    }
  }

  const deleteNotification = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount: notifications.filter(n => n.isRead === 0).length
  }
}
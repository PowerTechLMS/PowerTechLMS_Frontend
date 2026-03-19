import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { useAuthStore } from '@/stores/auth'

class NotificationHub {
  constructor() {
    this.connection = null
    this.callbacks = []
  }

  start() {
    const authStore = useAuthStore()

    if (this.connection) {
      return
    }

    const hubUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5100'}/hubs/notifications`

    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => authStore.token,
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build()

    this.connection.on('ReceiveNotification', (notification) => {
      this.callbacks.forEach(callback => callback(notification))
    })

    this.connection.start()
      .then(() => console.log('SignalR Connected.'))
      .catch(err => console.error('SignalR Connection Error: ', err))
  }

  stop() {
    if (this.connection) {
      this.connection.stop()
      this.connection = null
    }
  }

  onNotification(callback) {
    this.callbacks.push(callback)
  }
}

export default new NotificationHub()

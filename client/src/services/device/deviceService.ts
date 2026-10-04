/**
 * Device Capabilities Service for Snap2Done AI.
 * Safely accesses camera, microphone, notifications, clipboard,
 * haptics, online status, orientation, and screen wake lock.
 */

export interface DeviceInfo {
  isMobile: boolean;
  isOnline: boolean;
  hasCamera: boolean;
  hasMicrophone: boolean;
  hasNotifications: boolean;
  hasVibration: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: string;
}

class DeviceService {
  private wakeLockSentinel: any = null;

  public getDeviceInfo(): DeviceInfo {
    const isMobile =
      typeof window !== 'undefined' &&
      (window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

    return {
      isMobile,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      hasCamera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      hasMicrophone: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      hasNotifications: 'Notification' in window,
      hasVibration: 'vibrate' in navigator,
      screenWidth: typeof window !== 'undefined' ? window.innerWidth : 390,
      screenHeight: typeof window !== 'undefined' ? window.innerHeight : 844,
      orientation:
        typeof window !== 'undefined' && window.screen?.orientation?.type
          ? window.screen.orientation.type
          : 'portrait-primary'
    };
  }

  // Camera Stream Request
  public async getCameraStream(): Promise<MediaStream> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera hardware or browser getUserMedia API not supported.');
    }

    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Camera access was denied. Please grant camera permission to scan tasks.');
      }
      if (err.name === 'NotFoundError') {
        throw new Error('No camera found on this device.');
      }
      throw new Error(err.message || 'Unable to open camera stream.');
    }
  }

  // Tactile Haptics
  public vibrate(pattern: number | number[] = 40): void {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // ignore
    }
  }

  // Web Notifications
  public async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;

    try {
      const res = await Notification.requestPermission();
      return res === 'granted';
    } catch {
      return false;
    }
  }

  public showNotification(title: string, options?: NotificationOptions): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options
        });
      } catch {
        // ignore
      }
    }
  }

  // Screen Wake Lock (during Focus Mode)
  public async requestWakeLock(): Promise<boolean> {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }

  public releaseWakeLock(): void {
    try {
      if (this.wakeLockSentinel) {
        this.wakeLockSentinel.release();
        this.wakeLockSentinel = null;
      }
    } catch {
      // ignore
    }
  }

  // Copy to Clipboard
  public async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        this.vibrate(30);
        return true;
      }
    } catch {
      // fallback
    }
    return false;
  }
}

export const deviceService = new DeviceService();

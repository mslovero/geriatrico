import { useEffect, useState } from "react";
import { post } from "@/api/api";

interface UsePushNotificationsResult {
  permission: NotificationPermission;
  isSubscribed: boolean;
  subscribeUser: () => Promise<boolean>;
  unsubscribeUser: () => Promise<void>;
}

const urlBase64ToUint8Array = (base64: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = window.atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
};

export function usePushNotifications(): UsePushNotificationsResult {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.ready.then((registration) => {
      void registration.pushManager.getSubscription().then((sub) => {
        setSubscription(sub);
        setIsSubscribed(Boolean(sub));
      });
    });
  }, []);

  const subscribeUser = async (): Promise<boolean> => {
    if (!("serviceWorker" in navigator)) return false;
    try {
      const registration = await navigator.serviceWorker.ready;
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "";
      const appKey = urlBase64ToUint8Array(vapidKey);
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appKey.buffer.slice(
          appKey.byteOffset,
          appKey.byteOffset + appKey.byteLength,
        ) as ArrayBuffer,
      });
      await post("/push-subscriptions", sub.toJSON());
      setSubscription(sub);
      setIsSubscribed(true);
      setPermission(Notification.permission);
      return true;
    } catch (error) {
      console.error("Error suscribiendo al usuario:", error);
      return false;
    }
  };

  const unsubscribeUser = async (): Promise<void> => {
    if (!subscription) return;
    try {
      await subscription.unsubscribe();
      await post("/push-subscriptions/delete", { endpoint: subscription.endpoint });
      setSubscription(null);
      setIsSubscribed(false);
    } catch (error) {
      console.error("Error desuscribiendo al usuario:", error);
    }
  };

  return { permission, isSubscribed, subscribeUser, unsubscribeUser };
}

export default usePushNotifications;

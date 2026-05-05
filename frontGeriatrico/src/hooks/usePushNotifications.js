import { useState, useEffect } from 'react';
import { post } from '../api/api';

const usePushNotifications = () => {
    const [permission, setPermission] = useState(Notification.permission);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState(null);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.pushManager.getSubscription().then((sub) => {
                    setSubscription(sub);
                    setIsSubscribed(!!sub);
                });
            });
        }
    }, []);

    const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribeUser = async () => {
        if (!('serviceWorker' in navigator)) return;

        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
            });

            // Enviar suscripción al servidor
            await post('/push-subscriptions', sub.toJSON());
            
            setSubscription(sub);
            setIsSubscribed(true);
            setPermission(Notification.permission);
            return true;
        } catch (error) {
            console.error('Error suscribiendo al usuario:', error);
            return false;
        }
    };

    const unsubscribeUser = async () => {
        if (!subscription) return;

        try {
            await subscription.unsubscribe();
            await post('/push-subscriptions/delete', { endpoint: subscription.endpoint });
            setSubscription(null);
            setIsSubscribed(false);
        } catch (error) {
            console.error('Error desuscribiendo al usuario:', error);
        }
    };

    return {
        permission,
        isSubscribed,
        subscribeUser,
        unsubscribeUser
    };
};

export default usePushNotifications;

<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;

class TestPushNotification extends Notification
{
    use Queueable;

    public function via($notifiable)
    {
        return [WebPushChannel::class];
    }

    public function toWebPush($notifiable, $notification)
    {
        return (new WebPushMessage)
            ->title('¡Sistema de Alertas Activo!')
            ->icon('/favicon.ico')
            ->body('Esta es una notificación de prueba para el personal del Geriátrico.')
            ->action('Ver Dashboard', 'view_dashboard')
            ->data(['url' => '/']);
    }
}

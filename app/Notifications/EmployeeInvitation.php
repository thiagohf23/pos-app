<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;

class EmployeeInvitation extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public string $token) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $resetUrl = route('password.reset', [
            'token' => $this->token,
        ]).('&email='.urlencode($notifiable->email));

        return (new MailMessage)
            ->subject(Lang::get('Welcome to POS App — Set Your Password'))
            ->markdown('emails.employee-invitation')
            ->greeting(Lang::get('Hello, '.$notifiable->name.'!'))
            ->line(Lang::get('You have been invited to join POS App as an employee.'))
            ->line(Lang::get('Please click the button below to set your password and activate your account.'))
            ->action(Lang::get('Set Your Password'), $resetUrl)
            ->line(Lang::get('This password reset link will expire in 60 minutes.'))
            ->line(Lang::get('If you did not expect this invitation, please ignore this email.'));
    }
}

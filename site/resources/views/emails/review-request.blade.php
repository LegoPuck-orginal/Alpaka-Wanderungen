<x-mail::message>
# Wie war deine Alpaka-Wanderung?

Hallo {{ $booking->user->name }},

wir hoffen, du hattest eine großartige Zeit mit unseren Alpakas am {{ $booking->slot->start->translatedFormat('d.m.Y') }}.

Damit wir die Touren weiter verbessern können, freuen wir uns über dein Feedback.

<x-mail::button :url="$reviewLink">
Jetzt Review abgeben
</x-mail::button>

Vielen Dank und bis bald auf der Weide!<br>
{{ config('app.name') }}
</x-mail::message>

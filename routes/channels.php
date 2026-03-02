<?php

use App\Models\Room;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('rooms', function ($user) {
    return $user ? [
        'id' => $user->id,
        'name' => $user->name,
        'avatar' => $user->avatar ? asset('storage/'.$user->avatar) : null,
    ] : null;
});

Broadcast::channel('room.{roomId}', function ($user, $roomId) {
    $room = Room::find($roomId);

    if (!$room) {
        return false;
    }

    // Check if user is a member of the room using query (more efficient)
    if ($room->users()->where('users.id', $user->id)->exists()) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'avatar' => $user->avatar ? asset('storage/'.$user->avatar) : null,
        ];
    }

    return false;
});

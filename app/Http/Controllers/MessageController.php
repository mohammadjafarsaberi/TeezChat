<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Message;
use App\Models\Room;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Room $room)
    {
        $this->authorize('create', [Message::class, $room]);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $message = $room->messages()->create([
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        $message->load('user');

        // Dispatch the event
        event(new MessageSent($message));

        return response()->json([
            'id' => $message->id,
            'body' => $message->body,
            'user' => [
                'id' => $message->user->id,
                'name' => $message->user->name,
                'avatar' => $message->user->avatar ? asset('storage/'.$message->user->avatar) : null,
            ],
            'room_id' => $message->room_id,
            'created_at' => $message->created_at->toIso8601String(),
            'created_at_human' => $message->created_at->diffForHumans(),
        ], 201);
    }
}

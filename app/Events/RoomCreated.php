<?php

namespace App\Events;

use App\Models\Room;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RoomCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The name of the queue connection to use when broadcasting the event.
     *
     * @var string|null
     */
    public $connection = 'sync';

    /**
     * The name of the queue the job should be sent to.
     *
     * @var string|null
     */
    public $queue = null;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Room $room
    ) {
        //
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('rooms'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'room.created';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $this->room->load(['creator', 'users', 'lastMessage.user']);

        return [
            'id' => $this->room->id,
            'name' => $this->room->name,
            'created_by' => [
                'id' => $this->room->creator->id,
                'name' => $this->room->creator->name,
                'avatar' => $this->room->creator->avatar ? asset('storage/'.$this->room->creator->avatar) : null,
            ],
            'member_count' => $this->room->users->count(),
            'last_message' => $this->room->lastMessage->first() ? [
                'id' => $this->room->lastMessage->first()->id,
                'body' => $this->room->lastMessage->first()->body,
                'user' => [
                    'id' => $this->room->lastMessage->first()->user->id,
                    'name' => $this->room->lastMessage->first()->user->name,
                    'avatar' => $this->room->lastMessage->first()->user->avatar ? asset('storage/'.$this->room->lastMessage->first()->user->avatar) : null,
                ],
                'created_at' => $this->room->lastMessage->first()->created_at->diffForHumans(),
            ] : null,
            'created_at' => $this->room->created_at->diffForHumans(),
        ];
    }
}

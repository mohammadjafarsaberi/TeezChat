<?php

namespace App\Http\Controllers;

use App\Events\RoomClosed;
use App\Events\RoomCreated;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();
        
        $rooms = Room::withLastMessage()
            ->withMemberCount()
            ->with(['creator'])
            ->get()
            ->map(function ($room) use ($user) {
                $isMember = $room->users()->where('users.id', $user->id)->exists();
                
                return [
                    'id' => $room->id,
                    'name' => $room->name,
                    'created_by' => [
                        'id' => $room->creator->id,
                        'name' => $room->creator->name,
                        'avatar' => $room->creator->avatar ? asset('storage/'.$room->creator->avatar) : null,
                    ],
                    'member_count' => $room->users_count,
                    'is_member' => $isMember,
                    'is_full' => $room->users_count >= 5,
                    'last_message' => $room->lastMessage->first() ? [
                        'id' => $room->lastMessage->first()->id,
                        'body' => $room->lastMessage->first()->body,
                        'user' => [
                            'id' => $room->lastMessage->first()->user->id,
                            'name' => $room->lastMessage->first()->user->name,
                            'avatar' => $room->lastMessage->first()->user->avatar ? asset('storage/'.$room->lastMessage->first()->user->avatar) : null,
                        ],
                        'created_at' => $room->lastMessage->first()->created_at->diffForHumans(),
                    ] : null,
                    'created_at' => $room->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('rooms/index', [
            'rooms' => $rooms,
            'roomClosedRefresh' => $request->session()->get('roomClosedRefresh', false),
            'closedRoomId' => $request->session()->get('closedRoomId'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $room = Room::create([
            'name' => $validated['name'],
            'created_by' => $request->user()->id,
        ]);

        // Add creator as a member (room starts with 1 member, which is fine)
        $room->users()->attach($request->user()->id);

        // Broadcast room created event
        event(new RoomCreated($room));

        return redirect()->route('rooms.show', $room);
    }

    /**
     * Join a room.
     */
    public function join(Request $request, Room $room)
    {
        $this->authorize('join', $room);

        $user = $request->user();

        // Check if user is already a member
        if ($room->users()->where('users.id', $user->id)->exists()) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'You are already a member of this room.',
                ], 400);
            }
            return redirect()->route('rooms.show', $room)
                ->with('error', 'You are already a member of this room.');
        }

        // Check if room is full (5 member limit)
        $memberCount = $room->users()->count();
        if ($memberCount >= 5) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'This room is full. Maximum 5 members allowed.',
                ], 403);
            }
            return redirect()->route('rooms.index')
                ->with('error', 'This room is full. Maximum 5 members allowed.');
        }

        // Add user to room
        $room->users()->attach($user->id);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Successfully joined the room.',
                'room_id' => $room->id,
            ], 200);
        }

        return redirect()->route('rooms.show', $room)
            ->with('success', 'Successfully joined the room.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Room $room): Response
    {
        $this->authorize('view', $room);

        $room->load(['users', 'creator']);

        $messages = $room->messages()
            ->with('user')
            ->latest()
            ->limit(50)
            ->get()
            ->reverse()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'body' => $message->body,
                    'user' => [
                        'id' => $message->user->id,
                        'name' => $message->user->name,
                        'avatar' => $message->user->avatar ? asset('storage/'.$message->user->avatar) : null,
                    ],
                    'created_at' => $message->created_at->toIso8601String(),
                    'created_at_human' => $message->created_at->diffForHumans(),
                ];
            })
            ->values()
            ->all();

        $members = $room->users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar ? asset('storage/'.$user->avatar) : null,
            ];
        });

        return Inertia::render('rooms/show', [
            'room' => [
                'id' => $room->id,
                'name' => $room->name,
                'created_by' => [
                    'id' => $room->creator->id,
                    'name' => $room->creator->name,
                    'avatar' => $room->creator->avatar ? asset('storage/'.$room->creator->avatar) : null,
                ],
            ],
            'messages' => $messages,
            'members' => $members,
        ]);
    }

    /**
     * Leave a room (for non-creator members).
     */
    public function leave(Request $request, Room $room)
    {
        $this->authorize('leave', $room);

        $user = $request->user();

        // Don't allow creator to leave (they must close the room)
        if ($room->created_by === $user->id) {
            return redirect()->back()
                ->with('error', 'Room creators must close the room instead of leaving.');
        }

        // Remove user from room
        $room->users()->detach($user->id);

        return redirect()->route('rooms.index')
            ->with('success', 'You have left the room.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Room $room)
    {
        $this->authorize('delete', $room);

        // Broadcast room closed event before deletion
        event(new RoomClosed($room));

        $room->delete();

        return redirect()->route('rooms.index')
            ->with('success', 'Room deleted successfully.');
    }
}

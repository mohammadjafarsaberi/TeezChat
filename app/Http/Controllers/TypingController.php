<?php

namespace App\Http\Controllers;

use App\Events\UserTyping;
use App\Models\Room;
use Illuminate\Http\Request;

class TypingController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Room $room)
    {
        $this->authorize('view', $room);

        event(new UserTyping($room, $request->user(), true));

        return response()->json(['status' => 'typing']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Room $room)
    {
        $this->authorize('view', $room);

        event(new UserTyping($room, $request->user(), false));

        return response()->json(['status' => 'stopped']);
    }
}

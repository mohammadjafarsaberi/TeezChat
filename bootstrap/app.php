<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        channels: __DIR__.'/../routes/channels.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['sidebar_state']);

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handle ModelNotFoundException for Room - redirect to rooms page instead of 404
        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, \Illuminate\Http\Request $request) {
            if ($e->getModel() === \App\Models\Room::class && $request->routeIs('rooms.show')) {
                // Extract room ID from route parameter or URL
                $roomId = $request->route('room');
                if (!$roomId) {
                    // Fallback: extract from URL path
                    preg_match('/\/rooms\/(\d+)/', $request->path(), $matches);
                    $roomId = $matches[1] ?? null;
                }
                // Store in session so we can show a message on rooms page
                return redirect()->route('rooms.index')
                    ->with('roomClosedRefresh', true)
                    ->with('closedRoomId', $roomId);
            }
        });
    })->create();

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DetectLocale
{
    /**
     * Handle an incoming request.
     *
     * Detect the user's locale from cookie, then Accept-Language header, fallback to 'en'.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->cookie('locale');

        if (! $locale || ! in_array($locale, ['en', 'pt', 'es'], true)) {
            $locale = $request->header('Accept-Language', 'en');
            $locale = substr($locale, 0, 2);

            if (! in_array($locale, ['en', 'pt', 'es'], true)) {
                $locale = 'en';
            }
        }

        app()->setLocale($locale);

        return $next($request);
    }
}

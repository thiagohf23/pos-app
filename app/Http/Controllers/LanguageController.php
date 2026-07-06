<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

class LanguageController extends Controller
{
    /**
     * Update the application locale preference.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $locale = $request->input('locale');

        if (! in_array($locale, ['en', 'pt', 'es'], true)) {
            $locale = 'en';
        }

        app()->setLocale($locale);

        return redirect()->back()->withCookie(
            Cookie::make('locale', $locale, 60 * 24 * 365, '/', null, false, false, false, 'strict')
        );
    }
}

<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'locale' => app()->getLocale(),
            'translations' => $this->getTranslations(app()->getLocale()),
            'auth' => [
                'user' => $request->user(),
                'roles' => $request->user()?->getRoleNames() ?? [],
            ],
            'sidebarOpen' => $request->hasCookie('sidebar_state') && $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * Load all PHP translation files for the given locale.
     *
     * @return array<string, mixed>
     */
    private function getTranslations(string $locale): array
    {
        $translations = [];
        $path = lang_path($locale);

        if (is_dir($path)) {
            foreach (glob($path.'/*.php') as $file) {
                $key = pathinfo($file, PATHINFO_FILENAME);
                $translations[$key] = require $file;
            }
        }

        return $translations;
    }
}

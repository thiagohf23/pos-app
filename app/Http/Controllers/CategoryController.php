<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): InertiaResponse
    {
        $categories = Category::withCount('products')->latest()->paginate(10);

        return Inertia::render('categories/index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        Category::create($request->validated());

        return redirect()->route('categories.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->validated();

        if (isset($data['is_active']) && ! $data['is_active'] && $category->products()->exists()) {
            return redirect()->back()->withErrors([
                'is_active' => 'Cannot deactivate this category because it is linked to one or more products.',
            ]);
        }

        $category->update($data);

        return redirect()->route('categories.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category): RedirectResponse
    {
        if ($category->products()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Cannot delete this category because it is linked to one or more products.',
            ]);
        }

        $category->delete();

        return redirect()->route('categories.index');
    }
}

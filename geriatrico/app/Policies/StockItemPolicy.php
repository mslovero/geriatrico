<?php

namespace App\Policies;

use App\Models\StockItem;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class StockItemPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->isStaff();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, StockItem $stockItem): bool
    {
        return $user->isStaff();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->role === 'staff';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, StockItem $stockItem): bool
    {
        return $user->isAdmin() || $user->role === 'staff';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, StockItem $stockItem): bool
    {
        return $user->isAdmin();
    }
}

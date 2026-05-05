<?php

namespace App\Policies;

use App\Models\LoteStock;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class LoteStockPolicy
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
    public function view(User $user, LoteStock $loteStock): bool
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
    public function update(User $user, LoteStock $loteStock): bool
    {
        return $user->isAdmin() || $user->role === 'staff';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, LoteStock $loteStock): bool
    {
        return $user->isAdmin();
    }
}

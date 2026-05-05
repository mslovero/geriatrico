<?php

namespace App\Policies;

use App\Models\Medicacion;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class MedicacionPolicy
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
    public function view(User $user, Medicacion $medicacion): bool
    {
        return $user->isStaff();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->role === 'staff' || $user->role === 'enfermero' || $user->role === 'medico';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Medicacion $medicacion): bool
    {
        return $user->isAdmin() || $user->role === 'staff' || $user->role === 'enfermero' || $user->role === 'medico';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Medicacion $medicacion): bool
    {
        return $user->isAdmin();
    }
}

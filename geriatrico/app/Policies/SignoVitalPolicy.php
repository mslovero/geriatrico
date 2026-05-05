<?php

namespace App\Policies;

use App\Models\SignoVital;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SignoVitalPolicy
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
    public function view(User $user, SignoVital $signoVital): bool
    {
        return $user->isStaff();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->role === 'enfermero' || $user->role === 'medico' || $user->role === 'staff';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, SignoVital $signoVital): bool
    {
        return $user->isAdmin() || $user->role === 'enfermero' || $user->role === 'medico';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, SignoVital $signoVital): bool
    {
        return $user->isAdmin();
    }
}

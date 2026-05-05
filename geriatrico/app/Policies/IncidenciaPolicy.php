<?php

namespace App\Policies;

use App\Models\Incidencia;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class IncidenciaPolicy
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
    public function view(User $user, Incidencia $incidencia): bool
    {
        return $user->isStaff();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isStaff();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Incidencia $incidencia): bool
    {
        // Solo el creador o un admin puede editar una incidencia
        return $user->isAdmin() || $user->id === $incidencia->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Incidencia $incidencia): bool
    {
        return $user->isAdmin();
    }
}

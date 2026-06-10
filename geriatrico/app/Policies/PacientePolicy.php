<?php

namespace App\Policies;

use App\Models\Paciente;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PacientePolicy
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
    public function view(User $user, Paciente $paciente): bool
    {
        return $user->isStaff();
    }

    /**
     * Determine whether the user can create models.
     * Sólo admin y personal administrativo pueden registrar nuevos pacientes.
     * Los médicos atienden, no admiten. Enfermería tampoco crea pacientes.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->role === 'administrativo';
    }

    /**
     * Determine whether the user can update the model.
     * Mismo criterio que crear: tarea administrativa, no clínica.
     */
    public function update(User $user, Paciente $paciente): bool
    {
        return $user->isAdmin() || $user->role === 'administrativo';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Paciente $paciente): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Paciente $paciente): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Paciente $paciente): bool
    {
        return $user->isAdmin();
    }
}

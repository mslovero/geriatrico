<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePacienteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $pacienteId = $this->route('paciente');

        return [
            'nombre' => 'sometimes|required|string|max:100',
            'apellido' => 'sometimes|required|string|max:100',
            'dni' => [
                'sometimes',
                'required',
                'string',
                Rule::unique('pacientes', 'dni')->ignore($pacienteId)
            ],
            'fecha_nacimiento' => 'nullable|date|before:today',
            'habitacion_id' => 'nullable|exists:habitaciones,id',
            'cama_id' => 'nullable|exists:camas,id',
            'contacto_emergencia' => 'nullable|array',
            'contacto_emergencia.nombre' => 'required_with:contacto_emergencia|string|max:150',
            'contacto_emergencia.telefono' => 'required_with:contacto_emergencia|string|max:20',
            'contacto_emergencia.relacion' => 'nullable|string|max:100',
            'medico_cabecera' => 'nullable|string|max:150',
            'patologias' => 'nullable|string',
            'estado' => ['nullable', Rule::in([
                'activo', 'temporal', 'ausente', 'suspendido', 'alta_medica', 'egresado', 'fallecido'
            ])],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del paciente es obligatorio',
            'apellido.required' => 'El apellido del paciente es obligatorio',
            'dni.required' => 'El DNI es obligatorio',
            'dni.unique' => 'Ya existe otro paciente con este DNI',
            'fecha_nacimiento.before' => 'La fecha de nacimiento debe ser anterior a hoy',
            'habitacion_id.exists' => 'La habitación seleccionada no existe',
            'cama_id.exists' => 'La cama seleccionada no existe',
            'estado.in' => 'El estado seleccionado no es válido',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->filled('cama_id') && !$this->filled('habitacion_id')) {
                $validator->errors()->add(
                    'habitacion_id',
                    'Debe asignar una habitación si asigna una cama'
                );
            }
        });
    }
}

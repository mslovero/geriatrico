<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreArchivoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paciente_id' => 'required_without:historial_medico_id|exists:pacientes,id',
            'historial_medico_id' => 'required_without:paciente_id|exists:historial_medicos,id',
            'tipo' => 'required|string|max:100',
            'archivo' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240', // Máx 10MB
        ];
    }

    public function messages(): array
    {
        return [
            'archivo.required' => 'Debe seleccionar un archivo para subir',
            'archivo.mimes' => 'Solo se permiten archivos PDF, JPG, JPEG o PNG',
            'archivo.max' => 'El archivo no debe pesar más de 10MB',
            'tipo.required' => 'Debe indicar el tipo de documento (DNI, Carnet, Estudio, etc.)',
        ];
    }
}

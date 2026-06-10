<?php

namespace App\Exceptions;

class MedicacionSinStockVinculadoException extends DomainException
{
    public function __construct(string $message = 'No se puede administrar: el medicamento no está vinculado a ningún item de stock.')
    {
        parent::__construct($message);
    }

    public function getStatusCode(): int
    {
        return 422;
    }
}

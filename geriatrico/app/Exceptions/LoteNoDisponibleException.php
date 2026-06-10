<?php

namespace App\Exceptions;

class LoteNoDisponibleException extends DomainException
{
    public function __construct(string $message = 'No hay lotes disponibles, stock insuficiente, o todos están vencidos.')
    {
        parent::__construct($message);
    }

    public function getStatusCode(): int
    {
        return 422;
    }
}

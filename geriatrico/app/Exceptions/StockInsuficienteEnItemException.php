<?php

namespace App\Exceptions;

class StockInsuficienteEnItemException extends DomainException
{
    public function __construct(
        public readonly int $stockActual,
        public readonly int $cantidadSolicitada,
        string $nombreItem,
    ) {
        parent::__construct(
            "Stock insuficiente para \"{$nombreItem}\". Disponible: {$stockActual}, Solicitado: {$cantidadSolicitada}."
        );
    }

    public function getStatusCode(): int
    {
        return 422;
    }
}

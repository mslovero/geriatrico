<?php

namespace App\Exceptions;

class StockInsuficienteException extends DomainException
{
    public static function enLote(string $numeroLote, int $disponible, int $solicitado): self
    {
        return new self("Stock insuficiente en lote {$numeroLote}. Disponible: {$disponible}, Solicitado: {$solicitado}");
    }

    public function getStatusCode(): int
    {
        return 422;
    }
}

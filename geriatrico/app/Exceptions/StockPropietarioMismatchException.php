<?php

namespace App\Exceptions;

class StockPropietarioMismatchException extends DomainException
{
    public static function noEsDelGeriatrico(string $stockNombre): self
    {
        return new self("El item de stock \"{$stockNombre}\" no pertenece al geriátrico");
    }

    public static function noEsDelPaciente(string $stockNombre): self
    {
        return new self("El item de stock \"{$stockNombre}\" no pertenece al paciente");
    }

    public function getStatusCode(): int
    {
        return 422;
    }
}

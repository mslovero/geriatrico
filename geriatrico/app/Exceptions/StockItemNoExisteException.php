<?php

namespace App\Exceptions;

class StockItemNoExisteException extends DomainException
{
    public function __construct(string $message = 'El item de stock vinculado no existe.')
    {
        parent::__construct($message);
    }

    public function getStatusCode(): int
    {
        return 422;
    }
}

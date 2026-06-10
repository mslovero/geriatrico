<?php

namespace App\Exceptions;

use RuntimeException;

abstract class DomainException extends RuntimeException
{
    abstract public function getStatusCode(): int;

    public function code(): string
    {
        return class_basename(static::class);
    }
}

<?php

namespace App\Support;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

final class Periodo
{
    public function __construct(
        public readonly CarbonImmutable $desde,
        public readonly CarbonImmutable $hasta,
    ) {
    }

    public static function delMesActual(): self
    {
        return new self(
            CarbonImmutable::now()->startOfMonth(),
            CarbonImmutable::now()->endOfMonth(),
        );
    }

    public static function desde(?string $desde, ?string $hasta): self
    {
        $inicio = $desde
            ? CarbonImmutable::parse($desde)->startOfDay()
            : CarbonImmutable::now()->startOfMonth();

        $fin = $hasta
            ? CarbonImmutable::parse($hasta)->endOfDay()
            : CarbonImmutable::now()->endOfMonth();

        return new self($inicio, $fin);
    }

    public function toArray(): array
    {
        return [
            'desde' => $this->desde->toIso8601String(),
            'hasta' => $this->hasta->toIso8601String(),
        ];
    }

    public function rango(): array
    {
        return [$this->desde, $this->hasta];
    }
}

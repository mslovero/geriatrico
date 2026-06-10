import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { get } from "@/api/api";

interface PatientOption {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
}

interface CollectionResponse<T> {
  data?: T[];
}

interface PatientComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

export function PatientCombobox({
  value,
  onChange,
  placeholder = "Seleccionar paciente",
  disabled = false,
  id,
}: PatientComboboxProps) {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await get<PatientOption[] | CollectionResponse<PatientOption>>(
          "/pacientes"
        );
        if (cancelled) return;
        const list = Array.isArray(res) ? res : res?.data ?? [];
        setPatients(list);
      } catch (error) {
        console.error("Error cargando pacientes:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || loading}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={loading ? "Cargando pacientes…" : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {patients.map((p) => (
          <SelectItem key={p.id} value={p.id.toString()}>
            {p.nombre} {p.apellido} · DNI {p.dni}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

import React, { useEffect, useState } from 'react';
import { get } from '../api/api';

export default function PatientSelect({ name, value, onChange, className, required = true }) {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await get('/pacientes');
                setPatients(res.data || res);
            } catch (error) {
                console.error("Error fetching patients:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    if (loading) return <div className="spinner-border spinner-border-sm text-primary" role="status"></div>;

    return (
        <select
            name={name}
            value={value}
            onChange={onChange}
            className={className}
            required={required}
        >
            <option value="">Seleccionar Paciente</option>
            {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                    {patient.nombre} {patient.apellido} (DNI: {patient.dni})
                </option>
            ))}
        </select>
    );
}

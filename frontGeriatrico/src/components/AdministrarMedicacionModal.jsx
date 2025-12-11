import React, { useState, useEffect } from 'react';
import { post } from '../api/api';
import { handleApiError } from '../utils/alerts';
import { CheckCircle, ExclamationTriangle, X } from 'react-bootstrap-icons';

export default function AdministrarMedicacionModal({ show, onHide, medicacion, onSuccess }) {
    const [observaciones, setObservaciones] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Resetear estado cuando se abre el modal
    useEffect(() => {
        if (show) {
            setObservaciones('');
            setError(null);
            setSuccess(null);
        }
    }, [show, medicacion]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Usamos el endpoint centralizado de registros médicos
            // Esto asegura que se cree el registro en la planilla Y se descuente stock
            const res = await post('/registro-medicaciones', {
                medicacion_id: medicacion.id,
                fecha_hora: new Date().toISOString().slice(0, 19).replace('T', ' '), // Formato YYYY-MM-DD HH:mm:ss
                estado: 'administrado',
                observaciones: observaciones,
                // Nota: El backend actualmente descuenta 1 unidad por defecto en este endpoint.
                // Si necesitamos soportar cantidad variable, debemos actualizar el controlador.
            });

            const msg = res.stock_restante !== null 
                ? `Administración registrada. Stock restante: ${res.stock_restante}`
                : 'Administración registrada correctamente';

            setSuccess(msg);
            if (onSuccess) onSuccess(res);
            
            setTimeout(() => {
                onHide();
            }, 2000);
        } catch (err) {
            console.error("Error detallado:", err);
            // Usar el manejador de errores global para mostrar alertas consistentes
            handleApiError(err);
            // Opcional: mantener el error local si se desea mostrar también en el modal, 
            // pero handleApiError ya muestra un SweetAlert.
            // setError('Ocurrió un error. Verifique la alerta.'); 
        } finally {
            setLoading(false);
        }
    };

    if (!show || !medicacion) return null;

    return (
        <>
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header bg-light border-bottom-0">
                            <h5 className="modal-title fw-bold text-primary">
                                💊 Administrar Medicación
                            </h5>
                            <button type="button" className="btn-close" onClick={onHide}></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="mb-4">
                                <h5 className="fw-bold text-dark mb-1">{medicacion.nombre}</h5>
                                <div className="text-muted small">
                                    Paciente: {medicacion.paciente ? `${medicacion.paciente.nombre} ${medicacion.paciente.apellido}` : 'Sin asignar'}
                                </div>
                                {!medicacion.stock_item_id && medicacion.origen_pago !== 'obra_social' && (
                                    <div className="alert alert-warning mt-2 mb-0 small">
                                        <ExclamationTriangle className="me-2" />
                                        Este medicamento no está vinculado a ningún item de stock.
                                        <br/>
                                        <strong>Acción requerida:</strong> Edite el medicamento y vincúlelo a un stock existente.
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="alert alert-danger d-flex align-items-center" role="alert">
                                    <ExclamationTriangle className="me-2" />
                                    <div>{error}</div>
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success d-flex align-items-center" role="alert">
                                    <CheckCircle className="me-2" />
                                    <div>{success}</div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="alert alert-info small mb-3">
                                    <CheckCircle className="me-2" />
                                    Se registrará la administración de{' '}
                                    <strong>
                                        1 {medicacion.stock_item?.unidad_medida || 'dosis'}
                                    </strong>
                                    {medicacion.stock_item_id && medicacion.origen_pago !== 'obra_social' && (
                                        <span> y se descontará del stock automáticamente</span>
                                    )}
                                    .
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold">Observaciones (opcional)</label>
                                    <textarea
                                        className="form-control"
                                        rows="2"
                                        value={observaciones}
                                        onChange={(e) => setObservaciones(e.target.value)}
                                        placeholder="Ej: Paciente rechazó primera dosis, se administró en segunda instancia..."
                                    ></textarea>
                                </div>

                                <div className="d-grid gap-2">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary btn-lg" 
                                        disabled={loading || success || (!medicacion.stock_item_id && medicacion.origen_pago !== 'obra_social')}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Registrando...
                                            </>
                                        ) : 'Confirmar Administración'}
                                    </button>
                                    <button type="button" className="btn btn-light" onClick={onHide} disabled={loading}>
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

import Swal from 'sweetalert2';

/**
 * Muestra un mensaje de éxito
 */
export const showSuccess = (message, title = 'Éxito') => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#28a745',
  });
};

/**
 * Muestra un mensaje de error
 */
export const showError = (message, title = 'Error') => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: message,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#dc3545',
  });
};

/**
 * Muestra múltiples errores de validación
 */
export const showValidationErrors = (errors) => {
  let errorList = '';

  if (typeof errors === 'object' && errors !== null) {
    Object.values(errors).forEach((errorArray) => {
      if (Array.isArray(errorArray)) {
        errorArray.forEach((error) => {
          errorList += `• ${error}<br>`;
        });
      } else {
        errorList += `• ${errorArray}<br>`;
      }
    });
  } else if (typeof errors === 'string') {
    errorList = errors;
  }

  return Swal.fire({
    icon: 'error',
    title: 'Errores de validación',
    html: errorList || 'Ha ocurrido un error de validación',
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#dc3545',
  });
};

/**
 * Muestra un diálogo de confirmación
 */
export const showConfirm = (message, title = '¿Está seguro?') => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ffc107',
    cancelButtonColor: '#6c757d',
  });
};

/**
 * Maneja errores de peticiones HTTP
 */
export const handleApiError = (error) => {
  if (error.response) {
    // El servidor respondió con un código de estado fuera del rango 2xx
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        showError(data.message || 'Solicitud incorrecta');
        break;
      case 401:
        showError('No autorizado. Por favor inicie sesión.');
        break;
      case 403:
        showError('No tiene permisos para realizar esta acción.');
        break;
      case 404:
        showError(data.message || 'Recurso no encontrado.');
        break;
      case 422:
        // Errores de validación
        if (data.errors) {
          showValidationErrors(data.errors);
        } else if (data.message) {
          showError(data.message);
        } else {
          showError('Error de validación en los datos enviados.');
        }
        break;
      case 500:
        showError('Error interno del servidor. Por favor intente más tarde.');
        break;
      default:
        showError(data.message || 'Ha ocurrido un error inesperado.');
    }
  } else if (error.request) {
    // La petición fue hecha pero no se recibió respuesta
    showError('No se pudo conectar con el servidor. Verifique su conexión.');
  } else {
    // Algo pasó al configurar la petición
    showError(error.message || 'Ha ocurrido un error inesperado.');
  }
};

/**
 * Muestra un mensaje de información
 */
export const showInfo = (message, title = 'Información') => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: message,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#17a2b8',
  });
};

/**
 * Muestra un mensaje de advertencia
 */
export const showWarning = (message, title = 'Advertencia') => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#ffc107',
  });
};

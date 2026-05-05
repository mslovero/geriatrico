import React from 'react';
import { CheckCircleFill, Circle } from 'react-bootstrap-icons';

const WizardSteps = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="wizard-steps mb-5">
      <div className="d-flex align-items-center justify-content-between position-relative">
        {/* Línea de progreso */}
        <div
          className="wizard-progress-line position-absolute bg-light"
          style={{
            top: '50%',
            left: '0',
            right: '0',
            height: '3px',
            zIndex: 0,
            transform: 'translateY(-50%)'
          }}
        >
          <div
            className="bg-primary h-100 transition-all"
            style={{
              width: `${((currentStep) / (steps.length - 1)) * 100}%`,
              transition: 'width 0.3s ease'
            }}
          ></div>
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = index <= currentStep || isCompleted;

          return (
            <div
              key={index}
              className="d-flex flex-column align-items-center position-relative"
              style={{ zIndex: 1, flex: 1 }}
            >
              <button
                type="button"
                className={`
                  wizard-step-circle rounded-circle border-0 shadow-sm d-flex align-items-center justify-content-center
                  ${isCurrent ? 'bg-primary text-white' : isCompleted ? 'bg-success text-white' : 'bg-white text-muted'}
                  ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                `}
                style={{
                  width: '48px',
                  height: '48px',
                  cursor: isClickable ? 'pointer' : 'not-allowed'
                }}
                onClick={() => isClickable && onStepClick && onStepClick(index)}
                disabled={!isClickable}
              >
                {isCompleted ? (
                  <CheckCircleFill size={24} />
                ) : (
                  <span className="fw-bold">{index + 1}</span>
                )}
              </button>
              <div className="mt-2 text-center" style={{ maxWidth: '120px' }}>
                <small className={`fw-bold ${isCurrent ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted'}`}>
                  {step.title}
                </small>
                {step.description && (
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WizardSteps;

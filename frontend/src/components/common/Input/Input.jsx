import React from 'react';
import clsx from 'clsx';
import './Input.css';

export const Input = ({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  className,
  inputClassName,
  ...props
}) => {
  return (
    <div className={clsx('input-wrapper', className)}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className={clsx(
          'input-field',
          { 'input-error': error },
          inputClassName
        )}
        {...props}
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};
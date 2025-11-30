import React from 'react';
import clsx from 'clsx';
import './Card.css';

export const Card = ({
  children,
  title,
  subtitle,
  footer,
  hoverable = false,
  className,
}) => {
  return (
    <div className={clsx('card', { 'card-hoverable': hoverable }, className)}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

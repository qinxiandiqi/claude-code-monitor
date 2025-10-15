import React from 'react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon,
  trend,
  loading = false,
  color = 'primary',
  className,
}) => {
  const colorClasses = {
    primary: 'bg-primary text-primary-content',
    secondary: 'bg-secondary text-secondary-content',
    accent: 'bg-accent text-accent-content',
    success: 'bg-success text-success-content',
    warning: 'bg-warning text-warning-content',
    error: 'bg-error text-error-content',
  };

  return (
    <div className={clsx('card bg-base-100 shadow-xl', className)}>
      <div className="card-body p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="card-title text-sm font-medium text-base-content/60 mb-2">
              {title}
            </h2>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <div className="skeleton h-8 w-20"></div>
              ) : (
                <>
                  <span className="text-3xl font-bold">{value}</span>
                  {unit && <span className="text-sm text-base-content/60">{unit}</span>}
                </>
              )}
            </div>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={clsx(
                    'text-xs font-medium',
                    trend.isPositive ? 'text-success' : 'text-error'
                  )}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-base-content/60">vs last period</span>
              </div>
            )}
          </div>
          {icon && (
            <div className={clsx('rounded-lg p-3', colorClasses[color])}>
              <div className="w-6 h-6">{icon}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
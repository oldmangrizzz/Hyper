// Reusable UI Components for Epic Simulator
// Production-ready component library

import React from "react";

// ============================================================================
// CARD COMPONENTS
// ============================================================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "dark" | "warning" | "success";
}

export function Card({ children, className = "", variant = "default" }: CardProps) {
  const variants = {
    default: "bg-white ring-slate-200",
    dark: "bg-slate-900 text-white ring-slate-700",
    warning: "bg-amber-50 ring-amber-200",
    success: "bg-emerald-50 ring-emerald-200",
  };

  return (
    <div className={`rounded-2xl p-5 shadow-xl ring-1 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, badge, className = "" }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        {subtitle && (
          <p className="text-xs uppercase tracking-wide text-slate-500">{subtitle}</p>
        )}
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      {badge && <div>{badge}</div>}
    </div>
  );
}

// ============================================================================
// BADGE COMPONENTS
// ============================================================================

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";
type ValidationSeverity = "HardStop" | "SoftStop" | "Warning" | "None";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Badge({ children, variant = "default", size = "md", className = "" }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    error: "bg-rose-100 text-rose-700",
    info: "bg-sky-100 text-sky-700",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-2 text-sm",
  };

  return (
    <span
      className={`rounded-full font-semibold ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}

export function ValidationBadge({ severity }: { severity: ValidationSeverity }) {
  const variants: Record<ValidationSeverity, BadgeVariant> = {
    HardStop: "error",
    SoftStop: "warning",
    Warning: "info",
    None: "success",
  };

  const labels: Record<ValidationSeverity, string> = {
    HardStop: "Hard Stop",
    SoftStop: "Soft Stop",
    Warning: "Warning",
    None: "Valid",
  };

  return <Badge variant={variants[severity]}>{labels[severity]}</Badge>;
}

// ============================================================================
// BUTTON COMPONENTS
// ============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: disabled
      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
      : "bg-emerald-600 text-white hover:bg-emerald-700",
    secondary: disabled
      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
      : "bg-slate-200 text-slate-700 hover:bg-slate-300",
    danger: disabled
      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
      : "bg-rose-600 text-white hover:bg-rose-700",
    success: disabled
      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
      : "bg-emerald-600 text-white hover:bg-emerald-700",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`rounded-full font-semibold shadow-sm transition ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// ============================================================================
// FORM COMPONENTS
// ============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export function Input({ label, error, helpText, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-slate-700">{label}</label>}
      <input
        className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
          error ? "border-rose-300 bg-rose-50" : "border-slate-300 bg-white"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
      {helpText && !error && <p className="text-xs text-slate-500">{helpText}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({
  label,
  error,
  helpText,
  options,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-slate-700">{label}</label>}
      <select
        className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
          error ? "border-rose-300 bg-rose-50" : "border-slate-300 bg-white"
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      {helpText && !error && <p className="text-xs text-slate-500">{helpText}</p>}
    </div>
  );
}

// ============================================================================
// ALERT COMPONENTS
// ============================================================================

interface AlertProps {
  children: React.ReactNode;
  variant: "error" | "warning" | "info" | "success";
  title?: string;
  className?: string;
}

export function Alert({ children, variant, title, className = "" }: AlertProps) {
  const variants = {
    error: "border-rose-200 bg-rose-50 text-rose-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    info: "border-sky-200 bg-sky-50 text-sky-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };

  return (
    <div className={`rounded-xl border px-4 py-3 ${variants[variant]} ${className}`}>
      {title && <p className="font-semibold">{title}</p>}
      <div className="text-sm">{children}</div>
    </div>
  );
}

// ============================================================================
// MODAL COMPONENTS
// ============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ isOpen, onClose, title, children, footer, size = "md" }: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`w-full ${sizes[size]} rounded-2xl bg-white p-6 shadow-2xl`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

// ============================================================================
// LOADING COMPONENTS
// ============================================================================

export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600 ${sizes[size]}`} />
  );
}

export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-slate-700">{message}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TABLE COMPONENTS
// ============================================================================

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse ${className}`}>{children}</table>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-slate-50">
      <tr>{children}</tr>
    </thead>
  );
}

interface TableHeadCellProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeadCell({ children, className = "" }: TableHeadCellProps) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 ${className}`}
    >
      {children}
    </th>
  );
}

interface TableBodyProps {
  children: React.ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody className="divide-y divide-slate-200">{children}</tbody>;
}

interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TableRow({ children, onClick, className = "" }: TableRowProps) {
  return (
    <tr
      className={`transition hover:bg-slate-50 ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export function TableCell({ children, className = "" }: TableCellProps) {
  return <td className={`px-4 py-3 text-sm text-slate-700 ${className}`}>{children}</td>;
}

// ============================================================================
// STATUS INDICATOR
// ============================================================================

interface StatusDotProps {
  status: "success" | "warning" | "error" | "info";
  pulse?: boolean;
}

export function StatusDot({ status, pulse = false }: StatusDotProps) {
  const colors = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-rose-500",
    info: "bg-sky-500",
  };

  return (
    <span className="relative flex h-3 w-3">
      {pulse && (
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${colors[status]}`}
        />
      )}
      <span className={`relative inline-flex h-3 w-3 rounded-full ${colors[status]}`} />
    </span>
  );
}

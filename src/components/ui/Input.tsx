import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = "", ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
              icon ? "pl-11" : ""
            } ${
              error
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-slate-300"
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
        {hint && !error && (
          <p className="text-xs text-slate-400 mt-1.5">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;

// Textarea variant
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = "", ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition resize-y ${
            error
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-slate-300"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
        {hint && !error && (
          <p className="text-xs text-slate-400 mt-1.5">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

// Select variant
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className = "", ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
            error
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-slate-300"
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
        {hint && !error && (
          <p className="text-xs text-slate-400 mt-1.5">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

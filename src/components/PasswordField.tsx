import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  'aria-label'?: string;
}

export function PasswordField({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  autoComplete = 'off',
  'aria-label': ariaLabel,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative w-full">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-label={ariaLabel}
        spellCheck={false}
        className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 pr-11 text-slate-100 placeholder-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30 disabled:opacity-50"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        aria-label={show ? 'Hide token' : 'Show token'}
        aria-pressed={show}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-200 transition"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default PasswordField;

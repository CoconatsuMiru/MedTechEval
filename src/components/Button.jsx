function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = "inline-flex items-center justify-center gap-2 font-medium px-4 py-2 rounded-lg transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
  const variants = {
    primary: "bg-brand-900 hover:bg-brand-700 text-white",
    dark: "bg-slate-800 hover:bg-slate-900 text-white",
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
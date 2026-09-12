function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = "font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    dark: "bg-slate-800 hover:bg-slate-900 text-white",
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
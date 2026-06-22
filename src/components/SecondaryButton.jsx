import React from "react";

export default function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-saathi-line bg-white px-5 text-sm font-bold text-saathi-ink shadow-sm transition hover:border-saathi-green hover:text-saathi-green disabled:cursor-not-allowed disabled:text-saathi-muted ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

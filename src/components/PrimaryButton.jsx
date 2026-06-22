import React from "react";

export default function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-saathi-green px-5 text-sm font-bold text-white shadow-saathi transition hover:bg-saathi-greenDark disabled:cursor-not-allowed disabled:bg-saathi-muted disabled:shadow-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

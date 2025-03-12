import React from "react";
import { ReactNode} from "react";


interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void; // ⬅ Make this optional
  variant?: "primary" | "outline" | "destructive";
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  className = "",
}) => {
  const baseStyles = "px-4 py-2 rounded transition";
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    outline: "border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      onClick={onClick} // No issue if onClick is undefined
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

import React, { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
}

export const Table: React.FC<TableProps> = ({ children }) => {
  return <table className="w-full border-collapse">{children}</table>;
};

export const TableHead: React.FC<TableProps> = ({ children }) => {
  return <thead className="bg-gray-100">{children}</thead>;
};

export const TableRow: React.FC<TableProps> = ({ children }) => {
  return <tr className="border-b hover:bg-gray-50">{children}</tr>;
};

export const TableCell: React.FC<TableProps> = ({ children }) => {
  return <td className="p-3 border">{children}</td>;
};

export const TableHeaderCell: React.FC<TableProps> = ({ children }) => {
  return <th className="p-3 border text-left font-semibold">{children}</th>;
};

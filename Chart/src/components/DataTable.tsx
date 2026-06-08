import React from 'react';
import type { FieldSchema } from '../types/schema';

interface DataTableProps {
  data: Record<string, unknown>[];
  fields: FieldSchema[];
}

const DataTable: React.FC<DataTableProps> = ({ data, fields }) => {
  if (!data.length) return null;

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {fields.map((f) => (
              <th key={f.key}>
                <span>{f.label}</span>
                <span className={`type-badge type-${f.type}`}>{f.type}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'even' : 'odd'}>
              {fields.map((f) => (
                <td key={f.key}>{String(row[f.key] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;

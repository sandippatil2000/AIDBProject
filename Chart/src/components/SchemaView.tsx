import React from 'react';
import type { FieldSchema } from '../types/schema';

interface SchemaViewProps {
  fields: FieldSchema[];
  rowCount: number;
  domain: string;
}

const SchemaView: React.FC<SchemaViewProps> = ({ fields, rowCount, domain }) => {
  return (
    <div className="schema-card">
      <div className="schema-header">
        <h3>Inferred JSON Schema</h3>
        <div className="schema-meta">
          <span className="meta-chip">Domain: {domain}</span>
          <span className="meta-chip">Rows: {rowCount}</span>
          <span className="meta-chip">Fields: {fields.length}</span>
        </div>
      </div>
      <div className="schema-fields">
        {fields.map((f) => (
          <div key={f.key} className="schema-field">
            <div className="field-info">
              <span className="field-key">{f.key}</span>
              <span className={`type-badge type-${f.type}`}>{f.type}</span>
            </div>
            <div className="field-meta">
              <span>Unique: {f.uniqueCount}</span>
              <span>Sample: {f.sampleValues.slice(0, 2).map(String).join(', ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchemaView;

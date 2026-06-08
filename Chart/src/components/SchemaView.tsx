import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import type { FieldSchema } from '../types/schema';

interface SchemaViewProps {
  fields: FieldSchema[];
  rowCount: number;
  domain: string;
}

const TYPE_COLOR: Record<string, 'primary' | 'success' | 'warning' | 'secondary' | 'info'> = {
  number:      'success',
  string:      'primary',
  date:        'warning',
  boolean:     'info',
  categorical: 'secondary',
};

const SchemaView: React.FC<SchemaViewProps> = ({ fields, rowCount, domain }) => {
  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          mb: 2,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorageIcon fontSize="small" color="primary" />
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            Inferred JSON Schema
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`Domain: ${domain}`} size="small" color="primary" variant="outlined" />
          <Chip label={`${rowCount} rows`} size="small" variant="outlined" />
          <Chip label={`${fields.length} fields`} size="small" variant="outlined" />
        </Box>
      </Box>

      {/* Fields Grid using CSS grid via sx */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 1.5,
        }}
      >
        {fields.map((f) => (
          <Card
            key={f.key}
            variant="outlined"
            sx={{
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: '0 2px 8px rgba(25,118,210,0.15)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ py: '12px !important', px: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 0.8,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    color: 'text.primary',
                  }}
                >
                  {f.key}
                </Typography>
                <Chip
                  label={f.type}
                  size="small"
                  color={TYPE_COLOR[f.type] ?? 'default'}
                  sx={{ fontSize: '0.62rem', height: 20, fontWeight: 700 }}
                />
              </Box>
              <Divider sx={{ mb: 0.8 }} />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary">
                  Unique: <strong>{f.uniqueCount}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  Sample: <strong>{f.sampleValues.slice(0, 2).map(String).join(', ')}</strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default SchemaView;

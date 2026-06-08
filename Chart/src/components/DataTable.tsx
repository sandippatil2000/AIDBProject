import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import type { FieldSchema } from '../types/schema';

interface DataTableProps {
  data: Record<string, unknown>[];
  fields: FieldSchema[];
}

const TYPE_COLOR: Record<string, 'primary' | 'success' | 'warning' | 'secondary' | 'info'> = {
  number:      'success',
  string:      'primary',
  date:        'warning',
  boolean:     'info',
  categorical: 'secondary',
};

const DataTable: React.FC<DataTableProps> = ({ data, fields }) => {
  if (!data.length) return null;

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 2, maxHeight: 400, overflow: 'auto' }}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            {fields.map((f) => (
              <TableCell
                key={f.key}
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderBottom: '2px solid',
                  borderColor: 'primary.dark',
                }}
              >
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, fontSize: '0.78rem' }}>
                  {f.label}
                </Typography>
                <Chip
                  label={f.type}
                  size="small"
                  color={TYPE_COLOR[f.type] ?? 'default'}
                  sx={{ fontSize: '0.6rem', height: 18, mt: 0.3, fontWeight: 600 }}
                />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, ri) => (
            <TableRow
              key={ri}
              hover
              sx={{
                bgcolor: ri % 2 === 0 ? 'background.paper' : 'secondary.main',
                '&:last-child td': { border: 0 },
              }}
            >
              {fields.map((f) => (
                <TableCell
                  key={f.key}
                  sx={{ color: 'text.secondary', fontSize: '0.85rem', py: 1 }}
                >
                  {String(row[f.key] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;

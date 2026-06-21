import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { DBConnection } from '../types/DBConnection';
import { DBTypes } from '../types/DBTypes';

interface ConnectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (connection: DBConnection) => void;
  connection?: DBConnection | null;
}

const defaultConnection: Partial<DBConnection> = {
  name: '',
  databaseType: DBTypes.POSTGRESQL,
  host: '',
  port: 5432,
  database: '',
  connectionString: '',
  status: 'offline',
  lastPing: 'Never',
};

export const ConnectionDialog = ({
  open,
  onClose,
  onSave,
  connection,
}: ConnectionDialogProps) => {
  const [formData, setFormData] = useState<Partial<DBConnection>>(defaultConnection);

  useEffect(() => {
    if (open) {
      if (connection) {
        setFormData(connection);
      } else {
        setFormData(defaultConnection);
      }
    }
  }, [open, connection]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'port' ? Number(value) : value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setFormData((prev) => ({
      ...prev,
      databaseType: e.target.value as DBConnection['databaseType'],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as DBConnection);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{connection ? 'Edit Connection' : 'Add Connection'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Connection Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.name || ''}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense" required>
                <InputLabel id="db-type-label">Database Type</InputLabel>
                <Select
                  labelId="db-type-label"
                  id="db-type-select"
                  value={formData.databaseType || ''}
                  label="Database Type"
                  onChange={handleSelectChange}
                >
                  {Object.values(DBTypes).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={8}>
              <TextField
                margin="dense"
                name="host"
                label="Host"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.host || ''}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                name="port"
                label="Port"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.port || ''}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="database"
                label="Database Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.database || ''}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="connectionString"
                label="Connection String"
                type="text"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={formData.connectionString || ''}
                onChange={handleChange}
                helperText="Provide a full connection string or use the fields above."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {connection ? 'Save Changes' : 'Add Connection'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

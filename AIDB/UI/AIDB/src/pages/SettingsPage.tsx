import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Stack,
  Snackbar,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Settings as SettingsIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';

// ── Initial / "saved" defaults ────────────────────────────────────────────────
const DEFAULT_ORG_NAME = '';

export const SettingsPage = () => {
  // ── Saved state (what is persisted) ─────────────────────────────────────────
  const [savedOrgName, setSavedOrgName] = useState(DEFAULT_ORG_NAME);

  // ── Draft state (what the user is currently editing) ────────────────────────
  const [orgName, setOrgName] = useState(DEFAULT_ORG_NAME);

  // ── Snackbar feedback ────────────────────────────────────────────────────────
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const isDirty = orgName !== savedOrgName;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSave = () => {
    setSavedOrgName(orgName.trim());
    setOrgName(orgName.trim());
    setSnackbar({ open: true, message: 'Settings saved successfully.', severity: 'success' });
  };

  const handleCancel = () => {
    setOrgName(savedOrgName);
    setSnackbar({ open: true, message: 'Changes discarded.', severity: 'info' });
  };

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto', px: { xs: 1, sm: 2 } }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}


      {/* ── Panel Settings Card ───────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {/* Card Header */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            background: 'linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 100%)',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <TuneIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
              Settings
            </Typography>
          </Box>
        </Box>

        {/* Card Body */}
        <Box sx={{ px: 3, py: 3 }}>
          <Stack spacing={3}>
            {/* Organization Name field */}
            <Box>
              <TextField
                size="medium"
                id="setting-org-name"
                variant="outlined"
                placeholder="Enter your organization name"
                value={orgName}
                label="Orgnization Name"
                onChange={(e) => setOrgName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}

                inputProps={{ maxLength: 120 }}
                helperText={`${orgName.length} / 120 characters`}
              />
            </Box>
          </Stack>
        </Box>

        <Divider />

        {/* Action Buttons */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.5,
            bgcolor: 'background.paper',
          }}
        >
          <Button
            id="settings-cancel-btn"
            variant="outlined"
            color="inherit"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
            disabled={!isDirty}
            sx={{
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'text.secondary',
                backgroundColor: 'action.hover',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            id="settings-save-btn"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!isDirty}
            sx={{
              px: 3,
              boxShadow: '0 4px 12px rgba(25,118,210,0.25)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25,118,210,0.35)',
              },
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Paper>

      {/* ── Snackbar Feedback ─────────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2, minWidth: 280 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

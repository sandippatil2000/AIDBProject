import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Send as SendIcon,
  Storage as StorageIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import { ConnectionAPI } from '../services/ConnactionAPI';
import { mockConnections } from '../services/data';
import type { Connection } from '../types/Connection';
import { AIAPI } from '../services/AIAPI';

// ─── Types ────────────────────────────────────────────────────────────────────
interface QueryResult {
  /** Raw string response returned by the AI (SQL query or plain-text answer). */
  rawResponse: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const ReportsPage = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedDb, setSelectedDb] = useState<string>('');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // ── Fetch connections ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await ConnectionAPI.getConnections();
        const data = Array.isArray(response) ? response : (response as any).data || [];
        setConnections(data && data.length > 0 ? data : mockConnections);
      } catch {
        setConnections(mockConnections);
      }
    };
    fetchConnections();
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleDbChange = (event: SelectChangeEvent<string>) => {
    setSelectedDb(event.target.value);
    // Reset results when DB selection changes
    setResult(null);
    setResultError(null);
    setHasSubmitted(false);
  };

  const handleSubmit = async () => {
    if (!selectedDb || !userPrompt.trim()) return;

    setIsLoading(true);
    setResult(null);
    setResultError(null);
    setHasSubmitted(true);

    try {
      const response = await AIAPI.generateSqlQuery({
        connectionName: selectedDb,
        userPrompt: userPrompt.trim(),
      });
      // apiClient returns the parsed JSON; the AI endpoint responds with a plain string
      const raw: string =
        typeof response === 'string'
          ? response
          : (response as any)?.data ?? JSON.stringify(response, null, 2);
      setResult({ rawResponse: raw });
    } catch (err: any) {
      setResultError(err?.message ?? 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = selectedDb !== '' && userPrompt.trim() !== '' && !isLoading;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '100%' }}>

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #1976d2 0%, #63a4ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(25,118,210,0.35)',
          }}
        >
          <BarChartIcon sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={500} color="text.primary" lineHeight={1.0}>
            Reports
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Run AI-powered queries against your databases and explore results.
          </Typography>
        </Box>
      </Box>

      {/* ── Top Input Panel ──────────────────────────────────────────────────── */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(248,250,252,0.8)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Panel heading */}
          {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
              Query Builder
            </Typography>
          </Box> */}

          {/* DB Name Dropdown — 3-column width */}
          <FormControl sx={{ mb: 2.5, width: '25%', minWidth: 220 }}>
            <InputLabel id="db-name-label">
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                DB Name
              </Box>
            </InputLabel>
            <Select
              labelId="db-name-label"
              id="db-name-select"
              value={selectedDb}
              size="small"
              label="DB Name"
              onChange={handleDbChange}
              displayEmpty
              sx={{ borderRadius: 2 }}
            >
              {connections.length === 0 && (
                <MenuItem disabled value="">
                  <em>No connections available</em>
                </MenuItem>
              )}
              {connections.map((conn) => (
                <MenuItem key={conn.id ?? conn.name} value={conn.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <StorageIcon sx={{ fontSize: 12, color: 'primary.main', opacity: 0.9 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={400}>
                        {conn.name}
                      </Typography>
                      {/* <Typography variant="caption" color="text.secondary">
                        {conn.name} · {conn.host}
                      </Typography> */}
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* User Prompt Text Field */}
          <TextField
            id="user-prompt"
            label="User Prompt"
            placeholder="Describe what data you want to retrieve or analyse…"
            multiline
            minRows={4}
            maxRows={10}
            size='small'
            fullWidth
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
            }}
            inputProps={{ 'aria-label': 'User Prompt' }}
          />

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              id="submit-report-btn"
              variant="contained"
              size="small"
              disabled={!canSubmit}
              onClick={handleSubmit}
              startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                boxShadow: canSubmit ? '0 4px 14px rgba(25,118,210,0.3)' : 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(25,118,210,0.4)',
                },
              }}
            >
              {isLoading ? 'Running…' : 'Submit'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ── Result Panel ─────────────────────────────────────────────────────── */}
      {hasSubmitted && (
        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Result Panel header */}
          <Box
            sx={{
              px: 3,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: 'divider',
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(248,250,252,0.8)',
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
              Results
            </Typography>
            {result && (
              <Chip
                label="AI Response"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600, borderRadius: 1.5 }}
              />
            )}
          </Box>

          <CardContent sx={{ p: 0 }}>
            {/* Loading state */}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress size={40} />
              </Box>
            )}

            {/* Error state */}
            {!isLoading && resultError && (
              <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {resultError}
                </Alert>
              </Box>
            )}

            {/* Empty state */}
            {!isLoading && !resultError && result && result.rawResponse.trim() === '' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 1 }}>
                <BarChartIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  No results found
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Try refining your prompt or selecting a different database.
                </Typography>
              </Box>
            )}

            {/* AI response — rendered as a monospace code block */}
            {!isLoading && !resultError && result && result.rawResponse.trim() !== '' && (
              <Box sx={{ p: 3 }}>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 2.5,
                    borderRadius: 2,
                    overflowX: 'auto',
                    fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
                    fontSize: '0.82rem',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(0,0,0,0.35)'
                        : 'rgba(240,244,255,0.8)',
                    border: '1px solid',
                    borderColor: 'divider',
                    color: 'text.primary',
                  }}
                >
                  {result.rawResponse}
                </Box>
                <Divider sx={{ mt: 2 }} />
                <Box sx={{ pt: 1.5 }}>
                  <Typography variant="caption" color="text.disabled">
                    AI-generated response{selectedDb ? ` for "${selectedDb}"` : ''}
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

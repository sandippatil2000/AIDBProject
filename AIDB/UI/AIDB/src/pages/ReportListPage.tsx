import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  AssessmentOutlined as ReportIcon,
  SmartToy as AIIcon,
} from '@mui/icons-material';
import { QueryReportAPI } from '../services/QueryReportAPI';
import type { QueryReport } from '../types/QueryReport';

const PAGE_SIZE = 20;

export const ReportListPage = () => {
  const [reports, setReports] = useState<QueryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);

  // ── Data Fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await QueryReportAPI.getQueryReports();
        const data = Array.isArray(response) ? response : (response as any).data ?? [];
        setReports(data);
      } catch (err) {
        console.error('Failed to fetch query reports:', err);
        setError('Failed to load reports. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredReports = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    if (!term) return reports;
    return reports.filter((r) =>
      (r.name ?? '').toLowerCase().includes(term)
    );
  }, [reports, searchText]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const paginatedReports = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredReports.slice(start, start + PAGE_SIZE);
  }, [filteredReports, page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setPage(0); // reset to first page on new search
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  return (
    <Box>
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1976d2, #63a4ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ReportIcon sx={{ color: '#fff', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Report List
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Browse and search all AI-generated query reports.
          </Typography>
        </Box>
      </Box>

      {/* ── Filter Panel ─────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          border: '1px solid #e2e8f0',
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <TextField
          id="report-search"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Search by report name…"
          size="small"
          sx={{ minWidth: 280, flex: '1 1 280px', maxWidth: 480 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {loading ? '' : `${filteredReports.length} result${filteredReports.length !== 1 ? 's' : ''}`}
        </Typography>
      </Paper>

      {/* ── Table Panel ──────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e2e8f0',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {/* Loading state */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Loading reports…
            </Typography>
          </Box>
        )}

        {/* Error state */}
        {!loading && error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          </Box>
        )}

        {/* Empty state */}
        {!loading && !error && filteredReports.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 1 }}>
            <ReportIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              No reports found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchText ? 'Try a different search term.' : 'No query reports have been created yet.'}
            </Typography>
          </Box>
        )}

        {/* Table */}
        {!loading && !error && filteredReports.length > 0 && (
          <>
            <TableContainer>
              <Table stickyHeader aria-label="query reports table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 60 }}>#</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>AI Service</TableCell>
                    <TableCell>AI Model</TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>Result Summary</TableCell>
                    <TableCell sx={{ maxWidth: 240 }}>SQL Query</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedReports.map((report, idx) => (
                    <TableRow
                      key={report.id ?? idx}
                      hover
                      sx={{ cursor: 'default', transition: 'background 0.15s' }}
                    >
                      {/* Row number */}
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {page * PAGE_SIZE + idx + 1}
                      </TableCell>

                      {/* Name */}
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="text.primary" noWrap>
                          {report.name ?? '—'}
                        </Typography>
                      </TableCell>

                      {/* AI Service */}
                      <TableCell>
                        {report.aiService ? (
                          <Chip
                            icon={<AIIcon sx={{ fontSize: '14px !important' }} />}
                            label={report.aiService}
                            size="small"
                            sx={{
                              bgcolor: '#e0f2fe',
                              color: '#0284c7',
                              fontWeight: 600,
                              fontSize: '0.72rem',
                            }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        )}
                      </TableCell>

                      {/* AI Model */}
                      <TableCell>
                        {report.aiModel ? (
                          <Chip
                            label={report.aiModel}
                            size="small"
                            sx={{
                              bgcolor: '#f0fdf4',
                              color: '#15803d',
                              fontWeight: 600,
                              fontSize: '0.72rem',
                            }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        )}
                      </TableCell>

                      {/* Result Summary */}
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Tooltip title={report.resultSummary ?? ''} placement="top" arrow>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 280,
                              display: 'block',
                            }}
                          >
                            {report.resultSummary ?? '—'}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      {/* SQL Query */}
                      <TableCell sx={{ maxWidth: 240 }}>
                        <Tooltip title={report.aisqlQuqey ?? ''} placement="top" arrow>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: '"Fira Code", "Consolas", monospace',
                              fontSize: '0.78rem',
                              color: '#6366f1',
                              bgcolor: '#f5f3ff',
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 220,
                              display: 'block',
                            }}
                          >
                            {report.aisqlQuqey ?? '—'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredReports.length}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={PAGE_SIZE}
              rowsPerPageOptions={[PAGE_SIZE]}
              sx={{ borderTop: '1px solid #e2e8f0' }}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

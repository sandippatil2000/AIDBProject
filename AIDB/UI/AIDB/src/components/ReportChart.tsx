import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Tabs,
  Tab,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  TableChart as TableChartIcon,
  AccountTree as AccountTreeIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  TuneOutlined as TuneOutlinedIcon,
} from '@mui/icons-material';
import DynamicChart from './DynamicChart';
import SchemaView from './SchemaView';
import type { JsonSchema } from '../types/Schema';
import type { ChartConfig } from '../types/ChartConfig';

// ─── Chart meta map ────────────────────────────────────────────────────────────
const CHART_META: Record<string, { icon: string; label: string }> = {
  bar:            { icon: '📊', label: 'Bar' },
  line:           { icon: '📈', label: 'Line' },
  area:           { icon: '🏔️', label: 'Area' },
  pie:            { icon: '🥧', label: 'Pie' },
  doughnut:       { icon: '🍩', label: 'Doughnut' },
  radar:          { icon: '🕸️', label: 'Radar' },
  polarArea:      { icon: '🎯', label: 'Polar' },
  bubble:         { icon: '🫧', label: 'Bubble' },
  scatter:        { icon: '✨', label: 'Scatter' },
  mixed:          { icon: '🎨', label: 'Mixed' },
  // ── New extended chart types ──────────────────────────────────────────────
  horizontalBar:  { icon: '↔️',  label: 'H-Bar' },
  stackedBar:     { icon: '🧱', label: 'Stacked' },
  comboBarLine:   { icon: '🔀', label: 'Combo' },
  multiAxisLine:  { icon: '📉', label: 'Multi-Axis' },
  lineDrawTime:   { icon: '🎞️', label: 'DrawTime' },
};

// ─── Props ─────────────────────────────────────────────────────────────────────
export interface ReportChartProps {
  /** Whether the chart recommendation AI/algorithm is currently running */
  chartIsAnalyzing: boolean;
  /** Error message from chart analysis, if any */
  chartError: string | null;
  /** Parsed data rows used for chart generation */
  chartParsed: Record<string, unknown>[] | null;
  /** Inferred JSON schema of the data */
  chartSchema: JsonSchema | null;
  /** All built chart configs (one per recommended chart type) */
  chartConfigs: ChartConfig[];
  /** Currently active tab (chart type key, 'table', or 'schema') */
  chartActiveTab: string;
  /** Callback to change the active tab */
  onTabChange: (tab: string) => void;
  /** Currently selected recommendation mode */
  chartRecommendationMode: 'algorithm' | 'ai';
  /** Callback to change the recommendation mode */
  onRecommendationModeChange: (mode: 'algorithm' | 'ai') => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────
const ReportChart: React.FC<ReportChartProps> = ({
  chartIsAnalyzing,
  chartError,
  chartParsed,
  chartSchema,
  chartConfigs,
  chartActiveTab,
  onTabChange,
  chartRecommendationMode,
  onRecommendationModeChange,
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      {/* ── Chart Panel Header ─────────────────────────────────────────────── */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(248,250,252,0.8)',
        }}
      >
        {/* Title + spinner */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 700 }}>
            Chart Visualisation
          </Typography>
          {chartIsAnalyzing && <CircularProgress size={16} />}
        </Box>

        {/* Chart Recommendation toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap', fontWeight: 700 }}
          >
            Chart Recommendation
          </Typography>
          <ToggleButtonGroup
            value={chartRecommendationMode}
            exclusive
            size="small"
            onChange={(_, val) => { if (val !== null) onRecommendationModeChange(val); }}
            sx={{
              '& .MuiToggleButton-root': {
                borderRadius: '8px !important',
                px: 1.5,
                py: 0.4,
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'none',
                gap: 0.6,
                border: '1px solid',
                borderColor: 'divider',
              },
              '& .MuiToggleButton-root.Mui-selected': {
                background: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(25,118,210,0.22) !important'
                    : 'rgba(25,118,210,0.12) !important',
                color: 'primary.main',
                borderColor: 'primary.main',
                fontWeight: 700,
              },
              '& .MuiToggleButtonGroup-grouped': {
                marginLeft: 0,
                borderLeft: '1px solid !important',
                borderLeftColor: 'divider !important',
              },
            }}
          >
            <ToggleButton value="algorithm" id="chart-mode-algorithm">
              <TuneOutlinedIcon sx={{ fontSize: 14 }} />
              Algorithm Chart
            </ToggleButton>
            <ToggleButton value="ai" id="chart-mode-ai">
              <AutoAwesomeIcon sx={{ fontSize: 14 }} />
              AI Chart
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* ── Chart Panel Body ───────────────────────────────────────────────── */}
      <CardContent sx={{ p: 0 }}>

        {/* Analysing state */}
        {chartIsAnalyzing && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <CircularProgress size={36} />
          </Box>
        )}

        {/* Chart error */}
        {!chartIsAnalyzing && chartError && (
          <Box sx={{ p: 3 }}>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              {chartError}
            </Alert>
          </Box>
        )}

        {/* No data yet */}
        {!chartIsAnalyzing && !chartError && chartConfigs.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 1 }}>
            <BarChartIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary">
              Submit a query to visualise the results as charts.
            </Typography>
          </Box>
        )}

        {/* ── Chart Results ── */}
        {!chartIsAnalyzing && !chartError && chartParsed && chartSchema && chartConfigs.length > 0 && (() => {
          const bestRec = chartConfigs[0]?.recommendation;
          const activeConfig = chartConfigs.find((c) => c.recommendation.chartType === chartActiveTab);
          return (
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, animation: 'fadeUp 0.4s ease' }}>

              {/* Summary banner */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.primary.light}55`,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}0d, ${theme.palette.primary.light}0a)`,
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start',
                }}
              >
                <Typography sx={{ filter: 'drop-shadow(0 0 6px rgba(25,118,210,0.4))', lineHeight: 1, fontSize: '2rem' }}>
                  {CHART_META[bestRec.chartType]?.icon ?? '📊'}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                    <Chip
                      label={`${chartConfigs.length} Chart${chartConfigs.length > 1 ? ' Types' : ' Type'} Supported`}
                      size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                    <Chip
                      label={chartSchema.domain}
                      size="small" color="info" variant="outlined" sx={{ fontSize: '0.7rem' }}
                    />
                    <Chip
                      label={`${chartSchema.rowCount} rows · ${chartSchema.fields.length} fields`}
                      size="small" variant="outlined" sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                  <Typography variant="subtitle2" color="text.primary" sx={{ mb: 0.5, fontWeight: 700 }}>
                    {bestRec.title}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {chartConfigs.map((c, i) => (
                      <Chip
                        key={c.recommendation.chartType}
                        label={`${CHART_META[c.recommendation.chartType]?.icon} ${CHART_META[c.recommendation.chartType]?.label}${i === 0 ? ' ★ Best' : ''}`}
                        size="small"
                        color={i === 0 ? 'primary' : 'default'}
                        variant={i === 0 ? 'filled' : 'outlined'}
                        sx={{ fontSize: '0.72rem', fontWeight: i === 0 ? 700 : 400 }}
                      />
                    ))}
                  </Box>
                </Box>
              </Paper>

              {/* Tabs */}
              <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Tabs
                    value={chartActiveTab}
                    onChange={(_, v: string) => { if (v !== 'divider') onTabChange(v); }}
                    variant="scrollable"
                    scrollButtons="auto"
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                      minHeight: 44,
                      '& .MuiTab-root': {
                        minHeight: 44,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 1.5,
                      },
                    }}
                  >
                    {chartConfigs.map((c, i) => {
                      const meta = CHART_META[c.recommendation.chartType];
                      return (
                        <Tooltip key={c.recommendation.chartType} title={c.recommendation.reasoning} arrow>
                          <Tab
                            value={c.recommendation.chartType}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <span style={{ fontSize: '1rem' }}>{meta?.icon}</span>
                                <span>{meta?.label}</span>
                                {i === 0 && (
                                  <Chip label="★ Best" size="small" color="warning" sx={{ height: 16, fontSize: '0.58rem', ml: 0.3 }} />
                                )}
                              </Box>
                            }
                          />
                        </Tooltip>
                      );
                    })}

                    {/* Divider Tab */}
                    <Tab
                      value="divider"
                      disabled
                      label={<Divider orientation="vertical" flexItem sx={{ height: 28, my: 'auto', mx: 0.5 }} />}
                      sx={{ minWidth: 'auto', p: 0, cursor: 'default' }}
                    />

                    {/* Data tabs */}
                    <Tab
                      value="table"
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TableChartIcon sx={{ fontSize: 15 }} />
                          <span>Table</span>
                        </Box>
                      }
                    />
                    <Tab
                      value="schema"
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccountTreeIcon sx={{ fontSize: 15 }} />
                          <span>Schema</span>
                        </Box>
                      }
                    />
                  </Tabs>
                </Box>

                {/* Tab Content */}
                <Box sx={{ p: 3, minHeight: 400 }}>

                  {/* Active chart tab */}
                  {activeConfig && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ pb: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography sx={{ fontSize: '1.1rem' }}>
                            {CHART_META[activeConfig.recommendation.chartType]?.icon}
                          </Typography>
                          <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 700 }}>
                            {activeConfig.recommendation.title}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                          <PsychologyIcon sx={{ fontSize: 14, color: 'primary.light', mt: 0.2, flexShrink: 0 }} />
                          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                            {activeConfig.recommendation.reasoning}
                          </Typography>
                        </Box>
                      </Box>
                      <Box key={activeConfig.recommendation.chartType} sx={{ width: '100%', height: 360, position: 'relative' }}>
                        <DynamicChart
                          chartType={activeConfig.recommendation.chartType}
                          chartData={activeConfig.chartData}
                          chartOptions={activeConfig.chartOptions}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Table tab */}
                  {chartActiveTab === 'table' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <TableChartIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
                          Data Table — {chartParsed.length} rows
                        </Typography>
                      </Box>
                      <Box sx={{ overflowX: 'auto' }}>
                        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                          <Box component="thead">
                            <Box component="tr">
                              {chartSchema.fields.map((f) => (
                                <Box
                                  component="th"
                                  key={f.key}
                                  sx={{
                                    px: 2, py: 1.5,
                                    textAlign: 'left',
                                    fontWeight: 700,
                                    color: 'primary.contrastText',
                                    fontSize: '0.78rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    whiteSpace: 'nowrap',
                                    bgcolor: 'primary.main',
                                    borderBottom: '2px solid',
                                    borderColor: 'primary.dark',
                                  }}
                                >
                                  {f.label}
                                </Box>
                              ))}
                            </Box>
                          </Box>
                          <Box component="tbody">
                            {chartParsed.map((row, idx) => (
                              <Box
                                component="tr"
                                key={idx}
                                sx={{
                                  bgcolor: idx % 2 === 0 ? 'background.paper' : (t) =>
                                    t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(25,118,210,0.03)',
                                  transition: 'background 0.15s',
                                  '&:hover': {
                                    background: (t) =>
                                      t.palette.mode === 'dark'
                                        ? 'rgba(255,255,255,0.05)'
                                        : 'rgba(25,118,210,0.06)',
                                  },
                                }}
                              >
                                {chartSchema.fields.map((f) => (
                                  <Box
                                    component="td"
                                    key={f.key}
                                    sx={{
                                      px: 2, py: 1.25,
                                      color: 'text.secondary',
                                      fontSize: '0.85rem',
                                      borderBottom: '1px solid',
                                      borderColor: 'divider',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {String(row[f.key] ?? '—')}
                                  </Box>
                                ))}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Schema tab */}
                  {chartActiveTab === 'schema' && (
                    <SchemaView
                      fields={chartSchema.fields}
                      rowCount={chartSchema.rowCount}
                      domain={chartSchema.domain}
                    />
                  )}
                </Box>
              </Paper>
            </Box>
          );
        })()}
      </CardContent>
    </Card>
  );
};

export default ReportChart;

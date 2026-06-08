import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Tabs,
  Tab,
  Chip,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Container,
  Divider,
  Tooltip,
  useTheme,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TableChartIcon from '@mui/icons-material/TableChart';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { inferSchema } from './utils/schemaInference';
import { recommendCharts } from './utils/chartRecommender';
import { buildChartConfig } from './utils/chartDataBuilder';
import DynamicChart from './components/DynamicChart';
import DataTable from './components/DataTable';
import SchemaView from './components/SchemaView';
import type { JsonSchema, ChartRecommendation } from './types/schema';
import type { ChartData, ChartOptions } from 'chart.js';

/* ─── Sample data ─────────────────────────────────────────────── */
const SAMPLES: Record<string, string> = {
  Sales: JSON.stringify(
    [
      { productName: 'Wireless Mouse',      salesDate: '2026-06-01', unitsSold: 45, revenue: 1120.50 },
      { productName: 'Mechanical Keyboard', salesDate: '2026-06-02', unitsSold: 28, revenue: 2239.72 },
      { productName: 'USB-C Hub',           salesDate: '2026-06-03', unitsSold: 60, revenue: 1799.40 },
      { productName: 'Monitor Stand',       salesDate: '2026-06-04', unitsSold: 18, revenue: 539.82  },
      { productName: 'Webcam 4K',           salesDate: '2026-06-05', unitsSold: 33, revenue: 2969.67 },
    ],
    null, 2,
  ),
  Energy: JSON.stringify(
    [
      { energySource: 'Solar',       readingTimestamp: '2026-06-01T12:00:00Z', megawattHours: 1450.5, gridCarbonIntensity: 0.0   },
      { energySource: 'Wind',        readingTimestamp: '2026-06-01T13:00:00Z', megawattHours: 2100.2, gridCarbonIntensity: 0.0   },
      { energySource: 'Natural Gas', readingTimestamp: '2026-06-01T14:00:00Z', megawattHours: 950.8,  gridCarbonIntensity: 490.3 },
      { energySource: 'Coal',        readingTimestamp: '2026-06-01T15:00:00Z', megawattHours: 620.4,  gridCarbonIntensity: 820.1 },
      { energySource: 'Hydro',       readingTimestamp: '2026-06-01T16:00:00Z', megawattHours: 1780.9, gridCarbonIntensity: 4.5   },
    ],
    null, 2,
  ),
  Education: JSON.stringify(
    [
      { subjectName: 'Advanced Mathematics', academicTerm: 'Fall 2026', totalEnrolled: 150, passingPercentage: 84.5 },
      { subjectName: 'Organic Chemistry',    academicTerm: 'Fall 2026', totalEnrolled: 120, passingPercentage: 72.1 },
      { subjectName: 'World History',        academicTerm: 'Fall 2026', totalEnrolled: 200, passingPercentage: 91.3 },
      { subjectName: 'Computer Science',     academicTerm: 'Fall 2026', totalEnrolled: 175, passingPercentage: 88.7 },
      { subjectName: 'Literature',           academicTerm: 'Fall 2026', totalEnrolled: 90,  passingPercentage: 78.4 },
    ],
    null, 2,
  ),
};

interface ChartConfig {
  recommendation: ChartRecommendation;
  chartData: ChartData;
  chartOptions: ChartOptions;
}

const CHART_META: Record<string, { icon: string; label: string }> = {
  bar:       { icon: '📊', label: 'Bar'      },
  line:      { icon: '📈', label: 'Line'     },
  area:      { icon: '🏔️', label: 'Area'    },
  pie:       { icon: '🥧', label: 'Pie'      },
  doughnut:  { icon: '🍩', label: 'Doughnut' },
  radar:     { icon: '🕸️', label: 'Radar'   },
  polarArea: { icon: '🎯', label: 'Polar'    },
  bubble:    { icon: '🫧', label: 'Bubble'   },
  scatter:   { icon: '✨', label: 'Scatter'  },
  mixed:     { icon: '🎨', label: 'Mixed'    },
};

type SpecialTab = 'table' | 'schema';

/* ─── App ─────────────────────────────────────────────────────── */
const App: React.FC = () => {
  const theme = useTheme();

  const [jsonInput,    setJsonInput]    = useState<string>(SAMPLES.Sales);
  const [activeTab,    setActiveTab]    = useState<string>('table');
  const [error,        setError]        = useState<string | null>(null);
  const [parsed,       setParsed]       = useState<Record<string, unknown>[] | null>(null);
  const [schema,       setSchema]       = useState<JsonSchema | null>(null);
  const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([]);
  const [isAnalyzing,  setIsAnalyzing]  = useState(false);

  const analyse = useCallback(() => {
    setError(null);
    setIsAnalyzing(true);
    setTimeout(() => {
      try {
        const data = JSON.parse(jsonInput) as Record<string, unknown>[];
        if (!Array.isArray(data) || data.length === 0)
          throw new Error('Input must be a non-empty JSON array of objects.');
        const inferredSchema = inferSchema(data);
        const recs = recommendCharts(inferredSchema);
        const configs: ChartConfig[] = recs.map((rec) => {
          const { chartData, chartOptions } = buildChartConfig(data, inferredSchema, rec);
          return { recommendation: rec, chartData, chartOptions };
        });
        setParsed(data);
        setSchema(inferredSchema);
        setChartConfigs(configs);
        setActiveTab(configs[0]?.recommendation.chartType ?? 'table');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid JSON');
      } finally {
        setIsAnalyzing(false);
      }
    }, 600);
  }, [jsonInput]);

  const loadSample = (name: string) => {
    setJsonInput(SAMPLES[name]);
    setParsed(null);
    setSchema(null);
    setChartConfigs([]);
    setError(null);
  };

  const activeConfig = chartConfigs.find((c) => c.recommendation.chartType === activeTab);
  const bestRec      = chartConfigs[0]?.recommendation;

  /* All chart tabs + data tabs combined for MUI Tabs */
  const allTabs: Array<{ value: string; label: string; icon: string | React.ReactNode; tooltip?: string }> = [
    ...chartConfigs.map((c, i) => ({
      value: c.recommendation.chartType,
      label: `${CHART_META[c.recommendation.chartType]?.icon ?? ''} ${CHART_META[c.recommendation.chartType]?.label ?? ''}${i === 0 ? ' ★' : ''}`,
      icon: '',
      tooltip: c.recommendation.reasoning,
    })),
    { value: 'divider', label: '', icon: '' },
    { value: 'table',  label: 'Table',  icon: <TableChartIcon sx={{ fontSize: 16 }} /> },
    { value: 'schema', label: 'Schema', icon: <AccountTreeIcon sx={{ fontSize: 16 }} /> },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* ── AppBar / Header ───────────────────────────────────── */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          borderBottom: `1px solid ${theme.palette.primary.dark}`,
        }}
      >
        <Toolbar sx={{ gap: 1.5, justifyContent: 'space-between', flexWrap: 'wrap', py: 1 }}>
          {/* Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', lineHeight: 1.1, letterSpacing: '-0.3px' }}>
                ChartAI
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem' }}>
                Smart Data Visualiser
              </Typography>
            </Box>
          </Box>

          {/* Tagline chip */}
          <Chip
            label="Paste JSON → AI infers schema → Renders all charts"
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 500,
              backdropFilter: 'blur(8px)',
              display: { xs: 'none', sm: 'flex' },
            }}
          />
        </Toolbar>
      </AppBar>

      {/* ── Main Content ──────────────────────────────────────── */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '440px 1fr' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          {/* ── Input Panel ──────────────────────────────────── */}
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              position: { lg: 'sticky' },
              top: { lg: 24 },
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {/* Panel Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                JSON Data Input
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Samples:
                </Typography>
                {Object.keys(SAMPLES).map((name) => (
                  <Chip
                    key={name}
                    label={name}
                    size="small"
                    clickable
                    variant="outlined"
                    onClick={() => loadSample(name)}
                    sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                  />
                ))}
              </Box>
            </Box>

            {/* JSON Textarea */}
            <Box sx={{ position: 'relative', mb: 2 }}>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                spellCheck={false}
                placeholder="Paste your JSON array here..."
                className="json-editor-mui"
              />
              <Chip
                label="JSON"
                size="small"
                color="primary"
                sx={{
                  position: 'absolute',
                  top: 10,
                  left: 8,
                  fontSize: '0.6rem',
                  height: 22,
                  fontFamily: "'JetBrains Mono', monospace",
                  writingMode: 'vertical-rl',
                  borderRadius: 1,
                  pointerEvents: 'none',
                }}
              />
            </Box>

            {/* Error */}
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Analyse Button */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={isAnalyzing}
              onClick={analyse}
              startIcon={isAnalyzing ? <CircularProgress size={18} color="inherit" /> : <PsychologyIcon />}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                fontSize: '0.95rem',
                py: 1.5,
                textTransform: 'none',
                background: isAnalyzing
                  ? undefined
                  : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 4px 16px ${theme.palette.primary.main}44`,
                '&:hover': {
                  boxShadow: `0 6px 24px ${theme.palette.primary.main}55`,
                },
              }}
            >
              {isAnalyzing ? 'Analysing…' : 'Analyse & Visualise'}
            </Button>
          </Paper>

          {/* ── Results Panel ─────────────────────────────────── */}
          {parsed && schema && chartConfigs.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, animation: 'fadeUp 0.4s ease' }}>
              {/* ── Summary Banner ─────────────────────────────── */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.primary.light}55`,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}0d, ${theme.palette.primary.light}0a)`,
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start',
                }}
              >
                <Typography fontSize="2.4rem" lineHeight={1} sx={{ filter: 'drop-shadow(0 0 8px rgba(25,118,210,0.4))' }}>
                  {CHART_META[bestRec.chartType]?.icon ?? '📊'}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                    <Chip
                      label={`${chartConfigs.length} Chart${chartConfigs.length > 1 ? ' Types' : ' Type'} Supported`}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                    <Chip
                      label={schema.domain}
                      size="small"
                      color="info"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                    <Chip
                      label={`${schema.rowCount} rows · ${schema.fields.length} fields`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ mb: 0.8 }}>
                    {bestRec.title}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
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

              {/* ── Tabs ───────────────────────────────────────── */}
              <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Tabs
                    value={activeTab}
                    onChange={(_, v: string) => { if (v !== 'divider') setActiveTab(v); }}
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
                    {/* Chart tabs — value is the chartType string */}
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

                    {/* Divider Tab (non-interactive) */}
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

                {/* ── Tab Content ──────────────────────────────── */}
                <Box sx={{ p: 3, minHeight: 460 }}>
                  {/* Active chart */}
                  {activeConfig && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ pb: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography fontSize="1.2rem">
                            {CHART_META[activeConfig.recommendation.chartType]?.icon}
                          </Typography>
                          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                            {activeConfig.recommendation.title}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                          <PsychologyIcon sx={{ fontSize: 14, color: 'primary.light', mt: 0.2, flexShrink: 0 }} />
                          <Typography variant="caption" color="text.secondary" lineHeight={1.5}>
                            {activeConfig.recommendation.reasoning}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ width: '100%', height: 380, position: 'relative' }}>
                        <DynamicChart
                          chartType={activeConfig.recommendation.chartType}
                          chartData={activeConfig.chartData}
                          chartOptions={activeConfig.chartOptions}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Table tab */}
                  {activeTab === 'table' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <TableChartIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                          Data Table — {parsed.length} rows
                        </Typography>
                      </Box>
                      <DataTable data={parsed} fields={schema.fields} />
                    </Box>
                  )}

                  {/* Schema tab */}
                  {activeTab === 'schema' && (
                    <SchemaView
                      fields={schema.fields}
                      rowCount={schema.rowCount}
                      domain={schema.domain}
                    />
                  )}
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      </Container>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        textarea.json-editor-mui {
          width: 100%;
          height: 240px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.82rem;
          line-height: 1.7;
          padding: 14px 14px 14px 48px;
          background-color: ${theme.palette.secondary.main};
          border: 1.5px solid ${theme.palette.divider};
          border-radius: 8px;
          color: ${theme.palette.text.primary};
          resize: vertical;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          display: block;
        }
        textarea.json-editor-mui:focus {
          border-color: ${theme.palette.primary.main};
          box-shadow: 0 0 0 3px ${theme.palette.primary.main}33;
        }
      `}</style>
    </Box>
  );
};

export default App;

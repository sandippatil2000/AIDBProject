import React, { useState, useCallback } from 'react';
import { Brain, Table2, AlertCircle, Sparkles, DatabaseZap, LayoutList } from 'lucide-react';
import { inferSchema } from './utils/schemaInference';
import { recommendCharts } from './utils/chartRecommender';
import { buildChartConfig } from './utils/chartDataBuilder';
import DynamicChart from './components/DynamicChart';
import DataTable from './components/DataTable';
import SchemaView from './components/SchemaView';
import type { JsonSchema, ChartRecommendation } from './types/schema';
import type { ChartData, ChartOptions } from 'chart.js';
import './App.css';

const SAMPLES: Record<string, string> = {
  Sales: JSON.stringify(
    [
      { productName: 'Wireless Mouse', salesDate: '2026-06-01', unitsSold: 45, revenue: 1120.50 },
      { productName: 'Mechanical Keyboard', salesDate: '2026-06-02', unitsSold: 28, revenue: 2239.72 },
      { productName: 'USB-C Hub', salesDate: '2026-06-03', unitsSold: 60, revenue: 1799.40 },
      { productName: 'Monitor Stand', salesDate: '2026-06-04', unitsSold: 18, revenue: 539.82 },
      { productName: 'Webcam 4K', salesDate: '2026-06-05', unitsSold: 33, revenue: 2969.67 },
    ],
    null, 2
  ),
  Energy: JSON.stringify(
    [
      { energySource: 'Solar', readingTimestamp: '2026-06-01T12:00:00Z', megawattHours: 1450.5, gridCarbonIntensity: 0.0 },
      { energySource: 'Wind', readingTimestamp: '2026-06-01T13:00:00Z', megawattHours: 2100.2, gridCarbonIntensity: 0.0 },
      { energySource: 'Natural Gas', readingTimestamp: '2026-06-01T14:00:00Z', megawattHours: 950.8, gridCarbonIntensity: 490.3 },
      { energySource: 'Coal', readingTimestamp: '2026-06-01T15:00:00Z', megawattHours: 620.4, gridCarbonIntensity: 820.1 },
      { energySource: 'Hydro', readingTimestamp: '2026-06-01T16:00:00Z', megawattHours: 1780.9, gridCarbonIntensity: 4.5 },
    ],
    null, 2
  ),
  Education: JSON.stringify(
    [
      { subjectName: 'Advanced Mathematics', academicTerm: 'Fall 2026', totalEnrolled: 150, passingPercentage: 84.5 },
      { subjectName: 'Organic Chemistry', academicTerm: 'Fall 2026', totalEnrolled: 120, passingPercentage: 72.1 },
      { subjectName: 'World History', academicTerm: 'Fall 2026', totalEnrolled: 200, passingPercentage: 91.3 },
      { subjectName: 'Computer Science', academicTerm: 'Fall 2026', totalEnrolled: 175, passingPercentage: 88.7 },
      { subjectName: 'Literature', academicTerm: 'Fall 2026', totalEnrolled: 90, passingPercentage: 78.4 },
    ],
    null, 2
  ),
};

interface ChartConfig {
  recommendation: ChartRecommendation;
  chartData: ChartData;
  chartOptions: ChartOptions;
}

const CHART_META: Record<string, { icon: string; label: string }> = {
  bar:       { icon: '📊', label: 'Bar' },
  line:      { icon: '📈', label: 'Line' },
  area:      { icon: '🏔️', label: 'Area' },
  pie:       { icon: '🥧', label: 'Pie' },
  doughnut:  { icon: '🍩', label: 'Doughnut' },
  radar:     { icon: '🕸️', label: 'Radar' },
  polarArea: { icon: '🎯', label: 'Polar' },
  bubble:    { icon: '🫧', label: 'Bubble' },
  scatter:   { icon: '✨', label: 'Scatter' },
  mixed:     { icon: '🎨', label: 'Mixed' },
};

type SpecialTab = 'table' | 'schema';

const App: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>(SAMPLES.Sales);
  const [activeTab, setActiveTab] = useState<string>('table'); // chartType string OR 'table'/'schema'
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<Record<string, unknown>[] | null>(null);
  const [schema, setSchema] = useState<JsonSchema | null>(null);
  const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyse = useCallback(() => {
    setError(null);
    setIsAnalyzing(true);

    setTimeout(() => {
      try {
        const data = JSON.parse(jsonInput) as Record<string, unknown>[];
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Input must be a non-empty JSON array of objects.');
        }
        const inferredSchema = inferSchema(data);
        const recs = recommendCharts(inferredSchema);

        const configs: ChartConfig[] = recs.map((rec) => {
          const { chartData, chartOptions } = buildChartConfig(data, inferredSchema, rec);
          return { recommendation: rec, chartData, chartOptions };
        });

        setParsed(data);
        setSchema(inferredSchema);
        setChartConfigs(configs);
        // Default to the first (best) chart tab
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
  const bestRec = chartConfigs[0]?.recommendation;

  return (
    <div className="app">
      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon"><Sparkles size={22} /></div>
          <span className="brand-name">ChartAI</span>
          <span className="brand-sub">Smart Data Visualiser</span>
        </div>
        <p className="header-tagline">Paste any JSON → AI infers schema → Renders all supported charts</p>
      </header>

      <main className="app-main">
        {/* ── Input Panel ──────────────────────────────────────────── */}
        <section className="input-panel glass-card">
          <div className="panel-header">
            <h2>JSON Data Input</h2>
            <div className="sample-buttons">
              <span className="samples-label">Samples:</span>
              {Object.keys(SAMPLES).map((name) => (
                <button key={name} className="btn-sample" onClick={() => loadSample(name)}>
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="editor-wrapper">
            <textarea
              className="json-editor"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              spellCheck={false}
              placeholder="Paste your JSON array here..."
            />
            <div className="editor-overlay">
              <span className="editor-hint">JSON</span>
            </div>
          </div>

          {error && (
            <div className="error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            className={`btn-analyse ${isAnalyzing ? 'loading' : ''}`}
            onClick={analyse}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <div className="spinner" />
                <span>Analysing...</span>
              </>
            ) : (
              <>
                <Brain size={18} />
                <span>Analyse &amp; Visualise</span>
              </>
            )}
          </button>
        </section>

        {/* ── Results Panel ─────────────────────────────────────────── */}
        {parsed && schema && chartConfigs.length > 0 && (
          <section className="results-panel">

            {/* ── Summary Banner ─────────────────────────────────────── */}
            <div className="rec-banner glass-card">
              <div className="rec-icon">{CHART_META[bestRec.chartType]?.icon ?? '📊'}</div>
              <div className="rec-content">
                <div className="rec-top">
                  <span className="rec-type">
                    {chartConfigs.length} Chart{chartConfigs.length > 1 ? ' Types' : ' Type'} Supported
                  </span>
                  <span className="rec-domain">{schema.domain}</span>
                  <span className="rec-rows">{schema.rowCount} rows · {schema.fields.length} fields</span>
                </div>
                <h3 className="rec-title">{bestRec.title}</h3>
                <div className="rec-badges">
                  {chartConfigs.map((c, i) => (
                    <span
                      key={c.recommendation.chartType}
                      className={`chart-badge ${i === 0 ? 'chart-badge--best' : ''}`}
                    >
                      {CHART_META[c.recommendation.chartType]?.icon}{' '}
                      {CHART_META[c.recommendation.chartType]?.label}
                      {i === 0 && <span className="badge-star">★ Best</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Tab Bar ─────────────────────────────────────────────── */}
            <div className="tabs-wrapper">
              {/* Chart type tabs */}
              <div className="tabs tabs--charts">
                <span className="tabs-section-label">Charts</span>
                {chartConfigs.map((c, i) => {
                  const meta = CHART_META[c.recommendation.chartType];
                  return (
                    <button
                      key={c.recommendation.chartType}
                      className={`tab-btn tab-btn--chart ${activeTab === c.recommendation.chartType ? 'active' : ''} ${i === 0 ? 'tab-btn--best' : ''}`}
                      onClick={() => setActiveTab(c.recommendation.chartType)}
                      title={c.recommendation.reasoning}
                    >
                      <span className="tab-icon">{meta?.icon}</span>
                      <span>{meta?.label}</span>
                      {i === 0 && <span className="tab-star">★</span>}
                    </button>
                  );
                })}
              </div>

              {/* Data tabs separator */}
              <div className="tabs-divider" />

              {/* Table / Schema tabs */}
              <div className="tabs tabs--data">
                <span className="tabs-section-label">Data</span>
                {(['table', 'schema'] as SpecialTab[]).map((tab) => {
                  const icons = { table: <Table2 size={14} />, schema: <DatabaseZap size={14} /> };
                  return (
                    <button
                      key={tab}
                      className={`tab-btn tab-btn--data ${activeTab === tab ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {icons[tab]}
                      <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Tab Content ─────────────────────────────────────────── */}
            <div className="tab-content glass-card">
              {/* Active chart tab */}
              {activeConfig && (
                <div className="chart-panel">
                  <div className="chart-panel-header">
                    <div className="chart-panel-title">
                      <span className="chart-panel-icon">{CHART_META[activeConfig.recommendation.chartType]?.icon}</span>
                      <span>{activeConfig.recommendation.title}</span>
                    </div>
                    <p className="chart-panel-reasoning">
                      <Brain size={12} />
                      {activeConfig.recommendation.reasoning}
                    </p>
                  </div>
                  <div className="chart-container">
                    <DynamicChart
                      chartType={activeConfig.recommendation.chartType}
                      chartData={activeConfig.chartData}
                      chartOptions={activeConfig.chartOptions}
                    />
                  </div>
                </div>
              )}
              {activeTab === 'table' && (
                <div className="data-panel">
                  <div className="data-panel-header">
                    <LayoutList size={16} />
                    <span>Data Table — {parsed.length} rows</span>
                  </div>
                  <DataTable data={parsed} fields={schema.fields} />
                </div>
              )}
              {activeTab === 'schema' && (
                <SchemaView
                  fields={schema.fields}
                  rowCount={schema.rowCount}
                  domain={schema.domain}
                />
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default App;

import React, { useState, useCallback } from 'react';
import { BarChart3, Brain, Table2, AlertCircle, Sparkles, ChevronDown } from 'lucide-react';
import { inferSchema } from './utils/schemaInference';
import { recommendChart } from './utils/chartRecommender';
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

type ActiveTab = 'table' | 'schema' | 'chart';

const App: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>(SAMPLES.Sales);
  const [activeTab, setActiveTab] = useState<ActiveTab>('table');
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<Record<string, unknown>[] | null>(null);
  const [schema, setSchema] = useState<JsonSchema | null>(null);
  const [recommendation, setRecommendation] = useState<ChartRecommendation | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartOptions, setChartOptions] = useState<ChartOptions | null>(null);
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
        const rec = recommendChart(inferredSchema);
        const { chartData: cd, chartOptions: co } = buildChartConfig(data, inferredSchema, rec);

        setParsed(data);
        setSchema(inferredSchema);
        setRecommendation(rec);
        setChartData(cd);
        setChartOptions(co);
        setActiveTab('chart');
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
    setRecommendation(null);
    setChartData(null);
    setError(null);
  };

  const chartTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      bar: '📊', line: '📈', area: '🏔️', pie: '🥧', doughnut: '🍩',
      radar: '🕸️', polarArea: '🎯', bubble: '🫧', scatter: '✨', mixed: '🎨',
    };
    return icons[type] ?? '📊';
  };

  return (
    <div className="app">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon"><Sparkles size={22} /></div>
          <span className="brand-name">ChartAI</span>
          <span className="brand-sub">Smart Data Visualiser</span>
        </div>
        <p className="header-tagline">Paste any JSON → Get instant AI-powered charts</p>
      </header>

      <main className="app-main">
        {/* ── Input Panel ───────────────────────────────────────── */}
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
                <span>Analyse & Visualise</span>
              </>
            )}
          </button>
        </section>

        {/* ── Results Panel ─────────────────────────────────────── */}
        {parsed && schema && recommendation && (
          <section className="results-panel">
            {/* Recommendation Banner */}
            <div className="rec-banner glass-card">
              <div className="rec-icon">{chartTypeIcon(recommendation.chartType)}</div>
              <div className="rec-content">
                <div className="rec-top">
                  <span className="rec-type">{recommendation.chartType.toUpperCase()} CHART</span>
                  <span className="rec-domain">{schema.domain}</span>
                </div>
                <h3 className="rec-title">{recommendation.title}</h3>
                <p className="rec-reasoning">
                  <Brain size={13} />
                  {recommendation.reasoning}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
              {(['chart', 'table', 'schema'] as ActiveTab[]).map((tab) => {
                const icons = { chart: <BarChart3 size={15} />, table: <Table2 size={15} />, schema: <ChevronDown size={15} /> };
                return (
                  <button
                    key={tab}
                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {icons[tab]}
                    <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="tab-content glass-card">
              {activeTab === 'chart' && chartData && chartOptions && (
                <div className="chart-container">
                  <DynamicChart
                    chartType={recommendation.chartType}
                    chartData={chartData}
                    chartOptions={chartOptions}
                  />
                </div>
              )}
              {activeTab === 'table' && (
                <DataTable data={parsed} fields={schema.fields} />
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

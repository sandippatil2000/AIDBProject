import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Storage as StorageIcon,
  People as PeopleIcon,
  QueryStats as QueryStatsIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useUser } from '../contexts/UserContext';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const StatCard = ({ title, value, subtitle, icon, color, trend }: StatCardProps) => (
  <Card
    elevation={0}
    sx={{
      border: '1px solid #e2e8f0',
      borderRadius: 3,
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: '0 8px 24px rgba(25,118,210,0.12)',
        transform: 'translateY(-2px)',
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} mb={0.5}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: `${color}15`, width: 48, height: 48, borderRadius: 2 }}>
          <Box sx={{ color }}>{icon}</Box>
        </Avatar>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {trend && (
          <Chip
            label={trend}
            size="small"
            icon={<TrendingUpIcon style={{ fontSize: 12 }} />}
            sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', height: 22, fontSize: 11, fontWeight: 600 }}
          />
        )}
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const stats: StatCardProps[] = [
  {
    title: 'Total Databases',
    value: '24',
    subtitle: 'Across all environments',
    icon: <StorageIcon />,
    color: '#1976d2',
    trend: '+12%',
  },
  {
    title: 'Active Users',
    value: '1,248',
    subtitle: 'Connected this month',
    icon: <PeopleIcon />,
    color: '#7c3aed',
    trend: '+8%',
  },
  {
    title: 'Queries Today',
    value: '38,541',
    subtitle: 'Avg response: 42ms',
    icon: <QueryStatsIcon />,
    color: '#0891b2',
    trend: '+23%',
  },
  {
    title: 'Uptime',
    value: '99.98%',
    subtitle: 'Last 30 days',
    icon: <TrendingUpIcon />,
    color: '#059669',
  },
];

const recentActivity = [
  { db: 'prod-main', action: 'Schema migration completed', time: '2 min ago', status: 'success' },
  { db: 'analytics-db', action: 'Backup job started', time: '15 min ago', status: 'success' },
  { db: 'dev-staging', action: 'High memory usage detected', time: '32 min ago', status: 'warning' },
  { db: 'prod-replica', action: 'Replication lag spike', time: '1 hr ago', status: 'warning' },
  { db: 'archive-db', action: 'Index rebuild completed', time: '3 hr ago', status: 'success' },
];

export const DashboardPage = () => {
  const { user } = useUser();

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Welcome back, {user?.name ?? 'User'} 👋 Here's what's happening today.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} mb={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} lg={3} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Activity Feed */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}
          >
            <Typography variant="h6" fontWeight={600} mb={2}>
              Recent Activity
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {recentActivity.map((item, idx) => (
                <Box key={idx}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                    {item.status === 'success' ? (
                      <CheckCircleIcon sx={{ color: '#059669', fontSize: 20, flexShrink: 0 }} />
                    ) : (
                      <WarningIcon sx={{ color: '#d97706', fontSize: 20, flexShrink: 0 }} />
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} color="text.primary" noWrap>
                        {item.db}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {item.action}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {item.time}
                    </Typography>
                  </Box>
                  {idx < recentActivity.length - 1 && <Divider />}
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}
          >
            <Typography variant="h6" fontWeight={600} mb={2.5}>
              System Health
            </Typography>
            {[
              { label: 'CPU Usage', value: 42, color: '#1976d2' },
              { label: 'Memory Usage', value: 67, color: '#7c3aed' },
              { label: 'Disk Usage', value: 53, color: '#0891b2' },
              { label: 'Network I/O', value: 28, color: '#059669' },
            ].map((metric) => (
              <Box key={metric.label} mb={2.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={500} color="text.primary">
                    {metric.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    {metric.value}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={metric.value}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#f1f5f9',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: metric.color,
                    },
                  }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

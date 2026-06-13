import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Standard vibrant Material Design blue
      light: '#63a4ff',
      dark: '#004ba0',
      contrastText: '#ffffff', // White text for primary buttons/bars
    },
    secondary: {
      main: '#e3f2fd', // Soft, light blue for backgrounds/accents
      light: '#ffffff',
      dark: '#b1bfca',
      contrastText: '#1976d2', // Blue text for secondary components
    },
    background: {
      default: '#ffffff', // Clean white for the main app background
      paper: '#f8fafc', // Slightly off-white/gray for cards and paper elements
    },
    text: {
      primary: '#1E293B', // Dark navy/black for excellent readability
      secondary: '#64748B', // Muted gray for subtext
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 4,
          '&.Mui-selected': {
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            '&:hover': {
              backgroundColor: '#bbdefb',
            },
          },
          '&:hover': {
            backgroundColor: '#f0f7ff',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#1976d2',       // primary.main
            color: '#ffffff',                  // primary.contrastText
            fontWeight: 700,
            fontSize: '0.78rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
            borderBottom: '2px solid #004ba0', // primary.dark
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root:nth-of-type(even)': {
            backgroundColor: '#f0f7ff',        // light primary tint
          },
          '& .MuiTableRow-root:hover': {
            backgroundColor: '#e3f2fd !important', // secondary.main on hover
          },
          '& .MuiTableCell-body': {
            color: '#1E293B',                  // text.primary
            fontSize: '0.875rem',
            borderColor: '#e2e8f0',
            whiteSpace: 'nowrap',
          },
        },
      },
    },
  },
});

export default theme;

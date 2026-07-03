import { createTheme } from '@mui/material/styles';

// ─── Extra-Small (XS) size scale constants ────────────────────────────────────
// Change these values here and EVERY MUI component will pick them up.
const XS = {
  fontSize: {
    xs: '0.72rem',   // tiny labels / helper text
    sm: '0.78rem',   // body / table cells
    md: '0.82rem',   // base UI text
    lg: '0.88rem',   // headings h5-h6
    xl: '0.93rem',   // headings h3-h4
    xxl: '1.00rem',   // headings h1-h2
  },
  spacing: 6,         // MUI theme.spacing(1) === 6px  (default is 8px)
  borderRadius: 5,         // global border-radius for most controls
  iconSize: '1.1rem',  // icon font-size
  inputHeight: 32,        // px – compact text-field / select height
  buttonPy: '3px',     // button top/bottom padding
  buttonPx: '12px',    // button left/right padding
  tableCell: '5px 10px', // table cell padding
};

const theme = createTheme({
  // ── Spacing ────────────────────────────────────────────────────────────────
  spacing: XS.spacing,

  // ── Palette (unchanged from original) ──────────────────────────────────────
  palette: {
    primary: {
      main: '#1976d2',
      light: '#63a4ff',
      dark: '#004ba0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e3f2fd',
      light: '#ffffff',
      dark: '#b1bfca',
      contrastText: '#1976d2',
    },
    background: {
      default: '#ffffff',
      paper: '#f8fafc',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
  },

  // ── Typography – all sizes scaled down to XS ────────────────────────────────
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 11,        // base rem root (11 instead of 14)
    htmlFontSize: 14,    // keeps rem calculations sensible

    h1: { fontSize: XS.fontSize.xxl, fontWeight: 700, lineHeight: 1.3 },
    h2: { fontSize: XS.fontSize.xxl, fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: XS.fontSize.xl, fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: XS.fontSize.xl, fontWeight: 600, lineHeight: 1.3 },
    h5: { fontSize: XS.fontSize.lg, fontWeight: 600, lineHeight: 1.3 },
    h6: { fontSize: XS.fontSize.lg, fontWeight: 600, lineHeight: 1.3 },
    subtitle1: { fontSize: XS.fontSize.md, lineHeight: 1.4 },
    subtitle2: { fontSize: XS.fontSize.sm, lineHeight: 1.4 },
    body1: { fontSize: XS.fontSize.md, lineHeight: 1.5 },
    body2: { fontSize: XS.fontSize.sm, lineHeight: 1.5 },
    caption: { fontSize: XS.fontSize.xs, lineHeight: 1.4 },
    overline: { fontSize: XS.fontSize.xs, lineHeight: 1.4 },
    button: { fontSize: XS.fontSize.sm, fontWeight: 600, textTransform: 'none' },
  },

  // ── Component overrides ─────────────────────────────────────────────────────
  components: {
    // ── Button ──────────────────────────────────────────────────────────────
    MuiButton: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          borderRadius: XS.borderRadius,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: XS.fontSize.sm,
          padding: `${XS.buttonPy} ${XS.buttonPx}`,
          minHeight: XS.inputHeight,
        },
        sizeSmall: {
          padding: '1px 8px',
          fontSize: XS.fontSize.xs,
          minHeight: 24,
        },
        sizeLarge: {
          padding: '4px 14px',
          fontSize: XS.fontSize.md,
          minHeight: 32,
        },
      },
    },

    // ── IconButton ───────────────────────────────────────────────────────────
    MuiIconButton: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: { padding: 4 },
        sizeSmall: { padding: 2 },
      },
    },

    // ── SvgIcon ─────────────────────────────────────────────────────────────
    MuiSvgIcon: {
      defaultProps: { fontSize: 'small' },
      styleOverrides: {
        fontSizeSmall: { fontSize: XS.iconSize },
        fontSizeMedium: { fontSize: '1.1rem' },
        fontSizeLarge: { fontSize: '1.25rem' },
      },
    },

    // ── TextField / OutlinedInput / Input ───────────────────────────────────
    MuiTextField: {
      defaultProps: { size: 'small', margin: 'dense' },
    },
    MuiOutlinedInput: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: { fontSize: XS.fontSize.sm, borderRadius: XS.borderRadius },
        input: {
          padding: '4px 8px',
          fontSize: XS.fontSize.sm,
          height: 'auto',
        },
        multiline: { padding: '4px 8px' },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: { fontSize: XS.fontSize.sm },
        input: { fontSize: XS.fontSize.sm, padding: '4px 8px' },
        sizeSmall: { fontSize: XS.fontSize.xs },
      },
    },
    MuiInputLabel: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: { fontSize: XS.fontSize.sm },
        sizeSmall: { fontSize: XS.fontSize.xs },
        shrink: { fontSize: XS.fontSize.md },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { fontSize: XS.fontSize.xs, marginTop: 1 },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: { fontSize: XS.fontSize.sm },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: { fontSize: XS.fontSize.sm },
        root: { marginLeft: 0 },
      },
    },

    // ── Select ───────────────────────────────────────────────────────────────
    MuiSelect: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        select: { fontSize: XS.fontSize.sm, padding: '4px 8px' },
        icon: { fontSize: '1rem' },
      },
    },
    MuiNativeSelect: {
      styleOverrides: {
        select: { fontSize: XS.fontSize.sm, padding: '4px 8px' },
        icon: { fontSize: '1rem' },
      },
    },

    // ── Autocomplete ─────────────────────────────────────────────────────────
    MuiAutocomplete: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        input: { fontSize: XS.fontSize.sm },
        option: { fontSize: XS.fontSize.sm, minHeight: 28 },
        paper: { fontSize: XS.fontSize.sm },
        tag: { height: 18, fontSize: XS.fontSize.xs },
      },
    },

    // ── Checkbox / Radio / Switch ─────────────────────────────────────────────
    MuiCheckbox: {
      defaultProps: { size: 'small' },
      styleOverrides: { root: { padding: 2 } },
    },
    MuiRadio: {
      defaultProps: { size: 'small' },
      styleOverrides: { root: { padding: 2 } },
    },
    MuiSwitch: {
      defaultProps: { size: 'small' },
    },

    // ── Chip ─────────────────────────────────────────────────────────────────
    MuiChip: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: { fontSize: XS.fontSize.xs, height: 20 },
        label: { padding: '0 6px' },
        icon: { fontSize: '0.85rem' },
        deleteIcon: { fontSize: '0.85rem' },
      },
    },

    // ── Badge ────────────────────────────────────────────────────────────────
    MuiBadge: {
      styleOverrides: {
        badge: { fontSize: XS.fontSize.xs, height: 14, minWidth: 14, padding: '0 3px' },
      },
    },

    // ── Avatar ───────────────────────────────────────────────────────────────
    MuiAvatar: {
      styleOverrides: {
        root: { width: 24, height: 24, fontSize: XS.fontSize.sm },
      },
    },

    // ── Tooltip ──────────────────────────────────────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: XS.fontSize.xs, padding: '3px 7px' },
      },
    },

    // ── Paper ────────────────────────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)' },
      },
    },

    // ── Card ─────────────────────────────────────────────────────────────────
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: XS.borderRadius },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '8px 10px',
          '&:last-child': { paddingBottom: 8 },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: { padding: '6px 10px' },
        title: { fontSize: XS.fontSize.md, fontWeight: 600 },
        subheader: { fontSize: XS.fontSize.xs },
        avatar: { marginRight: 6 },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: { padding: '4px 8px' },
      },
    },

    // ── Table ────────────────────────────────────────────────────────────────
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#1976d2',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: XS.fontSize.xs,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
            borderBottom: '2px solid #004ba0',
            padding: XS.tableCell,
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root:nth-of-type(even)': {
            backgroundColor: '#f0f7ff',
          },
          '& .MuiTableRow-root:hover': {
            backgroundColor: '#e3f2fd !important',
          },
          '& .MuiTableCell-body': {
            color: '#1E293B',
            fontSize: XS.fontSize.sm,
            borderColor: '#e2e8f0',
            whiteSpace: 'nowrap',
            padding: XS.tableCell,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: XS.tableCell,
          fontSize: XS.fontSize.sm,
        },
        sizeSmall: {
          padding: '2px 6px',
          fontSize: XS.fontSize.xs,
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: { fontSize: XS.fontSize.xs, overflow: 'hidden' },
        select: { fontSize: XS.fontSize.xs },
        selectLabel: { fontSize: XS.fontSize.xs },
        displayedRows: { fontSize: XS.fontSize.xs },
        toolbar: { minHeight: 36, paddingLeft: 8 },
        actions: { marginLeft: 4 },
      },
    },

    // ── Drawer ───────────────────────────────────────────────────────────────
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
        },
      },
    },

    // ── List / ListItem ──────────────────────────────────────────────────────
    MuiList: {
      defaultProps: { dense: true },
      styleOverrides: {
        root: { padding: '2px 0' },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: { padding: '1px 8px' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: XS.borderRadius,
          marginBottom: 2,
          padding: '3px 8px',
          '&.Mui-selected': {
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            '&:hover': { backgroundColor: '#bbdefb' },
          },
          '&:hover': { backgroundColor: '#f0f7ff' },
        },
        dense: { padding: '2px 6px' },
      },
    },
    MuiListItemText: {
      defaultProps: { primaryTypographyProps: { variant: 'body2' } },
      styleOverrides: {
        root: { margin: '1px 0' },
        primary: { fontSize: XS.fontSize.sm },
        secondary: { fontSize: XS.fontSize.xs },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: { minWidth: 28, '& .MuiSvgIcon-root': { fontSize: XS.iconSize } },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: { fontSize: XS.fontSize.xs, lineHeight: '24px', padding: '0 8px' },
      },
    },

    // ── Menu / MenuItem ──────────────────────────────────────────────────────
    MuiMenu: {
      styleOverrides: {
        paper: { borderRadius: XS.borderRadius },
        list: { padding: '2px 0' },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: XS.fontSize.sm,
          padding: '3px 12px',
          minHeight: 28,
          '&.Mui-selected': { backgroundColor: '#e3f2fd' },
        },
        dense: { fontSize: XS.fontSize.xs, minHeight: 22 },
      },
    },

    // ── Tabs ─────────────────────────────────────────────────────────────────
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: XS.fontSize.sm,
          minHeight: 36,
          padding: '4px 12px',
          textTransform: 'none',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 36 },
        indicator: { height: 2 },
      },
    },

    // ── Dialog ───────────────────────────────────────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: XS.borderRadius },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontSize: XS.fontSize.lg, fontWeight: 600, padding: '8px 14px' },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: { padding: '8px 14px', fontSize: XS.fontSize.sm },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: { padding: '6px 14px', gap: 6 },
      },
    },
    MuiDialogContentText: {
      styleOverrides: {
        root: { fontSize: XS.fontSize.sm },
      },
    },

    // ── Alert / Snackbar ─────────────────────────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: { fontSize: XS.fontSize.sm, padding: '4px 10px' },
        icon: { fontSize: '1rem', padding: '3px 0' },
      },
    },
    MuiAlertTitle: {
      styleOverrides: {
        root: { fontSize: XS.fontSize.md, fontWeight: 600 },
      },
    },

    // ── Accordion ────────────────────────────────────────────────────────────
    MuiAccordion: {
      styleOverrides: {
        root: { '&:before': { display: 'none' } },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: { minHeight: 36, padding: '0 10px' },
        content: { margin: '6px 0', '& .MuiTypography-root': { fontSize: XS.fontSize.sm } },
        expandIconWrapper: { '& .MuiSvgIcon-root': { fontSize: XS.iconSize } },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: { padding: '6px 10px 8px' },
      },
    },

    // ── Breadcrumbs ──────────────────────────────────────────────────────────
    MuiBreadcrumbs: {
      styleOverrides: {
        root: { fontSize: XS.fontSize.xs },
        separator: { fontSize: XS.fontSize.xs },
        ol: { flexWrap: 'nowrap' },
      },
    },

    // ── Divider ──────────────────────────────────────────────────────────────
    MuiDivider: {
      styleOverrides: {
        root: { margin: '4px 0' },
      },
    },

    // ── Toolbar / AppBar ──────────────────────────────────────────────────────
    MuiToolbar: {
      styleOverrides: {
        root: { minHeight: '40px !important', padding: '0 8px' },
        dense: { minHeight: '32px !important' },
      },
    },

    // ── Slider ───────────────────────────────────────────────────────────────
    MuiSlider: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        markLabel: { fontSize: XS.fontSize.xs },
        valueLabel: { fontSize: XS.fontSize.xs },
      },
    },

    // ── Stepper ──────────────────────────────────────────────────────────────
    MuiStepLabel: {
      styleOverrides: {
        label: { fontSize: XS.fontSize.sm },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: { fontSize: '1rem' },
        text: { fontSize: '0.6rem' },
      },
    },

    // ── Typography ───────────────────────────────────────────────────────────
    MuiTypography: {
      styleOverrides: {
        gutterBottom: { marginBottom: '0.3em' },
      },
    },

    // ── Pagination ───────────────────────────────────────────────────────────
    MuiPaginationItem: {
      styleOverrides: {
        root: { fontSize: XS.fontSize.xs, minWidth: 22, height: 22 },
      },
    },
  },
});

export default theme;

import { Accordion, AccordionSummary, AccordionDetails, Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AccordionTabProps {
  label: string;
  expanded: boolean;
  onChange: () => void;
  children: ReactNode;
  icon?: ReactNode;
  expandIcon?: ReactNode;
  value: string;
}

export const AccordionTab = ({
  label,
  expanded,
  onChange,
  children,
  icon,
  expandIcon,
  value,
}: AccordionTabProps) => (
  <Accordion
    expanded={expanded}
    onChange={onChange}
    sx={{
      boxShadow: 'none',
      width: '100%',
      '&::before': {
        display: 'none',
      },
      '&:hover svg': {
        color: '#3F41D6',
      },
    }}
  >
    <AccordionSummary
      expandIcon={expandIcon}
      component={Link}
      to={`/${value}`} // Переход по ссылке
      sx={{
        pl: '16px',
        minHeight: 36,
        margin: 0,
        '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
          transform: 'rotate(90deg)',
        },
        '& .MuiAccordionSummary-content': {
          margin: 0,
          alignItems: 'center',
        },
        '& .MuiAccordionSummary-content.Mui-expanded': {
          margin: 0,
        },
        '&.Mui-expanded': {
          minHeight: 36,
        },
      }}
    >
      {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
      <Typography
        sx={{
          fontSize: '14px',
          fontFamily: '"Roboto", sans-serif',
          fontWeight: 500,
          alignItems: 'center',
          '&:hover': {
            color: '#3F41D6',
          },
        }}
      >
        {label}
      </Typography>
    </AccordionSummary>
    <AccordionDetails
      sx={{
        pl: 0,
      }}
    >
      {children}
    </AccordionDetails>
  </Accordion>
);

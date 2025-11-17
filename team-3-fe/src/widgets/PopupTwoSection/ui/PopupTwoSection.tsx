import { useState } from 'react';
import { Dialog, DialogContent, Box, useMediaQuery } from '@mui/material';
import { PDFViewer } from '@/features/PDFVIewer';
import { DocumentSection } from '@/widgets/DocumentSection';
import { useDocumentsGridStore } from '@/entities/DataGridDocuments';

export const PopupTwoSection = () => {
  const { openPdf, setOpenPdf } = useDocumentsGridStore();
  const isSmall = useMediaQuery('(max-width:1350px)');
  const isMobile = useMediaQuery('(max-width:600px)');
  const [showRight, setShowRight] = useState(false); // управляет отображением DocumentSection

  return (
    <Dialog
      open={openPdf}
      onClose={() => {
        setOpenPdf(false);
        setShowRight(false);
      }}
      fullWidth
      maxWidth={isSmall ? 'sm' : 'lg'}
      fullScreen={isMobile}
      PaperProps={{
        sx: isMobile ? { borderRadius: 0, padding: !showRight ? '0 !important' : '24px' } : {},
      }}
    >
      <DialogContent
        sx={{
          display: 'flex',
          gap: 3,
          height: '80vh',
          position: 'relative',
          flexDirection: isSmall ? 'column' : 'row',
          margin: '0 !important',
          borderRadius: 0,
        }}
      >
        {/* ===== PDF область ===== */}
        {!isSmall || !showRight ? (
          <Box
            sx={{
              flex: 2,
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'auto',
              backgroundColor: '#121212',
              borderRadius: '0px',
              width: isSmall ? '100%' : '50%',
            }}
          >
            <PDFViewer setShowRight={setShowRight} isSmall={isSmall} />
          </Box>
        ) : null}

        {/* ===== Правая колонка с характеристиками ===== */}
        {!isSmall || showRight ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              overflowY: 'auto',
              flex: 1,
              width: isSmall ? '100%' : 'auto',
              position: 'relative',
            }}
          >
            <DocumentSection setShowRight={setShowRight} isSmall={isSmall} />
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

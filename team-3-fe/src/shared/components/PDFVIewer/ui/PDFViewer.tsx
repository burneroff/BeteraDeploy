import * as React from 'react';
import { Button, Typography, Box, IconButton, Tooltip } from '@mui/material';
import { Document, Page } from 'react-pdf';
import { MinusIcon } from '@/shared/icons/MinusIcon.tsx';
import { PlusIcon } from '@/shared/icons/PlusIcon.tsx';
import { ArrowLeftIcon } from '@/shared/icons/ArrowLeftIcon.tsx';
import { ArrowRightIcon } from '@/shared/icons/ArrowRightIcon.tsx';

/**
 * Премиум PDF Viewer с масштабированием колесиком, drag-перемещением и фиксированным меню.
 */
interface PDFViewerProps {
  pdfUrl: string | undefined;
  document_name: string | undefined;
}

export const PDFViewer = ({ pdfUrl, document_name }: PDFViewerProps) => {
  const [numPages, setNumPages] = React.useState<number>(0);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [scale, setScale] = React.useState(1.0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [startDrag, setStartDrag] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setPageNumber(1);
    setScale(1.0);
    setOffset({ x: 0, y: 0 });
  }, [pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleNextPage = () => {
    if (pageNumber < numPages) setPageNumber(pageNumber + 1);
  };

  const handlePrevPage = () => {
    if (pageNumber > 1) setPageNumber(pageNumber - 1);
  };

  const handleZoomIn = () => setScale((prev) => Math.min(3.0, prev + 0.2));
  const handleZoomOut = () => setScale((prev) => Math.max(0.5, prev - 0.2));

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${document_name || 'document'}.pdf`;
      link.click();
    }
  };

  /** --- Drag (перемещение PDF мышкой) --- **/
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartDrag({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - startDrag.x,
      y: e.clientY - startDrag.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  /** --- Масштабирование колесиком --- **/
  const handleWheel = (e: React.WheelEvent) => {
    // Игнорировать "pinch-to-zoom" от тачпада/браузера
    if (e.ctrlKey) return;

    // предотвращаем стандартный скролл страницы
    e.preventDefault();

    // Добавим небольшой "порог чувствительности"
    if (Math.abs(e.deltaY) < 5) return;

    const zoomSpeed = 0.2;
    const delta = e.deltaY < 0 ? zoomSpeed : -zoomSpeed; // вверх — увеличить, вниз — уменьшить

    setScale((prev) => {
      const newScale = Math.min(3.0, Math.max(0.5, prev + delta));
      return Number(newScale.toFixed(2));
    });
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: 'var(--bg-surface-3)',
      }}
    >
      {/* Контейнер для PDF с drag + zoom */}
      <Box
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        sx={{
          width: '100%',
          height: '100%',
          cursor: isDragging ? 'grabbing' : 'grab',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.05s linear',
            pointerEvents: 'none', // чтобы мышь не мешала drag'у
          }}
        >
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<Typography color="white">Загрузка PDF...</Typography>}
          >
            <Page
              pageNumber={pageNumber}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              scale={scale}
            />
          </Document>
        </Box>
      </Box>

      {/* Фиксированное меню управления */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 60,
          left: '30%',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'var(--bg-dark)',
          borderRadius: '16px',
          p: 1,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 1000,
        }}
      >
        {/* Навигация */}
        <IconButton onClick={handlePrevPage} disabled={pageNumber <= 1} sx={buttonStyle}>
          <ArrowLeftIcon color={'#5E5FDB'} />
        </IconButton>
        <Typography color={'#FAFBFF'}>
          {pageNumber} / {numPages}
        </Typography>
        <IconButton onClick={handleNextPage} disabled={pageNumber >= numPages} sx={buttonStyle}>
          <ArrowRightIcon color={'#5E5FDB'} />
        </IconButton>

        {/* Масштаб */}
        <Tooltip title="Уменьшить масштаб">
          <IconButton onClick={handleZoomOut} disabled={scale <= 0.5} sx={buttonStyle}>
            <MinusIcon color={'#5E5FDB'} />
          </IconButton>
        </Tooltip>
        <Typography color={'#FAFBFF'}>{Math.round(scale * 100)}%</Typography>
        <Tooltip title="Увеличить масштаб">
          <IconButton onClick={handleZoomIn} disabled={scale >= 3.0} sx={buttonStyle}>
            <PlusIcon color={'#5E5FDB'} />
          </IconButton>
        </Tooltip>

        {/* Скачать */}
        <Button
          onClick={handleDownload}
          variant="outlined"
          sx={{
            backgroundColor: '#E8E8FF',
            borderRadius: '12px',
            color: '#1C1C1C',
            '&:hover': {
              backgroundColor: '#D0D0FF',
            },
          }}
        >
          Скачать
        </Button>
      </Box>
    </Box>
  );
};

// Универсальный стиль кнопок
const buttonStyle = {
  width: '38px',
  height: '38px',
  backgroundColor: '#E8E8FF',
  borderRadius: '12px',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: '#D0D0FF',
  },
};

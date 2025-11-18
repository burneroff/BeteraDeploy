import * as React from 'react';
import { Typography, Box, IconButton, Tooltip } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import { MinusIcon } from '@/shared/icons/MinusIcon.tsx';
import { PlusIcon } from '@/shared/icons/PlusIcon.tsx';
import { ArrowLeftIcon } from '@/shared/icons/ArrowLeftIcon.tsx';
import { ArrowRightIcon } from '@/shared/icons/ArrowRightIcon.tsx';
import { useDocumentsGridStore } from '@/entities/DataGridDocuments';
import { type Dispatch, type SetStateAction } from 'react';
import CloseIcon from '@/shared/icons/CloseIcon.tsx';
import BackMenuIcon from '@/shared/icons/BackMenuIcon.tsx';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  setShowRight: Dispatch<SetStateAction<boolean>>;
  isSmall: boolean;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ setShowRight, isSmall }) => {
  const [numPages, setNumPages] = React.useState<number>(0);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [scale, setScale] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [pageSize, setPageSize] = React.useState({ width: 0, height: 0 });
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const touchState = React.useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    isPinching: false,
    pinchStartDistance: 0,
    pinchStartScale: 1,
  });

  const { selectedRow, setOpenPdf } = useDocumentsGridStore();

  React.useEffect(() => {
    setPageNumber(1);
    setScale(isSmall ? 0.5 : 0.8);
    setOffset({ x: 0, y: 0 });
  }, [selectedRow?.pdf_path, isSmall]);

  React.useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'ArrowRight') handleNextPage();
      if (ev.key === 'ArrowLeft') handlePrevPage();
      if (ev.key === '+' || ev.key === '=') handleZoomIn();
      if (ev.key === '-') handleZoomOut();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [numPages]);

  /** --- Вспомогательные функции --- **/
  const distanceBetweenTouches = (t1: React.Touch, t2: React.Touch) =>
    Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

  const clampOffset = React.useCallback(
    (newOffset: { x: number; y: number }) => {
      const container = containerRef.current;
      if (!container || !pageSize.width || !pageSize.height) return newOffset;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const pdfWidth = pageSize.width * scale;
      const pdfHeight = pageSize.height * scale;

      // запас для "вытягивания" PDF за края
      const dragPadding = 100;

      // вычисляем допустимые пределы
      const maxX = Math.max(0, (pdfWidth - containerWidth) / 2 + dragPadding);
      const maxY = Math.max(0, (pdfHeight - containerHeight) / 2 + dragPadding * 2);

      return {
        x: Math.min(maxX, Math.max(-maxX, newOffset.x)),
        y: Math.min(maxY, Math.max(-maxY, newOffset.y)),
      };
    },
    [pageSize, scale],
  );

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onPageRenderSuccess = (page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setPageSize({ width: viewport.width, height: viewport.height });
  };

  const handleNextPage = () => setPageNumber((p) => Math.min(numPages, p + 1));
  const handlePrevPage = () => setPageNumber((p) => Math.max(1, p - 1));

  const handleZoomIn = () => {
    setScale((prev) => {
      const newScale = Math.min(3.0, prev + 0.2);
      setOffset((prevOffset) => clampOffset(prevOffset));
      return newScale;
    });
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const newScale = Math.max(0.5, prev - 0.2);
      setOffset((prevOffset) => clampOffset(prevOffset));
      return newScale;
    });
  };

  /** --- Drag мышкой --- **/
  const handleMouseDown = (e: React.MouseEvent) => {
    touchState.current.dragging = true;
    touchState.current.startX = e.clientX;
    touchState.current.startY = e.clientY;
    touchState.current.startOffsetX = offset.x;
    touchState.current.startOffsetY = offset.y;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!touchState.current.dragging) return;
    const rawOffset = {
      x: touchState.current.startOffsetX + (e.clientX - touchState.current.startX),
      y: touchState.current.startOffsetY + (e.clientY - touchState.current.startY),
    };
    setOffset(clampOffset(rawOffset));
  };

  const handleMouseUp = () => (touchState.current.dragging = false);

  /** --- Масштабирование колесиком --- **/
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) return;
    e.preventDefault();
    if (Math.abs(e.deltaY) < 5) return;

    const zoomSpeed = 0.2;
    const delta = e.deltaY < 0 ? zoomSpeed : -zoomSpeed;

    setScale((prev) => {
      const newScale = Math.min(3.0, Math.max(0.5, prev + delta));
      setOffset((prevOffset) => clampOffset(prevOffset));
      return Number(newScale.toFixed(2));
    });
  };

  /** --- Touch события (drag + pinch) --- **/
  const onTouchStart: React.TouchEventHandler = (e) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchState.current.dragging = true;
      touchState.current.isPinching = false;
      touchState.current.startX = t.clientX;
      touchState.current.startY = t.clientY;
      touchState.current.startOffsetX = offset.x;
      touchState.current.startOffsetY = offset.y;
    } else if (e.touches.length === 2) {
      const d = distanceBetweenTouches(e.touches[0], e.touches[1]);
      touchState.current.isPinching = true;
      touchState.current.pinchStartDistance = d;
      touchState.current.pinchStartScale = scale;
    }
  };

  const onTouchMove: React.TouchEventHandler = (e) => {
    if (e.touches.length === 1 && touchState.current.dragging && !touchState.current.isPinching) {
      const t = e.touches[0];
      const rawOffset = {
        x: touchState.current.startOffsetX + (t.clientX - touchState.current.startX),
        y: touchState.current.startOffsetY + (t.clientY - touchState.current.startY),
      };
      setOffset(clampOffset(rawOffset));
    } else if (e.touches.length === 2 && touchState.current.isPinching) {
      const d = distanceBetweenTouches(e.touches[0], e.touches[1]);
      const ratio = d / touchState.current.pinchStartDistance;
      const newScale = Number(
        Math.min(3.0, Math.max(0.5, touchState.current.pinchStartScale * ratio)).toFixed(2),
      );
      setScale(newScale);
      setOffset((prevOffset) => clampOffset(prevOffset));
    }
  };

  const onTouchEnd: React.TouchEventHandler = (e) => {
    if (e.touches.length === 0) {
      touchState.current.dragging = false;
      touchState.current.isPinching = false;
    }
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
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        sx={{
          width: '100%',
          height: '100%',
          cursor: touchState.current.dragging ? 'grabbing' : 'grab',
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
            transition: touchState.current.dragging ? 'none' : 'transform 0.05s linear',
          }}
        >
          <Document
            file={selectedRow?.pdf_path?.replace(/\\u0026/g, '&')}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<Typography color="white">Загрузка PDF...</Typography>}
          >
            <Page
              pageNumber={pageNumber}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              scale={scale}
              onRenderSuccess={onPageRenderSuccess}
            />
          </Document>
        </Box>
      </Box>

      {/* Фиксированное меню управления */}
      <Box
        sx={{
          position: 'fixed',
          top: '90%',
          left: isSmall ? '50%' : '40%',
          transform: 'translate(-50%, -50%)',
          width: 'fit-content',
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
        <IconButton onClick={handlePrevPage} disabled={pageNumber <= 1} sx={buttonStyle}>
          <ArrowLeftIcon color={'var(--primary-100)'} />
        </IconButton>
        <Typography color={'var(--tertiary-default)'} sx={{ width: '40px' }}>
          {pageNumber} / {numPages}
        </Typography>
        <IconButton onClick={handleNextPage} disabled={pageNumber >= numPages} sx={buttonStyle}>
          <ArrowRightIcon color={'var(--primary-100)'} />
        </IconButton>

        <Tooltip title="Уменьшить масштаб">
          <IconButton onClick={handleZoomOut} disabled={scale <= 0.5} sx={buttonStyle}>
            <MinusIcon color={'var(--primary-100)'} />
          </IconButton>
        </Tooltip>
        <Typography color={'var(--tertiary-default)'}>{Math.round(scale * 100)}%</Typography>
        <Tooltip title="Увеличить масштаб">
          <IconButton onClick={handleZoomIn} disabled={scale >= 3.0} sx={buttonStyle}>
            <PlusIcon color={'var(--primary-100)'} />
          </IconButton>
        </Tooltip>

        {isSmall && (
          <IconButton
            onClick={() => setShowRight(true)}
            sx={{
              backgroundColor: '#E8E8FF',
              borderRadius: '12px',
              color: '#1C1C1C',
              '&:hover': { backgroundColor: '#D0D0FF' },
            }}
          >
            <BackMenuIcon width={22} height={22} color={'var(--primary-100)'} />
          </IconButton>
        )}
        {isSmall && (
          <IconButton
            onClick={() => {
              setOpenPdf(false);
              setShowRight(true);
            }}
            sx={{
              backgroundColor: '#E8E8FF',
              borderRadius: '12px',
              color: '#1C1C1C',
              '&:hover': { backgroundColor: '#D0D0FF' },
            }}
          >
            <CloseIcon width={22} height={22} color={'var(--primary-100)'} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

const buttonStyle = {
  width: '38px',
  height: '38px',
  backgroundColor: '#E8E8FF',
  borderRadius: '12px',
  transition: 'background-color 0.2s ease',
  '&:hover': { backgroundColor: '#D0D0FF' },
};

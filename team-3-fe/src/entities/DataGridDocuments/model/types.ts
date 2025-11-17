import type { GridRowSelectionModel } from '@mui/x-data-grid';
import type { DocumentEntity } from '@/shared/api/documents';

export type PartialDocumentsRowData = Omit<DocumentEntity, 'id'>;

export interface DocumentsGridState {
  rows: DocumentEntity[];
  filteredRows: DocumentEntity[];
  isLoading: boolean;
  error: string | null;

  // фильтрация / поиск
  searchQuery: string;
  activeCategoryId: number | null;
  setSearchQuery: (query: string) => void;
  setActiveCategoryId: (categoryId: number | null) => void;
  filterRows: () => void;

  // данные
  addDocument: (newDocument: PartialDocumentsRowData) => void;
  deleteDocument: (id: number) => void;
  fetchDocuments: () => Promise<void>;
  setRows: (rows: DocumentEntity[]) => void;

  // лайки
  like: () => void;
  unLike: () => void;

  //views
  view: () => void;

  // комментарии
  addComm: () => void;
  deleteComm: () => void;
  // UI
  popupOpen: boolean;
  setPopupOpen: (open: boolean) => void;

  openPdf: boolean;
  setOpenPdf: (open: boolean) => void;

  selectedRow: DocumentEntity | null;
  setSelectedRow: (row: DocumentEntity | null) => void;

  rowSelectionModel: GridRowSelectionModel;
  setRowSelectionModel: (newModel: GridRowSelectionModel) => void;
}

import { create } from 'zustand';
import { getDocuments } from '@/shared/api/documents/getDocuments';
import { notify } from '@/app/providers/NotificationProvider/notificationService';
import type {
  DocumentsGridState,
  PartialDocumentsRowData,
} from '@/entities/DataGridDocuments/model/types.ts';
import type { DocumentEntity } from '@/shared/api/documents';

export const useDocumentsGridStore = create<DocumentsGridState>((set, get) => ({
  rows: [],
  filteredRows: [],
  isLoading: false,
  error: null,

  // -------------------- фильтрация --------------------
  searchQuery: '',
  activeCategoryId: null,

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().filterRows();
  },

  setActiveCategoryId: (categoryId) => {
    set({ activeCategoryId: categoryId });
    get().filterRows();
  },

  addDocument: (newDocument: PartialDocumentsRowData) =>
    set((state) => {
      const newRow: DocumentEntity = {
        ...newDocument,
        id: state.rows.length ? Math.max(...state.rows.map((r) => r.id)) + 1 : 1,
      } as DocumentEntity;

      const newRows = [...state.rows, newRow];

      return {
        rows: newRows,
        filteredRows: newRows.filter((row) =>
          Object.values(row).some(
            (val) =>
              typeof val === 'string' &&
              val.toLowerCase().includes(state.searchQuery.toLowerCase()),
          ),
        ),
      };
    }),

  deleteDocument: (id) =>
    set((state) => ({
      rows: state.rows.filter((row) => row.id !== id),
      filteredRows: state.filteredRows.filter((row) => row.id !== id),
    })),

  filterRows: () => {
    const { rows, searchQuery, activeCategoryId } = get();
    const query = searchQuery.trim().toLowerCase();
    if (!Array.isArray(rows)) {
      console.warn('[useDocumentsGridStore] rows is not iterable:', rows);
      set({ filteredRows: [] });
      return;
    }

    let filtered = [...rows];

    if (activeCategoryId !== null && activeCategoryId !== 1) {
      filtered = filtered.filter((r) => r.category.id === activeCategoryId);
    }

    if (query) {
      filtered = filtered.filter((r) => r.title.toLowerCase().includes(query));
    }

    set({ filteredRows: filtered });
  },

  // -------------------- загрузка --------------------
  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const docs = await getDocuments();
      set({
        rows: docs,
        filteredRows: docs,
        isLoading: false,
      });
    } catch (err: any) {
      console.error('Ошибка загрузки документов:', err);
      set({
        error: err?.message ?? 'Ошибка загрузки документов',
        isLoading: false,
      });
      notify({ message: 'Ошибка при загрузке документов', severity: 'error' });
    }
  },

  setRows: (rows) => set({ rows, filteredRows: rows }),

  // -------------------- лайки --------------------
  like: () => {
    const { selectedRow, rows } = get();
    if (!selectedRow) return;

    const updated = {
      ...selectedRow,
      likes_count: (selectedRow.likes_count ?? 0) + 1,
      is_liked: true,
    };

    set({
      selectedRow: updated,
      rows: rows.map((r) => (r.id === selectedRow.id ? updated : r)),
      filteredRows: get().filteredRows.map((r) => (r.id === selectedRow.id ? updated : r)),
    });
  },

  unLike: () => {
    const { selectedRow, rows } = get();
    if (!selectedRow) return;

    const updated = {
      ...selectedRow,
      likes_count: Math.max((selectedRow.likes_count ?? 0) - 1, 0),
      is_liked: false,
    };

    set({
      selectedRow: updated,
      rows: rows.map((r) => (r.id === selectedRow.id ? updated : r)),
      filteredRows: get().filteredRows.map((r) => (r.id === selectedRow.id ? updated : r)),
    });
  },

  view: () => {
    const { selectedRow, rows } = get();
    if (!selectedRow) return;

    const updated = {
      ...selectedRow,
      is_viewed: true,
    };

    set({
      selectedRow: updated,
      rows: rows.map((r) => (r.id === selectedRow.id ? updated : r)),
      filteredRows: get().filteredRows.map((r) => (r.id === selectedRow.id ? updated : r)),
    });
  },

  //Комментарии
  addComm: () => {
    const { selectedRow, rows } = get();
    if (!selectedRow) return;

    const updated = {
      ...selectedRow,
      comments_count: (selectedRow.comments_count ?? 0) + 1,
    };

    set({
      selectedRow: updated,
      rows: rows.map((r) => (r.id === selectedRow.id ? updated : r)),
      filteredRows: get().filteredRows.map((r) => (r.id === selectedRow.id ? updated : r)),
    });
  },

  deleteComm: () => {
    const { selectedRow, rows } = get();
    if (!selectedRow) return;

    const updated = {
      ...selectedRow,
      comments_count: Math.max((selectedRow.comments_count ?? 0) - 1, 0),
    };

    set({
      selectedRow: updated,
      rows: rows.map((r) => (r.id === selectedRow.id ? updated : r)),
      filteredRows: get().filteredRows.map((r) => (r.id === selectedRow.id ? updated : r)),
    });
  },
  // -------------------- UI --------------------
  popupOpen: false,
  setPopupOpen: (open) => set({ popupOpen: open }),

  openPdf: false,
  setOpenPdf: (open) => set({ openPdf: open }),

  selectedRow: null,
  setSelectedRow: (row) => set({ selectedRow: row }),

  rowSelectionModel: { type: 'include', ids: new Set<number>() },
  setRowSelectionModel: (newModel) => set({ rowSelectionModel: newModel }),
}));

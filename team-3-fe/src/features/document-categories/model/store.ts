import { create } from 'zustand';
import { type DocumentCategory, getDocumentCategories } from '@/shared/api/documentCategory';

interface CategoriesState {
  categories: DocumentCategory[];
  selectedCategory: DocumentCategory;
  getCategoryById: (id: number) => DocumentCategory | null; // <-- новый метод
  setCategories: (categories: DocumentCategory[]) => void;
  setSelectedCategory: (category: DocumentCategory) => void;
  addCategory: (newCategory: { id?: number; name: string }) => void;
  deleteCategory: (categoryId: number) => void;
  fetchCategories: () => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  selectedCategory: { id: 1, name: 'Все документы' },

  getCategoryById: (id: number) => get().categories.find((c) => c.id === id) || null,

  setCategories: (categories) =>
    set({
      categories: [{ id: 1, name: 'Все документы' }, ...categories],
    }),

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  addCategory: (newCategory) =>
    set((state) => {
      // Проверяем дубликаты по id или имени (если id еще не назначен)
      const exists = state.categories.some(
        (c) => c.id === newCategory.id || c.name === newCategory.name,
      );
      if (exists) return state;

      // Генерируем id, если не передан (например, при локальном добавлении)
      const maxId = state.categories.reduce((max, c) => (c.id > max ? c.id : max), 0);
      const categoryWithId = { ...newCategory, id: newCategory.id ?? maxId + 1 };

      return { categories: [...state.categories, categoryWithId] };
    }),

  deleteCategory: (categoryId) =>
    set((state) => {
      const filtered = state.categories.filter((c) => c.id !== categoryId);
      const selected =
        state.selectedCategory.id === categoryId
          ? { id: 1, name: 'Все документы' }
          : state.selectedCategory;

      return { categories: filtered, selectedCategory: selected };
    }),

  fetchCategories: async () => {
    try {
      const categories = await getDocumentCategories(); // возвращает DocumentCategory[]
      set({
        categories: [
          { id: 1, name: 'Все документы' },
          ...categories.filter((category) => category.id != 1),
        ],
      });
    } catch (error) {
      set({
        categories: [{ id: 1, name: 'Все документы' }],
      });
      console.error('Ошибка при загрузке категорий:', error);
    }
  },
}));

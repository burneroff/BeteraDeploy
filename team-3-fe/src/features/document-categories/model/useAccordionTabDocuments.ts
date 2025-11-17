import { useState, useMemo, useCallback } from 'react';

export type Category = string;

const DEFAULT_CATEGORIES: Category[] = ['Benefits', 'OKP'];
export const ALL_CATEGORIES = 'Все категории';

export const useAccordionTabDocuments = () => {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const trimmedInput = inputValue.trim();

  const addCategory = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (trimmed && trimmed !== ALL_CATEGORIES && !categories.includes(trimmed)) {
        setCategories((prev) => [...prev, trimmed]);
      }
    },
    [categories],
  );

  // const removeCategory = useCallback((name: string) => {
  //   const trimmed = name.trim();
  //   if (categories.includes(trimmed)) {
  //     setCategories((prev) => prev.filter((cat) => cat !== trimmed));
  //   }
  // }, [categories]);

  const displayCategories = useMemo(() => [ALL_CATEGORIES, ...categories], [categories]);

  const resetInput = useCallback(() => setInputValue(''), []);

  const handleConfirmAdd = () => {
    if (trimmedInput && !categories.includes(trimmedInput)) {
      addCategory(trimmedInput);
      setIsEditing(false);
      resetInput();
    }
  };

  const handleConfirmDelete = () => {
    setIsEditing(false);
    resetInput();
  };

  return {
    categories: displayCategories,
    inputValue,
    setInputValue,
    resetInput,
    isEditing,
    setIsEditing,
    handleConfirmAdd,
    handleConfirmDelete,
  };
};

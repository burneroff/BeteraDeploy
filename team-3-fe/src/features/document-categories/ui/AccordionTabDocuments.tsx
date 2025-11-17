import { useState, useEffect } from 'react';
import { Box, Fade, List, ListItemButton, Tooltip } from '@mui/material';
import { PlusIcon } from '@/shared/icons/PlusIcon';
import DeleteIcon from '@/shared/icons/DeleteIcon';
import { AccordionTab } from '@/shared/components/AccordionTab/ui/AccordionTab';
import { DocumentArrowIcon } from '@/shared/icons/DocumentArrowIcon';
import { StyledButton } from '@/shared/components/StyledButton';
import { StyledIconButton } from '@/shared/components/StyledIconButton/StyledIconButton';
import theme from '@/app/theme/theme';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '@mui/material/TextField';
import {
  type CategoryFormData,
  categorySchema,
} from '@/features/document-categories/model/schema.ts';
import { useCategoriesStore } from '@/features/document-categories/model/store.ts';
import { useDocumentsGridStore } from '@/entities/DataGridDocuments';
import { useAddCategory } from '@/shared/queries/useAddCategory.ts';
import AdminStaff from '@/features/admin-staff/AdminStaff.tsx';
import { ALL_DOCS } from '@/shared/queries/useDocumentCategories';

export const AccordionTabDocuments = ({
  expanded,
  onChange,
  active,
  icon,
  value,
}: {
  expanded: boolean;
  onChange: () => void;
  active?: boolean;
  icon?: React.ReactNode;
  expandedIcon?: React.ReactNode;
  value: string;
}) => {
  const { addCategory, selectedCategory, setSelectedCategory, categories } = useCategoriesStore();
  const { setActiveCategoryId } = useDocumentsGridStore();
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: createCategory, isPending } = useAddCategory();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (active) {
      setActiveCategoryId(ALL_DOCS.id);
    }
  }, [active, setActiveCategoryId]);

  const handleAdd = handleSubmit((data: CategoryFormData) => {
    createCategory(
      {
        name: data.name,
      },
      {
        onSuccess: () => {
          addCategory({
            name: data.name,
          });
          reset();
          setIsEditing(false);
        },
      },
    );
  });

  const handleDelete = () => {
    setIsEditing(false);
    reset();
  };

  const handleTabClick = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;
    setSelectedCategory(category);
    setActiveCategoryId(category.id);
  };

  return (
    <Box
      sx={{
        '& .MuiAccordionSummary-content': {
          color: active ? 'var(--primary-300)' : 'var(--text-dark)',
        },
        '& .MuiAccordionSummary-content:hover': { color: 'var(--primary-300)' },
        '& svg': {
          color: active ? 'var(--primary-300)' : '#221E1C',
        },
      }}
    >
      <AccordionTab
        label="Документы"
        expanded={expanded}
        onChange={onChange}
        icon={icon}
        value={value}
        expandIcon={<DocumentArrowIcon />}
      >
        <List sx={{ pt: 0, pb: 0 }}>
          {categories.map((cat) => (
            <ListItemButton
              disableRipple
              key={cat.id}
              sx={{
                ...theme.custom.categoryListItem,
                backgroundColor: 'transparent',
                '&:hover': { backgroundColor: 'transparent' },
                ...(selectedCategory.id === cat.id && { color: '#3F41D6' }),
              }}
              onClick={() => handleTabClick(cat.id)}
            >
              {cat.name}
            </ListItemButton>
          ))}
        </List>

        {/* --- Блок добавления категории --- */}
        <AdminStaff>
          <Fade in={!isEditing} timeout={300}>
            <Box>
              {!isEditing && (
                <StyledButton
                  onClick={() => setIsEditing(true)}
                  startIcon={<PlusIcon />}
                  variantStyle="custom"
                  text="Добавить категорию"
                />
              )}
            </Box>
          </Fade>
        </AdminStaff>

        <Fade in={isEditing} timeout={300}>
          <Box>
            {isEditing && (
              <Box>
                <Box sx={theme.custom.categoryBox}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Категория"
                        variant="outlined"
                        size="small"
                        fullWidth
                        error={!!errors.name}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s{2,}/g, ' ');
                          field.onChange(value);
                        }}
                      />
                    )}
                  />

                  <Tooltip title="Удалить категорию">
                    <StyledIconButton variant="delete" onClick={handleDelete} disabled={isPending}>
                      <DeleteIcon />
                    </StyledIconButton>
                  </Tooltip>

                  <Tooltip title="Добавить категорию">
                    <StyledIconButton
                      variant="add"
                      onClick={handleAdd}
                      disabled={!isValid || isPending}
                    >
                      <PlusIcon />
                    </StyledIconButton>
                  </Tooltip>
                </Box>
                {errors.name && (
                  <Box
                    sx={{
                      color: 'var(--status-error-dark)',
                      fontSize: '0.75rem',
                      mt: '4px',
                      ml: '30px',
                    }}
                  >
                    {errors.name.message}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Fade>
      </AccordionTab>
    </Box>
  );
};

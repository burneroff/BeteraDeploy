import { StyledButton } from '@/shared/components/StyledButton';
import { ConfirmDeleteModal } from '@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal.tsx';
import { useDocumentsGridStore } from '@/entities/DataGridDocuments';
import { useState } from 'react';
import { useDeleteDocument } from '@/shared/queries/document/useDeleteDocument';
 

const DeleteDocumentButton = () => {
  const rowSelectionModel = useDocumentsGridStore((state) => state.rowSelectionModel);
  const { deleteDocument } = useDocumentsGridStore();
  const { mutate: apiDeleteDocument, isPending } = useDeleteDocument();
  const [popupOpen, setPopupOpen] = useState(false);
  const handleDeleteRows = () => {
    for (const checkedRow of rowSelectionModel.ids) {
      apiDeleteDocument(Number(checkedRow), {
        onSuccess: () => {
          deleteDocument(Number(checkedRow));
        },
      });
    }
    setPopupOpen(false);
  };
  return (
    <div>
      <StyledButton
        fullWidth
        sx={{ height: '36px', minWidth: '155px' }}
        text={isPending ? 'Удаляем...' : 'Удалить документ'}
        variantStyle="delete"
        disabled={rowSelectionModel.ids.size == 0}
        onClick={() => {
          setPopupOpen(true);
        }}
      />
      <ConfirmDeleteModal
        text={'Подтвердить удаление?'}
        deleteText={'Отмена'}
        confirmText={'Удалить'}
        open={popupOpen}
        onClose={() => {
          setPopupOpen(false);
        }}
        onConfirm={handleDeleteRows}
      />
    </div>
  );
};

export default DeleteDocumentButton;

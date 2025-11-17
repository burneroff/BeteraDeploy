import { StyledButton } from '@/shared/components/StyledButton';
import { ConfirmDeleteModal } from '@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal.tsx';
import { useState } from 'react';
import { useAdminGridStore } from '@/entities/DataGridAdmin';
import { useDeleteUser } from '@/shared/queries/user/useDeleteUser';

const DeleteUserButton = () => {
  const rowSelectionModel = useAdminGridStore((state) => state.rowSelectionModel);
  const { deleteUser } = useAdminGridStore();
  const { mutateAsync: deleteUserApi, isPending } = useDeleteUser();

  const [popupOpen, setPopupOpen] = useState(false);
  const handleDeleteRows = async () => {
    for (const checkedRow of rowSelectionModel.ids) {
      await deleteUserApi(
        { id: Number(checkedRow) },
        {
          onSuccess: () => {
            deleteUser(Number(checkedRow));
            setPopupOpen(false);
          },
        },
      );
    }
  };
  return (
    <div>
      <StyledButton
        fullWidth
        sx={{ height: '36px', minWidth: '155px' }}
        text="Удалить пользователя"
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
        isPending={isPending}
        onConfirm={handleDeleteRows}
      />
    </div>
  );
};

export default DeleteUserButton;

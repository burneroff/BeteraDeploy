import { useMarkViewed } from '@/shared/queries/useMarkViewed.ts';
import { StyledButton } from '@/shared/components/StyledButton';
import ApproveIcon from '@/shared/icons/ApproveIcon.tsx';
import { useDocumentsGridStore } from '@/entities/DataGridDocuments';

export const DocumentViewButton = () => {
  const { selectedRow, view } = useDocumentsGridStore();
  const { mutate, isPending } = useMarkViewed();

  const handleClick = () => {
    if (!selectedRow?.id) return;
    mutate(selectedRow.id, {
      onSuccess: () => {
        view(); // вызываем при успешном ознакомлении
      },
    });
  };

  return (
    <StyledButton
      variantStyle="outlined"
      text={isPending ? 'Стараемся...' : 'Ознакомиться'}
      endIcon={<ApproveIcon color={selectedRow?.is_viewed ? '#3F41D666' : '#221E1C'} />}
      onClick={handleClick}
      disabled={selectedRow?.is_viewed || isPending}
      sx={{ maxWidth: '157px' }}
    />
  );
};

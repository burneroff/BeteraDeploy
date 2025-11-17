import { Checkbox } from '@mui/material';
import { LikeIcon } from '@/shared/icons/LikeIcon';
import { FilledLikeIcon } from '@/shared/icons/FilledLikeIcon';
import { useLikeDocument } from '@/shared/queries/useLikeDocument';
import { useState } from 'react';
import { useUnLikeDocument } from '@/shared/queries/useUnlikeDocument.ts';
import { useDocumentsGridStore } from '@/entities/DataGridDocuments';

export const LikeButton = () => {
  const { selectedRow } = useDocumentsGridStore();
  const [liked, setLiked] = useState(selectedRow?.is_liked);
  const { mutate: likeDocument, isPending: isLiking } = useLikeDocument();
  const { mutate: dislikeDocument, isPending: isDisliking } = useUnLikeDocument();
  const { like, unLike } = useDocumentsGridStore();

  const handleToggleLike = () => {
    if (liked) {
      // уже лайкнуто — снимаем лайк
      dislikeDocument(selectedRow?.id!, {
        onSuccess: () => {
          (setLiked(false), unLike());
        },
      });
    } else {
      // не лайкнуто — ставим лайк
      likeDocument(selectedRow?.id!, {
        onSuccess: () => {
          (setLiked(true), like());
        },
      });
    }
  };

  return (
    <Checkbox
      checked={liked}
      disabled={isLiking || isDisliking}
      icon={<LikeIcon height="auto" width="auto" />}
      checkedIcon={<FilledLikeIcon height="auto" width="auto" />}
      onChange={handleToggleLike}
      sx={{
        padding: 0,
        width: 22,
        height: 22,
        cursor: isLiking || isDisliking ? 'not-allowed' : 'pointer',
      }}
    />
  );
};

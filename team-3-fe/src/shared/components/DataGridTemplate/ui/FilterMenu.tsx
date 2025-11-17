import * as React from 'react';
import { MenuItem, Checkbox, Typography } from '@mui/material';
import { useGridApiContext } from '@mui/x-data-grid';

interface Props {
  field?: string; // поле для фильтрации (по умолчанию 'access')
  filterOptions?: string[];
}

export const FilterMenu: React.FC<Props> = ({
  field = 'access',
  filterOptions = ['Все сотрудники', 'Администратор', 'HR-специалист', 'Менеджер', 'Специалист'],
}) => {
  const apiRef = useGridApiContext();

  // Сентинельное значение — чтобы его точно не было в реальных данных.
  const SENTINEL = '__FILTER_EMPTY_SELECTION__';

  const actualOptions = React.useMemo(() => filterOptions.slice(1), [filterOptions]);

  const [checkedValues, setCheckedValues] = React.useState<string[]>([]);

  // При монтировании / открытии — считываем filterModel и восстанавливаем checkedValues
  React.useEffect(() => {
    const filterModel = apiRef.current.state.filter?.filterModel;
    const filterItem = filterModel?.items?.find?.((i: any) => i.field === field);

    if (filterItem?.value && Array.isArray(filterItem.value)) {
      const vals: string[] = filterItem.value;

      if (vals.includes(SENTINEL)) {
        setCheckedValues([]);
      } else {
        setCheckedValues(vals);
      }
    } else {
      setCheckedValues(actualOptions.slice());
    }
  }, [apiRef, field]);

  const applyFilter = (values: string[]) => {
    if (values.length === actualOptions.length) {
      apiRef.current.setFilterModel({ items: [] });
      return;
    }

    if (values.length === 0) {
      apiRef.current.setFilterModel({
        items: [
          {
            field,
            operator: 'isAnyOf',
            value: [SENTINEL],
          },
        ],
      });
      return;
    }

    apiRef.current.setFilterModel({
      items: [
        {
          field,
          operator: 'isAnyOf',
          value: values,
        },
      ],
    });
  };

  const handleToggle = (option: string) => {
    setCheckedValues((prev) => {
      const exists = prev.includes(option);
      const next = exists ? prev.filter((x) => x !== option) : [...prev, option];
      applyFilter(next);
      return next;
    });
  };

  const handleSelectAllClick = () => {
    const allChecked = checkedValues.length === actualOptions.length;
    if (allChecked) {
      setCheckedValues([]);
      applyFilter([]);
    } else {
      setCheckedValues(actualOptions.slice());
      applyFilter(actualOptions.slice());
    }
  };

  const isAllChecked = checkedValues.length === actualOptions.length;
  const isIndeterminate = checkedValues.length > 0 && !isAllChecked;

  return (
    <>
      {/* Главный чекбокс "Все сотрудники" */}
      <MenuItem
        key="all"
        onClick={handleSelectAllClick}
        sx={{
          width: 'auto',
          px: 1,
          fontSize: '14px',
          padding: '4px 4px',
          display: 'flex',
          gap: '8px',
        }}
      >
        <Checkbox
          sx={{ width: '20px', height: '20px' }}
          checked={isAllChecked}
          indeterminate={isIndeterminate}
        />
        <Typography sx={{ margin: 0, fontSize: '14px' }}>{filterOptions[0]}</Typography>
      </MenuItem>

      {/* Остальные опции */}
      {actualOptions.map((opt) => (
        <MenuItem
          key={opt}
          onClick={() => handleToggle(opt)}
          sx={{
            width: 'auto',
            px: 1,
            padding: '5px 16px',
            display: 'flex',
            gap: '8px',
          }}
        >
          <Checkbox sx={{ width: '20px', height: '20px' }} checked={checkedValues.includes(opt)} />
          <Typography sx={{ margin: 0, fontSize: '14px' }}>{opt}</Typography>
        </MenuItem>
      ))}
    </>
  );
};

export default FilterMenu;

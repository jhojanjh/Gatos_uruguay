import { Select, SimpleGrid } from '@mantine/core';
import type { Category } from '@/types';
import type { WeekRange } from '@/utils/dates';

interface ExpenseFiltersProps {
  weeks: WeekRange[];
  week: string;
  onWeekChange: (week: string) => void;
  categories: Category[];
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
}

export function ExpenseFilters({
  weeks,
  week,
  onWeekChange,
  categories,
  categoryId,
  onCategoryChange,
}: ExpenseFiltersProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      <Select
        label="Semana"
        value={week}
        onChange={(value) => onWeekChange(value ?? 'all')}
        allowDeselect={false}
        data={[
          { value: 'all', label: 'Todo el mes' },
          ...weeks.map((item) => ({ value: String(item.index), label: `Semana ${item.index}` })),
        ]}
      />
      <Select
        label="Categoría"
        value={categoryId}
        onChange={(value) => onCategoryChange(value ?? 'all')}
        allowDeselect={false}
        data={[
          { value: 'all', label: 'Todas las categorías' },
          ...categories.map((category) => ({ value: category.id, label: category.name })),
        ]}
      />
    </SimpleGrid>
  );
}

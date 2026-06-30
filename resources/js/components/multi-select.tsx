import { useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MultiSelectProps {
    options: { id: number; name: string }[];
    selected: number[];
    onChange: (selected: number[]) => void;
    placeholder?: string;
    emptyText?: string;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = 'Search...',
    emptyText = 'No options found',
}: MultiSelectProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOptions = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();

        if (!query) {
            return options;
        }

        return options.filter((option) =>
            option.name.toLowerCase().includes(query),
        );
    }, [options, searchQuery]);

    function handleToggle(id: number) {
        if (selected.includes(id)) {
            onChange(selected.filter((s) => s !== id));
        } else {
            onChange([...selected, id]);
        }
    }

    return (
        <div className="rounded-md border border-neutral-200 dark:border-neutral-800">
            <div className="border-b border-neutral-200 p-2 dark:border-neutral-800">
                <Input
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 bg-neutral-50 text-xs dark:bg-neutral-900"
                />
            </div>

            <div className="max-h-48 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                    <p className="p-2 text-center text-xs text-neutral-400">
                        {emptyText}
                    </p>
                ) : (
                    filteredOptions.map((option) => {
                        const checkboxId = `multi-select-${option.id}`;
                        const isChecked = selected.includes(option.id);

                        return (
                            <Label
                                key={option.id}
                                htmlFor={checkboxId}
                                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-normal hover:bg-neutral-50 dark:hover:bg-neutral-900"
                            >
                                <Checkbox
                                    id={checkboxId}
                                    checked={isChecked}
                                    onCheckedChange={() =>
                                        handleToggle(option.id)
                                    }
                                />
                                <span className="select-none">
                                    {option.name}
                                </span>
                            </Label>
                        );
                    })
                )}
            </div>

            {selected.length > 0 && (
                <div className="border-t border-neutral-200 px-3 py-1.5 dark:border-neutral-800">
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                        {selected.length} selected
                    </span>
                </div>
            )}
        </div>
    );
}

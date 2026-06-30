import { Link } from '@inertiajs/react';

interface LinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    links: LinkItem[];
}

export function Pagination({ links }: Props) {
    if (!links || links.length <= 3) {
        return null;
    }

    return (
        <div className="mt-2 flex items-center justify-center gap-1">
            {links.map((link, idx) => {
                if (link.url === null) {
                    return (
                        <span
                            key={idx}
                            className="cursor-not-allowed px-3 py-1.5 text-xs text-neutral-400 select-none dark:text-neutral-600"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }

                return (
                    <Link
                        key={idx}
                        href={link.url}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            link.active
                                ? 'bg-neutral-950 text-neutral-50 shadow-sm dark:bg-neutral-50 dark:text-neutral-950'
                                : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
}

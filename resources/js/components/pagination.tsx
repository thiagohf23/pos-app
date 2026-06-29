import { Link } from "@inertiajs/react";

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
        <div className="flex items-center justify-center gap-1 mt-2">
            {links.map((link, idx) => {
                if (link.url === null) {
                    return (
                        <span
                            key={idx}
                            className="px-3 py-1.5 text-xs text-neutral-400 dark:text-neutral-600 cursor-not-allowed select-none"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }
                return (
                    <Link
                        key={idx}
                        href={link.url}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            link.active
                                ? "bg-neutral-950 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-950 shadow-sm"
                                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
}

import { Head, router } from '@inertiajs/react';
import { Search, Ticket } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { destroy } from '@/routes/coupons';
import type { Coupon, Paginated } from '@/types';
import { CouponDialog } from './components/coupon-dialog';
import { CouponTable } from './components/coupon-table';

interface Props {
    coupons: Paginated<Coupon>;
    categories: { id: number; name: string }[];
    products: { id: number; name: string }[];
}

export default function CouponsIndex({ coupons, categories, products }: Props) {
    const { t } = useTranslation();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Coupon | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    function handleEdit(coupon: Coupon) {
        setEditing(coupon);
        setShowForm(true);
    }

    function handleDelete(coupon: Coupon) {
        setDeletingCoupon(coupon);
    }

    function confirmDelete() {
        if (!deletingCoupon) {
            return;
        }

        router.delete(destroy.url(deletingCoupon.id), {
            onStart: () => setIsDeleting(true),
            onFinish: () => setIsDeleting(false),
            onSuccess: () => {
                // Invalidate prefetched pages so the removed coupon disappears without a reload
                router.flushAll();
                toast.success(
                    t('coupons.deleted_alert', { defaultValue: `Coupon "${deletingCoupon.code}" deleted successfully!`, name: deletingCoupon.code })
                );
                setDeletingCoupon(null);
            },
            onError: (errors) => {
                if (errors.delete) {
                    toast.error(errors.delete);
                } else {
                    toast.error(t('coupons.delete_failed_alert', 'Failed to delete the coupon.'));
                }
            },
        });
    }

    // Filter coupons on client-side for immediate search responsiveness, combined with backend pagination
    const filteredCoupons = useMemo(() => {
        const query = searchTerm.toLowerCase();

        return coupons.data.filter(
            (coupon) =>
                coupon.code.toLowerCase().includes(query) ||
                coupon.description?.toLowerCase().includes(query),
        );
    }, [coupons.data, searchTerm]);

    return (
        <>
            <Head title={t('coupons.title')} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                            {t('coupons.title')}
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            {t('coupons.subtitle', 'Create and manage discount coupons applied at checkout.')}
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditing(null);
                            setShowForm(true);
                        }}
                        className="w-full cursor-pointer gap-2 bg-neutral-950 shadow-md transition-all duration-200 hover:bg-neutral-800 sm:w-auto dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                    >
                        <Ticket className="size-4" />
                        {t('coupons.create')}
                    </Button>
                </div>

                {/* Filters */}
                <div className="relative flex w-full max-w-md items-center gap-2">
                    <Search className="pointer-events-none absolute left-3 size-4 text-neutral-400" />
                    <Input
                        placeholder={t('coupons.search_placeholder', 'Search coupons...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white pl-9 dark:bg-neutral-900/50"
                    />
                </div>

                {/* Content Table / Grid */}
                <div className="flex-1 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/30">
                    <CouponTable
                        coupons={filteredCoupons}
                        searchTerm={searchTerm}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAddClick={() => {
                            setEditing(null);
                            setShowForm(true);
                        }}
                    />
                </div>

                {/* Pagination */}
                <Pagination links={coupons.links} />
            </div>

            {/* Create/Edit Coupon Dialog */}
            <CouponDialog
                key={`${editing?.id ?? 'new'}-${showForm}`}
                open={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditing(null);
                }}
                editing={editing}
                categories={categories}
                products={products}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                open={deletingCoupon !== null}
                onClose={() => setDeletingCoupon(null)}
                onConfirm={confirmDelete}
                title={t('coupons.delete_title', 'Delete Coupon')}
                description={t('coupons.delete_description', { defaultValue: `Are you sure you want to delete coupon "${deletingCoupon?.code}"? This action cannot be undone.`, code: deletingCoupon?.code })}
                loading={isDeleting}
            />
        </>
    );
}

// Add Breadcrumbs to match default layout requirements
CouponsIndex.layout = {
    breadcrumbs: [
        {
            title: 'nav.coupons',
            href: '/coupons',
        },
    ],
};

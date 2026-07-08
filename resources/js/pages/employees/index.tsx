import { Head, router } from '@inertiajs/react';
import { Search, UserPlus } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { destroy, resendInvitation, resetPassword, update } from '@/routes/employees';
import type { Employee, Paginated, Role } from '@/types';
import { EmployeeDialog } from './components/employee-dialog';
import { EmployeeTable } from './components/employee-table';

interface Props {
    employees: Paginated<Employee>;
    roles: Role[];
}

export default function EmployeesIndex({ employees, roles }: Props) {
    const { t } = useTranslation();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Employee | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    function handleEdit(employee: Employee) {
        setEditing(employee);
        setShowForm(true);
    }

    function handleDelete(employee: Employee) {
        setDeletingEmployee(employee);
    }

    function handleToggleActive(employee: Employee, checked: boolean) {
        router.put(
            update.url(employee.id),
            {
                name: employee.user?.name ?? '',
                email: employee.user?.email ?? '',
                phone: employee.phone || '',
                cpf: employee.cpf || '',
                salary: employee.salary,
                hire_date: employee.hire_date || '',
                is_active: checked,
            },
            {
                onSuccess: () => {
                    toast.success(
                        t('employees.status_updated_alert', { defaultValue: `Employee "${employee.user?.name}" status updated!`, name: employee.user?.name })
                    );
                },
                onError: () => {
                    toast.error(t('employees.status_update_failed_alert', 'Failed to update status.'));
                },
            },
        );
    }

    function confirmDelete() {
        if (!deletingEmployee) {
            return;
        }

        router.delete(destroy.url(deletingEmployee.id), {
            onStart: () => setIsDeleting(true),
            onFinish: () => setIsDeleting(false),
            onSuccess: () => {
                router.flushAll();
                toast.success(
                    t('employees.deleted_alert', { defaultValue: `Employee "${deletingEmployee.user?.name}" deleted successfully!`, name: deletingEmployee.user?.name })
                );
                setDeletingEmployee(null);
            },
            onError: () => {
                toast.error(t('employees.delete_failed_alert', 'Failed to delete the employee.'));
            },
        });
    }

    function handleResendInvitation(employee: Employee) {
        router.post(resendInvitation.url(employee.id), {}, {
            onSuccess: () => toast.success(t('employees.invitation_resent_alert', 'Invitation resent!')),
            onError: () => toast.error(t('employees.resend_failed_alert', 'Failed to resend invitation.')),
        });
    }

    function handleResetPassword(employee: Employee) {
        router.post(resetPassword.url(employee.id), {}, {
            onSuccess: () => toast.success(t('employees.reset_link_sent_alert', 'Reset link sent!')),
            onError: () => toast.error(t('employees.send_reset_failed_alert', 'Failed to send link.')),
        });
    }

    const filteredEmployees = useMemo(() => {
        const query = searchTerm.toLowerCase();

        return employees.data.filter(
            (employee) =>
                (employee.user?.name ?? '').toLowerCase().includes(query) ||
                (employee.user?.email ?? '').toLowerCase().includes(query) ||
                employee.cpf?.toLowerCase().includes(query),
        );
    }, [employees.data, searchTerm]);

    return (
        <>
            <Head title={t('employees.title')} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                            {t('employees.title')}
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            {t('employees.subtitle', 'Manage your team members and their roles.')}
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditing(null);
                            setShowForm(true);
                        }}
                        className="w-full cursor-pointer gap-2 bg-neutral-950 shadow-md transition-all duration-200 hover:bg-neutral-800 sm:w-auto dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                    >
                        <UserPlus className="size-4" />
                        {t('employees.create')}
                    </Button>
                </div>

                {/* Filters */}
                <div className="relative flex w-full max-w-md items-center gap-2">
                    <Search className="pointer-events-none absolute left-3 size-4 text-neutral-400" />
                    <Input
                        placeholder={t('employees.search_placeholder', 'Search employees...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white pl-9 dark:bg-neutral-900/50"
                    />
                </div>

                {/* Content Table */}
                <div className="flex-1 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/30">
                    <EmployeeTable
                        employees={filteredEmployees}
                        searchTerm={searchTerm}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleActive={handleToggleActive}
                        onResendInvitation={handleResendInvitation}
                        onResetPassword={handleResetPassword}
                        onAddClick={() => {
                            setEditing(null);
                            setShowForm(true);
                        }}
                    />
                </div>

                {/* Pagination */}
                <Pagination links={employees.links} />
            </div>

            {/* Create/Edit Employee Dialog */}
            <EmployeeDialog
                open={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditing(null);
                }}
                editing={editing}
                roles={roles}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                open={deletingEmployee !== null}
                onClose={() => setDeletingEmployee(null)}
                onConfirm={confirmDelete}
                title={t('employees.delete_title', 'Delete Employee')}
                description={t('employees.delete_description', { defaultValue: `Are you sure you want to delete "${deletingEmployee?.user?.name}"? This action cannot be undone.`, name: deletingEmployee?.user?.name })}
                loading={isDeleting}
            />
        </>
    );
}

EmployeesIndex.layout = {
    breadcrumbs: [
        {
            title: 'nav.employees',
            href: '/employees',
        },
    ],
};

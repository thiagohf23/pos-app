import { Head, router } from '@inertiajs/react';
import { Search, UserPlus } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { destroy, update } from '@/routes/employees';
import type { Employee, Paginated, Role } from '@/types';
import { EmployeeDialog } from './components/employee-dialog';
import { EmployeeTable } from './components/employee-table';

interface Props {
    employees: Paginated<Employee>;
    roles: Role[];
}

export default function EmployeesIndex({ employees, roles }: Props) {
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
                name: employee.name,
                email: employee.email,
                phone: employee.phone || '',
                cpf: employee.cpf || '',
                salary: employee.salary,
                hire_date: employee.hire_date || '',
                is_active: checked,
            },
            {
                onSuccess: () => {
                    toast.success(
                        `Employee "${employee.name}" status updated!`,
                    );
                },
                onError: () => {
                    toast.error('Failed to update status.');
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
                    `Employee "${deletingEmployee.name}" deleted successfully!`,
                );
                setDeletingEmployee(null);
            },
            onError: () => {
                toast.error('Failed to delete the employee.');
            },
        });
    }

    const filteredEmployees = useMemo(() => {
        const query = searchTerm.toLowerCase();

        return employees.data.filter(
            (employee) =>
                employee.name.toLowerCase().includes(query) ||
                employee.email.toLowerCase().includes(query) ||
                employee.cpf?.toLowerCase().includes(query),
        );
    }, [employees.data, searchTerm]);

    return (
        <>
            <Head title="Employees" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                            Employees
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Manage your team members and their roles.
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
                        Add Employee
                    </Button>
                </div>

                {/* Filters */}
                <div className="relative flex w-full max-w-md items-center gap-2">
                    <Search className="pointer-events-none absolute left-3 size-4 text-neutral-400" />
                    <Input
                        placeholder="Search employees..."
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
                title="Delete Employee"
                description={`Are you sure you want to delete "${deletingEmployee?.name}"? This action cannot be undone.`}
                loading={isDeleting}
            />
        </>
    );
}

EmployeesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Employees',
            href: '/employees',
        },
    ],
};

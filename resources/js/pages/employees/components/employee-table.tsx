import { Edit, KeyRound, Mail, MoreHorizontal, Plus, Trash2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import type { Employee } from '@/types';

interface Props {
    employees: Employee[];
    searchTerm: string;
    onEdit: (employee: Employee) => void;
    onDelete: (employee: Employee) => void;
    onToggleActive: (employee: Employee, checked: boolean) => void;
    onAddClick: () => void;
    onResendInvitation: (employee: Employee) => void;
    onResetPassword: (employee: Employee) => void;
}

export function EmployeeTable({
    employees,
    searchTerm,
    onEdit,
    onDelete,
    onToggleActive,
    onAddClick,
    onResendInvitation,
    onResetPassword,
}: Props) {
    const { t } = useTranslation();

    if (employees.length === 0) {
        return (
            <div className="flex h-96 flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 rounded-full bg-neutral-50 p-4 text-neutral-400 ring-1 ring-neutral-200/50 dark:bg-neutral-900 dark:text-neutral-600 dark:ring-neutral-800">
                    <Users className="size-8 animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {t('common.no_results')}
                </h3>
                <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
                    {searchTerm
                        ? t('employees.no_results_search_hint', 'Try adjusting your search terms or filter criteria.')
                        : t('employees.no_results_empty_hint', 'Get started by registering your first employee.')}
                </p>
                {!searchTerm && (
                    <Button
                        onClick={onAddClick}
                        variant="outline"
                        className="mt-4 cursor-pointer gap-2"
                    >
                        <Plus className="size-4" />
                        {t('employees.create')}
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/50 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400">
                        <th className="px-6 py-4">{t('common.name')}</th>
                        <th className="px-6 py-4">{t('common.email')}</th>
                        <th className="px-6 py-4">{t('employees.role', 'Role')}</th>
                        <th className="px-6 py-4 text-right">{t('employees.salary', 'Salary')}</th>
                        <th className="px-6 py-4 text-center">{t('common.status')}</th>
                        <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {employees.map((employee) => (
                        <tr
                            key={employee.id}
                            className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20"
                        >
                            <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-neutral-100">
                                {employee.user?.name ?? '—'}
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                                {employee.user?.email ?? '—'}
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                                {employee.user?.roles?.[0]?.name ?? '—'}
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                }).format(Number(employee.salary))}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center">
                                    <Switch
                                        checked={employee.is_active}
                                        onCheckedChange={(checked) =>
                                            onToggleActive(employee, checked)
                                        }
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 cursor-pointer text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                                            >
                                                <MoreHorizontal className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => onResendInvitation(employee)}
                                                className="cursor-pointer"
                                            >
                                                <Mail className="size-4" />
                                                {t('employees.resend_invitation', 'Resend invitation')}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onResetPassword(employee)}
                                                className="cursor-pointer"
                                            >
                                                <KeyRound className="size-4" />
                                                {t('employees.reset_password', 'Reset password')}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => onEdit(employee)}
                                                className="cursor-pointer"
                                            >
                                                <Edit className="size-4" />
                                                {t('common.edit')}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onDelete(employee)}
                                                variant="destructive"
                                                className="cursor-pointer"
                                            >
                                                <Trash2 className="size-4" />
                                                {t('common.delete')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

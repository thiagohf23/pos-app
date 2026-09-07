import { router, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { store, update } from '@/routes/employees';
import type { Employee } from '@/types';

interface Props {
    open: boolean;
    onClose: () => void;
    editing: Employee | null;
    roles: { id: number; name: string }[];
}

export function EmployeeDialog({ open, onClose, editing, roles = [] }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            email: '',
            password: '',
            phone: '',
            cpf: '',
            salary: '',
            hire_date: '',
            is_active: true,
            role_id: '',
        });

    useEffect(() => {
        if (open) {
            if (editing) {
                setData({
                    name: editing.user?.name ?? '',
                    email: editing.user?.email ?? '',
                    password: '',
                    phone: editing.phone || '',
                    cpf: editing.cpf || '',
                    salary: editing.salary,
                    hire_date: editing.hire_date || '',
                    is_active: editing.is_active,
                    role_id: String(editing.user?.roles[0]?.id ?? ''),
                });
            } else {
                reset();
                clearErrors();
            }
        }
    }, [open, editing, clearErrors, reset, setData]);

    function handleClose() {
        onClose();
        reset();
        clearErrors();
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (editing) {
            put(update.url(editing.id), {
                onSuccess: () => {
                    router.flushAll();
                    toast.success(
                        t('employees.updated_success_alert', { defaultValue: `Employee "${data.name}" updated successfully!`, name: data.name })
                    );
                    handleClose();
                },
                onError: () => {
                    toast.error(
                        t('employees.update_failed_form_alert', 'Failed to update the employee. Please check the form.')
                    );
                },
            });
        } else {
            post(store.url(), {
                onSuccess: () => {
                    router.flushAll();
                    toast.success(
                        t('employees.created_success_alert', { defaultValue: `Employee "${data.name}" created successfully!`, name: data.name })
                    );
                    handleClose();
                },
                onError: () => {
                    toast.error(
                        t('employees.create_failed_form_alert', 'Failed to create the employee. Please check the form.')
                    );
                },
            });
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(openState) => !openState && handleClose()}
        >
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>
                        {editing ? t('employees.edit') : t('employees.create')}
                    </DialogTitle>
                    <DialogDescription>
                        {editing
                            ? t('employees.edit_description', 'Fill in the details below to update the employee.')
                            : t('employees.create_description', 'Fill in the details below to register a new employee.')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="col-span-2 space-y-1.5">
                            <Label htmlFor="name">{t('employees.full_name_label', 'Full Name *')}</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder={t('employees.full_name_placeholder', 'e.g. John Doe')}
                                required
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email">{t('common.email')} *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="employee@email.com"
                                required
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">{errors.email}</p>
                            )}
                        </div>

                        {/* Password - only in edit mode */}
                        {editing && (
                            <div className="space-y-1.5">
                                <Label htmlFor="password">
                                    {t('employees.password_keep_hint', 'Password (leave blank to keep)')}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder={t('employees.password_blank_placeholder', 'Leave blank to keep')}
                                />
                                {errors.password && (
                                    <p className="text-xs text-destructive">{errors.password}</p>
                                )}
                            </div>
                        )}

                        {/* Invitation notice - only in create mode */}
                        {!editing && (
                            <div className="col-span-2 rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                                {t('employees.invitation_email_notice', 'An email will be sent to the employee to set their password.')}
                            </div>
                        )}

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <Label htmlFor="phone">{t('employees.phone', 'Phone')}</Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="(11) 99999-9999"
                            />
                            {errors.phone && (
                                <p className="text-xs text-destructive">{errors.phone}</p>
                            )}
                        </div>

                        {/* CPF */}
                        <div className="space-y-1.5">
                            <Label htmlFor="cpf">{t('employees.cpf', 'CPF')}</Label>
                            <Input
                                id="cpf"
                                value={data.cpf}
                                onChange={(e) => setData('cpf', e.target.value)}
                                placeholder="000.000.000-00"
                            />
                            {errors.cpf && (
                                <p className="text-xs text-destructive">{errors.cpf}</p>
                            )}
                        </div>

                        {/* Salary */}
                        <div className="space-y-1.5">
                            <Label htmlFor="salary">{t('employees.salary', 'Salary')} *</Label>
                            <Input
                                id="salary"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.salary}
                                onChange={(e) => setData('salary', e.target.value)}
                                placeholder="0.00"
                                required
                            />
                            {errors.salary && (
                                <p className="text-xs text-destructive">{errors.salary}</p>
                            )}
                        </div>

                        {/* Hire Date */}
                        <div className="space-y-1.5">
                            <Label htmlFor="hire_date">{t('employees.hire_date', 'Hire Date')}</Label>
                            <Input
                                id="hire_date"
                                type="date"
                                value={data.hire_date}
                                onChange={(e) => setData('hire_date', e.target.value)}
                            />
                            {errors.hire_date && (
                                <p className="text-xs text-destructive">{errors.hire_date}</p>
                            )}
                        </div>

                        {/* Role */}
                        <div className="space-y-1.5">
                            <Label htmlFor="role_id">{t('employees.role', 'Role')}</Label>
                            <Select
                                value={data.role_id}
                                onValueChange={(value) => setData('role_id', value)}
                            >
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue placeholder={t('employees.select_role_placeholder', 'Select a role')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={String(role.id)} className="cursor-pointer">
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role_id && (
                                <p className="text-xs text-destructive">{errors.role_id}</p>
                            )}
                        </div>

                        {/* Active */}
                        <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) =>
                                        setData('is_active', e.target.checked)
                                    }
                                    className="size-4 rounded border-gray-300 text-neutral-950 focus:ring-neutral-950 dark:border-gray-600 dark:bg-gray-800"
                                />
                                <span className="text-sm font-medium select-none">
                                    {t('common.active')}
                                </span>
                            </label>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                            className="cursor-pointer"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="cursor-pointer gap-2 bg-neutral-950 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                        >
                            {processing && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            {editing ? t('common.save_changes') : t('employees.create')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

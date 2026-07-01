import { Form, Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { Camera, Crop } from 'lucide-react';
import { AvatarCropper } from './components/avatar-cropper';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;
    const getInitials = useInitials();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(auth.user.avatar ?? null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);

    function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setIsCropperOpen(true);
        }
    }

    async function handleEditCurrentAvatar() {
        if (!avatarPreview) return;

        try {
            // Fetch current preview (data URL or server URL)
            const response = await fetch(avatarPreview);
            const blob = await response.blob();
            const file = new File([blob], 'avatar.jpg', { type: blob.type || 'image/jpeg' });
            setSelectedFile(file);
            setIsCropperOpen(true);
        } catch (error) {
            console.error('Failed to load avatar for editing', error);
        }
    }

    function handleCropComplete(croppedFile: File) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(croppedFile);

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(croppedFile);
        if (fileInputRef.current) {
            fileInputRef.current.files = dataTransfer.files;
        }

        setIsCropperOpen(false);
    }

    function triggerFileInput() {
        fileInputRef.current?.click();
    }

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile"
                    description="Update your name and email address"
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="flex flex-col items-start gap-4">
                                <Label>Photo</Label>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={avatarPreview || ''} alt={auth.user.name} />
                                        <AvatarFallback className="text-lg">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <input
                                        type="file"
                                        name="avatar"
                                        id="avatar"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={triggerFileInput}
                                        className="flex items-center gap-2"
                                    >
                                        <Camera className="size-4" />
                                        Change Photo
                                    </Button>

                                    {avatarPreview && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleEditCurrentAvatar}
                                            className="flex items-center gap-2"
                                        >
                                            <Crop className="size-4" />
                                            edit
                                        </Button>
                                    )}
                                </div>
                                <InputError className="mt-2" message={errors.avatar} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Click here to re-send the
                                                verification email.
                                            </Link>
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                A new verification link has been
                                                sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    Save
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <AvatarCropper
                    imageFile={selectedFile}
                    open={isCropperOpen}
                    onClose={() => setIsCropperOpen(false)}
                    onCrop={handleCropComplete}
                />
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};

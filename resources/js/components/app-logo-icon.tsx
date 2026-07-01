import { ShoppingCart } from 'lucide-react';
import type { ComponentProps } from 'react';

export default function AppLogoIcon(props: ComponentProps<typeof ShoppingCart>) {
    return <ShoppingCart {...props} />;
}


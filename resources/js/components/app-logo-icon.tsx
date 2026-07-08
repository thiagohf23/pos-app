export default function AppLogoIcon({ className }: { className?: string }) {
    return (
        <img
            src="/images/logos/logo.png"
            alt="POS"
            className={`${className} object-contain`}
        />
    );
}


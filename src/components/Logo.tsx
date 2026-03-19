import Link from "next/link";
import Image from "next/image";

export const Logo = () => {
    return (
        <Link href="/" className="flex items-center group">
            <Image
                src="/logo.png"
                alt="Salumia Logo"
                width={200}
                height={60}
                className="h-14 w-auto object-contain"
                priority
            />
        </Link>
    );
};

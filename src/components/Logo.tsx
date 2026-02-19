import Link from "next/link";
import Image from "next/image";

export const Logo = () => {
    return (
        <Link href="/" className="flex items-center group">
            <Image
                src="/logo.png"
                alt="Mindcare Logo"
                width={150}
                height={50}
                className="h-10 w-auto object-contain"
                priority
            />
        </Link>
    );
};

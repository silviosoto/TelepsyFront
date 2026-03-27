"use client";

import { useEffect, useState } from "react";
import { User as UserIcon } from "lucide-react";
import { authService } from "@/services/auth.service";

export const UserAvatar = ({ className = "" }: { className?: string }) => {
    const [user, setUser] = useState<{ email: string; role: string; firstName?: string; lastName?: string } | null>(null);

    useEffect(() => {
        setUser(authService.getUser());
    }, []);

    if (!user) return null;

    const fullName = user.firstName ? `${user.firstName} ${user.lastName || ""}` : null;
    const displayName = fullName || user.email;
    const initial = user.firstName ? user.firstName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : "?");

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0 overflow-hidden">
                {initial}
            </div>
            <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-foreground truncate">{displayName}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{user.role}</span>
            </div>
        </div>
    );
};

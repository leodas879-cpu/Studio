"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export function Header() {
  return (
    <header className="bg-card text-card-foreground border-b p-4 flex justify-end">
        <Link href="/dashboard/profile">
          <div className="flex items-center gap-3 cursor-pointer">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CS</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">Chef Sarah</p>
              <p className="text-sm text-muted-foreground">sarah.chef@example.com</p>
            </div>
          </div>
        </Link>
    </header>
  );
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { MoveLeftIcon, User as UserIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import Cart from "@/components/cart/Cart";
import ProfileMenu from "@/components/ProfileMenu";

const Header = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const { status } = useSession();

  const canGoBack = currentPath !== "/";

  return (
    <header className="bg-card text-card-foreground shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <div className="flex items-center gap-2 md:gap-4">
          {canGoBack && (
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-accent"
              onClick={() => router.back()}
              aria-label="Voltar"
            >
              <MoveLeftIcon className="h-5 w-5" />
            </Button>
          )}
          <Link
            href="/"
            className="flex flex-col sm:flex-row sm:items-end sm:gap-2 group"
          >
            <h1 className="text-xl md:text-2xl font-bold text-primary group-hover:text-primary/90 transition-colors">
              Parcerias
            </h1>
            <h2 className="text-sm md:text-base font-medium text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block">
              Pizzas e Burgers
            </h2>
          </Link>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <Cart />
          {status === "loading" ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          ) : status === "authenticated" ? (
            <ProfileMenu />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-accent"
              onClick={() => router.push("/login")}
              aria-label="Fazer login"
            >
              <UserIcon className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

"use client";

import { usePathname, useRouter } from "next/navigation";

import { MoveLeftIcon, User } from "lucide-react";

import { useSession } from "next-auth/react";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import Cart from "@/components/cart/Cart";
import ProfileMenu from "@/components/ProfileMenu";

const Header = () => {
  const router = useRouter();
  const path = usePathname();

  const { status } = useSession();

  return (
    <div className="bg-primary-foreground p-4 flex justify-between">
      <div className="flex gap-2 items-center">
        {path !== "/" && (
          <Button
            variant="link"
            className="text-secondary cursor-pointer"
            onClick={() => router.back()}
          >
            <MoveLeftIcon />
          </Button>
        )}
        <div className="flex flex-col sm:flex-row sm:items-end sm:gap-2">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary">Parcerias</h1>
          </Link>

          <h2 className="text-lg font-semibold text-background">
            Pizzas e Burgers
          </h2>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2.5">
        <Cart />
        {status !== "authenticated" ? (
          <Button
            className="text-white cursor-pointer"
            variant="link"
            onClick={() => router.push("/login")}
          >
            <User className="size-6" />
          </Button>
        ) : (
          <ProfileMenu />
        )}
      </div>
    </div>
  );
};

export default Header;

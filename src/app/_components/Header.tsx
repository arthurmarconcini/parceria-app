"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { MoveLeftIcon } from "lucide-react";
import Cart from "./cart/Cart";
import { signOut, useSession } from "next-auth/react";

const Header = () => {
  const router = useRouter();
  const path = usePathname();

  const { status } = useSession();

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="bg-accent-foreground p-4 flex justify-between">
      <div className="flex gap-2 items-center">
        {path !== "/" && (
          <Button className="text-secondary" onClick={() => router.back()}>
            <MoveLeftIcon />
          </Button>
        )}
        <h1 className="text-secondary text-2xl font-bold ">Parcerias</h1>
      </div>

      <div className="flex items-center gap-2">
        {status !== "authenticated" ? (
          <Button
            className="text-white"
            variant="ghost"
            onClick={() => router.push("/login")}
          >
            Login
          </Button>
        ) : (
          <Button className="text-white" variant="ghost" onClick={handleLogout}>
            Sair
          </Button>
        )}

        <Cart />
      </div>
    </div>
  );
};

export default Header;

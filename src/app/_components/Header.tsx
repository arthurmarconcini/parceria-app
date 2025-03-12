"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { MoveLeftIcon } from "lucide-react";
import Cart from "./cart/Cart";

const Header = () => {
  const router = useRouter();
  const path = usePathname();

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

      <Cart />
    </div>
  );
};

export default Header;

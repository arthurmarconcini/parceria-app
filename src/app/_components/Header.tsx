"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { MoveLeftIcon } from "lucide-react";

const Header = () => {
  const router = useRouter();
  const path = usePathname();

  return (
    <div className="bg-accent-foreground p-4 flex items-center gap-4">
      {path !== "/" && (
        <Button className="text-secondary" onClick={() => router.back()}>
          <MoveLeftIcon />
        </Button>
      )}
      <h1 className="text-secondary text-2xl font-bold ">Parcerias</h1>
    </div>
  );
};

export default Header;

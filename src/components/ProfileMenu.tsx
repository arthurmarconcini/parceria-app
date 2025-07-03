"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  LogOut,
  User,
  ShoppingCart,
  LayoutDashboard,
  PackagePlus,
  List,
  Clock,
} from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const ProfileMenu = () => {
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const getAvatarFallback = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (status === "loading") {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!session?.user) {
    return null;
  }

  const isAdminOrCashier =
    session.user.role === "ADMIN" || session.user.role === "CASHIER";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer h-9 w-9 border-2 border-transparent hover:border-primary transition-all">
          <AvatarImage
            src={"/avatar.png"}
            alt={session.user.name || "Avatar do usuário"}
          />
          <AvatarFallback>
            {getAvatarFallback(session.user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="font-medium truncate">
            {session.user.name || "Minha Conta"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {session.user.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={`/perfil/`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <User className="h-4 w-4" />
            <span>Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/pedidos"
            className="flex items-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Meus Pedidos</span>
          </Link>
        </DropdownMenuItem>

        {isAdminOrCashier && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
              Gestão da Loja
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link
                href="/loja/gestor"
                className="flex items-center gap-2 cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Gestor de Pedidos</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/loja/produtos"
                className="flex items-center gap-2 cursor-pointer"
              >
                <PackagePlus className="h-4 w-4" />
                <span>Produtos</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/loja/categorias"
                className="flex items-center gap-2 cursor-pointer"
              >
                <List className="h-4 w-4" />
                <span>Categorias</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/loja/horarios"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Clock className="h-4 w-4" />
                <span>Horários</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;

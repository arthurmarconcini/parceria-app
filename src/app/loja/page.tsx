import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LojaPage() {
  const session = await auth();

  if (session && session.user) {
    if (session.user.role === "ADMIN" || session.user.role === "CASHIER") {
      redirect("/loja/gestor");
    } else {
      redirect("/");
    }
  } else {
    redirect("/");
  }

  return null;
}

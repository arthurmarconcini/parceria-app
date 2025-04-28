import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginForm from "./_components/LoginForm";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-2">
        <div className="text-center m-6">
          <h1 className="text-2xl font-bold text-foreground">Bem-vindo</h1>
          <p className="text-muted-foreground">
            Entre com sua conta para fazer seu pedido!
          </p>
        </div>

        <LoginForm />

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Se não tiver conta,{" "}
            <a href="/register" className="font-bold text-foreground">
              cadastre-se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

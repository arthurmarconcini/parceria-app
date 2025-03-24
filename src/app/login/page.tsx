"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../_components/ui/button";
import { Input } from "../_components/ui/input"; // Presumo que você tenha este componente do shadcn

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/"); // Redireciona para a página inicial
    } else {
      console.error("Erro no login");
    }
  };

  return (
    <div className="min-h-screen  flex justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-2">
        <div className="text-center m-6">
          <h1 className="text-2xl font-bold text-foreground">Bem-vindo</h1>
          <p className="text-muted-foreground">
            Entre com sua conta para fazer seu pedido!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full"
            />
          </div>

          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>

        <div className="text-center space-y-4">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full"
          >
            Continuar como convidado
          </Button>

          <p className="text-sm text-muted-foreground">
            Se não tiver conta,{" "}
            <Button
              variant="link"
              onClick={() => router.push("/register")}
              className="p-0 h-auto font-bold"
            >
              cadastre-se
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

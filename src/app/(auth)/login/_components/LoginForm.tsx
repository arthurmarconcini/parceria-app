"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction } from "../actions";
import { useSession } from "next-auth/react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { update } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await loginAction({ email, password });

    if (result.success) {
      await update();
      router.push("/");
    } else {
      setError(result.error || "Erro ao fazer login");
    }
  };

  return (
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
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </div>

      <div className="space-y-2">
        <Button type="submit" className="w-full cursor-pointer">
          Entrar
        </Button>

        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="w-full cursor-pointer"
        >
          Continuar como convidado
        </Button>
      </div>
    </form>
  );
}

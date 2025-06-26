"use client";

import { useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { resetPasswordAction } from "@/app/(auth)/actions";

const resetSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [isPending, startTransition] = useTransition();

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ResetFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);

      const result = await resetPasswordAction(token, formData);

      if (result.success) {
        toast.success("Senha redefinida com sucesso!");
        router.push("/login");
      } else {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : "Ocorreu um erro. Verifique os campos.";
        toast.error(errorMessage);
      }
    });
  };

  return (
    <div className="min-h-screen flex justify-center bg-background p-4 mt-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Nova Senha</h1>
          <p className="text-muted-foreground">
            Crie uma nova senha para sua conta.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirme a Nova Senha</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Redefinindo..." : "Redefinir Senha"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

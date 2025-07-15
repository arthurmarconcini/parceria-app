import { z } from "zod";

export const registerFormSchema = z
  .object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    email: z.string().email("Por favor, insira um e-mail válido."),
    phone: z.string().min(10, "Por favor, insira um telefone válido."),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
    confirmPassword: z.string().min(6, "A confirmação de senha é obrigatória."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

// Schema para um único item (Tamanho ou Extra)
const itemSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  price: z.preprocess(
    (val) =>
      val ? Number(String(val).replace(/[^0-9]/g, "")) / 100 : undefined,
    z
      .number({ required_error: "O preço é obrigatório." })
      .positive("O preço deve ser positivo.")
  ),
});

export const productSchema = z
  .object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    description: z
      .string()
      .min(10, "A descrição deve ter pelo menos 10 caracteres."),
    categoryId: z.string().min(1, "A categoria é obrigatória."),
    imageUrl: z
      .string()
      .url("URL da imagem inválida.")
      .min(1, "A imagem é obrigatória."),
    discount: z.preprocess(
      (val) => (val ? Number(val) : 0),
      z
        .number()
        .min(0, "O desconto não pode ser negativo.")
        .max(100, "O desconto não pode ser maior que 100.")
        .default(0)
    ),
    isHalfHalf: z.boolean().default(false),
    price: z.preprocess(
      (val) =>
        val ? Number(String(val).replace(/[^0-9]/g, "")) / 100 : undefined,
      z.number().positive("O preço deve ser positivo.").optional()
    ),
    sizes: z.array(itemSchema).optional(),
    extras: z.array(itemSchema).optional(),
  })
  .superRefine((data, ctx) => {
    // Se existem tamanhos, o preço base não é necessário.
    if (data.sizes && data.sizes.length > 0) {
      if (data.price) {
        // Opcional: pode-se anular o preço base se tamanhos forem fornecidos
        data.price = undefined;
      }
    }
    // Se não existem tamanhos, o preço base é obrigatório.
    else {
      if (data.price === undefined || data.price === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["price"],
          message: "O preço base é obrigatório se não houver tamanhos.",
        });
      }
    }
  });

export type ProductFormValues = z.infer<typeof productSchema>;

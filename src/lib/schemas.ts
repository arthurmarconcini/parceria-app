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

const pricePreprocessor = z.preprocess((val) => {
  if (typeof val === "string") {
    if (!val.trim()) return undefined;

    const cleaned = val.replace(/[^\d,]/g, "").replace(",", ".");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? undefined : parsed;
  }

  if (typeof val === "number") {
    return val;
  }

  return undefined;
}, z.number().positive("O preço deve ser um número positivo."));

// Schema para itens dinâmicos (Tamanhos e Extras)
export const itemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "O nome é obrigatório."),
  price: pricePreprocessor,
});

// Schema principal do produto
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
      (val) => (val === undefined || val === null ? 0 : Number(val)),
      z.number().min(0).max(100).default(0)
    ),
    isHalfHalf: z.boolean().default(false),
    price: pricePreprocessor.optional().nullable(),
    sizes: z.array(itemSchema).optional(),
    extras: z.array(itemSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.sizes && data.sizes.length > 0) {
      if (data.price !== null && data.price !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["price"],
          message: "O preço base deve ser vazio se o produto tiver tamanhos.",
        });
      }
    } else {
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

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

const aBRLStringToNumber = z.preprocess((val) => {
  if (typeof val !== "string" || val === "") return null;

  const cleaned = val.replace(/[R$\s.]/g, "").replace(",", ".");
  const numberVal = parseFloat(cleaned);
  return isNaN(numberVal) ? null : numberVal;
}, z.number().nullable());

export const productSchema = z
  .object({
    name: z.string().min(1, "O nome do produto é obrigatório."),
    description: z.string().min(1, "A descrição é obrigatória."),
    imageUrl: z.string().url("URL inválida.").optional().or(z.literal("")),
    categoryId: z.string().min(1, "A categoria é obrigatória."),
    isHalfHalf: z.boolean().default(false),

    price: aBRLStringToNumber,
    discount: aBRLStringToNumber.default(0),

    sizes: z.array(
      z.object({
        name: z.string().min(1, "O nome do tamanho é obrigatório."),
        price: aBRLStringToNumber.refine((val) => val !== null && val > 0, {
          message: "Preço do tamanho é obrigatório.",
        }),
      })
    ),

    extras: z.array(
      z.object({
        name: z.string().min(1, "O nome do extra é obrigatório."),
        price: aBRLStringToNumber.refine((val) => val !== null && val >= 0, {
          message: "Preço do extra é obrigatório.",
        }),
      })
    ),

    isPizzaCategory: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.isPizzaCategory) {
      if (data.sizes.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Pizzas devem ter pelo menos um tamanho.",
          path: ["sizes"],
        });
      }
    } else {
      if (!data.price || data.price <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O preço base é obrigatório para esta categoria.",
          path: ["price"],
        });
      }
    }
  });

export type ProductSchemaType = z.infer<typeof productSchema>;

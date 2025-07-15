"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MinusCircle, PlusCircle } from "lucide-react";
import { Product, Category } from "@prisma/client";

// Definição do schema Zod para validação
const productSchema = z.object({
  name: z.string().min(1, "O nome do produto é obrigatório"),
  description: z.string().optional(),
  price: z.number().optional().nullable(), // Preço base, opcional se houver tamanhos
  categoryId: z.string().min(1, "Selecione uma categoria"),
  discount: z.number().optional().nullable(),
  imageUrl: z.string().url("URL da imagem inválida").optional().nullable(),
  isHalfHalf: z.boolean().optional(),
  isActive: z.boolean(),
  sizes: z
    .array(
      z.object({
        name: z.string().min(1, "Nome do tamanho obrigatório"),
        price: z.number().min(0, "Preço deve ser positivo"),
      })
    )
    .optional(),
  extras: z
    .array(
      z.object({
        name: z.string().min(1, "Nome do extra obrigatório"),
        price: z.number().min(0, "Preço deve ser positivo"),
      })
    )
    .optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product & {
    Size?: { id: string; name: string; price: number }[];
    Extras?: { id: string; name: string; price: number }[];
  };
  categories: Category[];
  onSubmit: (data: ProductFormValues) => void;
  isPending: boolean;
}

export const ProductForm = ({
  product,
  categories,
  onSubmit,
  isPending,
}: ProductFormProps) => {
  const defaultValues = {
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || undefined,
    categoryId: product?.categoryId || "",
    discount: product?.discount || undefined,
    imageUrl: product?.imageUrl || "",
    isHalfHalf: product?.isHalfHalf || false,
    isActive: product?.isActive ?? true,
    sizes:
      product?.Size?.map((size) => ({ name: size.name, price: size.price })) ||
      [],
    extras:
      product?.Extras?.map((extra) => ({
        name: extra.name,
        price: extra.price,
      })) || [],
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
    mode: "onChange",
  });

  const {
    fields: sizeFields,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({
    control: form.control,
    name: "sizes",
  });

  const {
    fields: extraFields,
    append: appendExtra,
    remove: removeExtra,
  } = useFieldArray({
    control: form.control,
    name: "extras",
  });

  const handleSubmit = (data: ProductFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Produto</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Pizza Margherita" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Descreva o produto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço Base (opcional se houver tamanhos)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0.00"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Desconto (opcional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0.00"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem (opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://exemplo.com/imagem.jpg"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isHalfHalf"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Permitir Meio a Meio?</FormLabel>
                <FormDescription>
                  Ative se o produto pode ser dividido em sabores.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Ativo?</FormLabel>
                <FormDescription>
                  Defina se o produto está disponível.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Seção de Tamanhos */}
        <div className="space-y-4">
          <FormLabel>Tamanhos</FormLabel>
          {sizeFields.map((field, index) => (
            <div key={field.id} className="flex items-end space-x-2">
              <Controller
                control={form.control}
                name={`sizes.${index}.name`}
                render={({ field }) => (
                  <Input placeholder="Nome (ex: Pequeno)" {...field} />
                )}
              />
              <Controller
                control={form.control}
                name={`sizes.${index}.price`}
                render={({ field }) => (
                  <Input
                    type="number"
                    placeholder="Preço"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const parsed = parseFloat(e.target.value);
                      field.onChange(isNaN(parsed) ? 0 : parsed);
                    }}
                  />
                )}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeSize(index)}
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendSize({ name: "", price: 0 })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Tamanho
          </Button>
        </div>

        {/* Seção de Extras */}
        <div className="space-y-4">
          <FormLabel>Extras</FormLabel>
          {extraFields.map((field, index) => (
            <div key={field.id} className="flex items-end space-x-2">
              <Controller
                control={form.control}
                name={`extras.${index}.name`}
                render={({ field }) => (
                  <Input placeholder="Nome (ex: Queijo Extra)" {...field} />
                )}
              />
              <Controller
                control={form.control}
                name={`extras.${index}.price`}
                render={({ field }) => (
                  <Input
                    type="number"
                    placeholder="Preço"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const parsed = parseFloat(e.target.value);
                      field.onChange(isNaN(parsed) ? 0 : parsed);
                    }}
                  />
                )}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeExtra(index)}
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendExtra({ name: "", price: 0 })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Extra
          </Button>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending
            ? "Salvando..."
            : product
            ? "Atualizar Produto"
            : "Criar Produto"}
        </Button>
      </form>
    </Form>
  );
};

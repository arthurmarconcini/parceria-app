"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createProduct, updateProduct } from "../actions/product"; // Importando as actions corretas
import { useRouter } from "next/navigation";
import { Category } from "@prisma/client";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { CurrencyInput } from "@/components/ui/currency-input";
import { productSchema, ProductFormValues } from "@/lib/schemas"; // Schema (output type)
import { ProductWithRelations } from "./ProductClient";
import { z } from "zod";
import { useEffect, useState } from "react";

// Tipo para os dados de ENTRADA do formulário, antes da validação do Zod.
type ProductFormInput = z.input<typeof productSchema>;

interface ProductFormProps {
  product?: ProductWithRelations | null; // Produto a ser editado, se houver
  categories: Category[];
  onSuccess: () => void; // Callback opcional para sucesso
}

export function ProductForm({
  product,
  categories,
  onSuccess,
}: ProductFormProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  // Os valores padrão devem corresponder ao tipo de ENTRADA do formulário.
  const defaultValues: ProductFormInput = {
    name: product?.name ?? "",
    description: product?.description ?? "",
    categoryId: product?.categoryId ?? "",
    imageUrl: product?.imageUrl ?? "",
    price: product?.price ? Number(product.price) : null,
    discount: product?.discount ?? 0,
    isHalfHalf: product?.isHalfHalf ?? false,
    sizes: product?.Size.map((s) => ({ ...s, price: Number(s.price) })) ?? [],
    extras:
      product?.Extras?.map((e) => ({ ...e, price: Number(e.price) })) ?? [],
  };

  const form = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues,
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

  const watchSizes = form.watch("sizes");
  const isPriceDisabled = Array.isArray(watchSizes) && watchSizes.length > 0;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    toast.info("Enviando imagem...");

    try {
      const presignedUrlResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      if (!presignedUrlResponse.ok) {
        throw new Error("Falha ao obter URL para upload.");
      }

      const { url, publicUrl } = await presignedUrlResponse.json();

      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error("Falha ao enviar imagem para o S3.");
      }

      form.setValue("imageUrl", publicUrl, { shouldValidate: true });
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erro no upload da imagem."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // A função onSubmit agora chama a action correta (create ou update).
  async function onSubmit(data: ProductFormValues) {
    try {
      let response;
      if (product) {
        // Chama a action de atualização se um produto existente for fornecido.
        response = await updateProduct(product.id, data);
      } else {
        // Chama a action de criação para um novo produto.
        response = await createProduct(data);
      }

      if (response.success) {
        onSuccess();
        toast.success(response.message);
        router.push("/loja/produtos");
        router.refresh();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
      toast.error(errorMessage);
    }
  }

  // Efeito para resetar e popular o formulário quando o produto selecionado mudar.
  useEffect(() => {
    if (product) {
      // Se um produto for passado, calcula os valores e reseta o formulário com eles.
      const formValues: ProductFormInput = {
        name: product.name ?? "",
        description: product.description ?? "",
        categoryId: product.categoryId ?? "",
        imageUrl: product.imageUrl ?? "",
        price: product.price && product.Size ? Number(product.price) : null,
        discount: product.discount ?? 0,
        isHalfHalf: product.isHalfHalf ?? false,
        sizes:
          product.Size.map((s) => ({ ...s, price: Number(s.price) })) ?? [],
        extras:
          product.Extras?.map((e) => ({ ...e, price: Number(e.price) })) ?? [],
      };
      form.reset(formValues);
    } else {
      // Se nenhum produto for passado (modo de criação), reseta para os valores vazios.
      form.reset({
        name: "",
        description: "",
        categoryId: "",
        imageUrl: "",
        price: null,
        discount: 0,
        isHalfHalf: false,
        sizes: [],
        extras: [],
      });
    }
  }, [product, form]);

  useEffect(() => {
    if (isPriceDisabled) {
      form.setValue("price", null);
    }
  }, [isPriceDisabled, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Seção da Imagem */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagem do Produto</FormLabel>
              <div className="flex items-center gap-4">
                {field.value ? (
                  <Image
                    src={field.value}
                    alt={form.watch("name") || "Imagem do produto"}
                    width={80}
                    height={80}
                    className="rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-md bg-accent">
                    <span className="text-sm text-muted-foreground text-center">
                      Sem imagem
                    </span>
                  </div>
                )}
                <FormControl>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full"
                    disabled={isUploading}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do produto" {...field} />
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
                <Textarea
                  placeholder="Descreva o produto"
                  className="resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Controller
            name="price"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço Base</FormLabel>
                <FormControl>
                  <CurrencyInput
                    placeholder="R$ 0,00"
                    value={
                      typeof field.value === "number" ? field.value : undefined
                    }
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    name={field.name}
                    disabled={isPriceDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
          />
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desconto %</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0"
                    type="number"
                    {...field}
                    value={String(field.value ?? 0)}
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
                  <FormLabel className="text-base">
                    Permitir Meio a Meio
                  </FormLabel>
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
        </div>

        {/* Seção de Tamanhos */}
        <div>
          <h3 className="mb-4 text-lg font-medium">Tamanhos (opcional)</h3>
          {sizeFields.map((item, index) => (
            <div
              key={item.id}
              className="mb-4 grid grid-cols-1 items-start gap-4 rounded-md border p-4 md:grid-cols-[1fr_1fr_auto]"
            >
              <FormField
                control={form.control}
                name={`sizes.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Grande" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Controller
                name={`sizes.${index}.price`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder="R$ 0,00"
                        value={
                          typeof field.value === "number"
                            ? field.value
                            : undefined
                        }
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex h-full items-end">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeSize(index)}
                  className="w-full md:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => appendSize({ name: "", price: 0 })}
          >
            Adicionar Tamanho
          </Button>
        </div>

        {/* Seção de Extras */}
        <div>
          <h3 className="mb-4 text-lg font-medium">Extras (opcional)</h3>
          {extraFields.map((item, index) => (
            <div
              key={item.id}
              className="mb-4 grid grid-cols-1 items-start gap-4 rounded-md border p-4 md:grid-cols-[1fr_1fr_auto]"
            >
              <FormField
                control={form.control}
                name={`extras.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Bacon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Controller
                name={`extras.${index}.price`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder="R$ 0,00"
                        value={
                          typeof field.value === "number"
                            ? field.value
                            : undefined
                        }
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex h-full items-end">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeExtra(index)}
                  className="w-full md:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => appendExtra({ name: "", price: 0 })}
          >
            Adicionar Extra
          </Button>
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Salvando..."
            : product
            ? "Salvar Alterações"
            : "Criar Produto"}
        </Button>
      </form>
    </Form>
  );
}

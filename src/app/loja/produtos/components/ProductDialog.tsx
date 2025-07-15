"use client";

import { useState, useEffect, useTransition, useCallback } from "react"; // 1. Importar useCallback
import { Category, Product, Extra, Size } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, PlusCircle, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { addProduct, updateProduct } from "../actions/product";
import { formatBRL } from "@/helpers/currency-format";
import { productSchema } from "@/lib/schemas";
import { NativeSelect } from "@/components/ui/native-select";

interface ProductDialogProps {
  categories: Category[];
  productToEdit?: Product & { Extras: Extra[]; Size: Size[] };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

interface SizeInput {
  name: string;
  price: string;
}

interface ExtraInput {
  name: string;
  price: string;
}

type FormErrors = { [key: string]: string | undefined };

export default function AddProduct({
  categories,
  productToEdit,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: ProductDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;

  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isHalfHalf, setIsHalfHalf] = useState(false);
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [sizes, setSizes] = useState<SizeInput[]>([]);
  const [extras, setExtras] = useState<ExtraInput[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const isEditing = !!productToEdit;
  const selectedCategory = categories.find((cat) => cat.id === categoryId);
  const isPizzaCategory = selectedCategory?.name.toLowerCase() === "pizzas";

  // 2. Envolver a função resetForm com useCallback
  const resetForm = useCallback(() => {
    setName("");
    setDescription("");
    setImageUrl("");
    setCategoryId(categories[0]?.id || "");
    setIsHalfHalf(false);
    setPrice("");
    setDiscount("0");
    setSizes([]);
    setExtras([]);
    setErrors({});
  }, [categories]);

  // Preenche o formulário para edição ou reseta
  useEffect(() => {
    if (open && isEditing) {
      setName(productToEdit.name);
      setDescription(productToEdit.description || "");
      setImageUrl(productToEdit.imageUrl || "");
      setCategoryId(productToEdit.categoryId);
      setIsHalfHalf(productToEdit.isHalfHalf || false);
      setPrice(productToEdit.price ? formatBRL(productToEdit.price) : "");
      setDiscount(String(productToEdit.discount || "0"));
      setSizes(
        productToEdit.Size.map((s) => ({
          name: s.name,
          price: formatBRL(s.price),
        }))
      );
      setExtras(
        productToEdit.Extras.map((e) => ({
          name: e.name,
          price: formatBRL(e.price),
        }))
      );
    } else if (!open) {
      resetForm();
    }
    // 3. Adicionar resetForm ao array de dependências
  }, [open, isEditing, productToEdit, resetForm]);

  const applyCurrencyMask = (value: string): string => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue === "") return "";
    return formatBRL(parseFloat(numericValue) / 100);
  };

  const addSize = () => setSizes((prev) => [...prev, { name: "", price: "" }]);
  const removeSize = (index: number) =>
    setSizes((prev) => prev.filter((_, i) => i !== index));
  const updateSizeField = (
    index: number,
    field: keyof SizeInput,
    value: string
  ) => {
    const newSizes = [...sizes];
    newSizes[index][field] =
      field === "price" ? applyCurrencyMask(value) : value;
    setSizes(newSizes);
  };

  const addExtra = () =>
    setExtras((prev) => [...prev, { name: "", price: "" }]);
  const removeExtra = (index: number) =>
    setExtras((prev) => prev.filter((_, i) => i !== index));
  const updateExtraField = (
    index: number,
    field: keyof ExtraInput,
    value: string
  ) => {
    const newExtras = [...extras];
    newExtras[index][field] =
      field === "price" ? applyCurrencyMask(value) : value;
    setExtras(newExtras);
  };

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

      if (!presignedUrlResponse.ok)
        throw new Error("Falha ao obter URL para upload.");

      const { url, publicUrl } = await presignedUrlResponse.json();

      await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      setImageUrl(publicUrl);
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro no upload da imagem."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      name,
      description,
      imageUrl,
      categoryId,
      isHalfHalf,
      price: price,
      discount: discount || "0",
      sizes,
      extras,
      isPizzaCategory,
    };

    const validationResult = productSchema.safeParse(formData);

    if (!validationResult.success) {
      const fieldErrors: FormErrors = {};
      validationResult.error.errors.forEach((err) => {
        const path = err.path.join("_");
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      toast.error("Formulário inválido", {
        description: "Por favor, corrija os campos destacados.",
      });
      return;
    }

    startTransition(() => {
      const promise = isEditing
        ? updateProduct(productToEdit!.id, validationResult.data)
        : addProduct(validationResult.data);

      toast.promise(promise, {
        loading: isEditing
          ? "Atualizando produto..."
          : "Adicionando produto...",
        success: (result) => {
          if (!result.success) throw new Error(result.error);
          setOpen(false);
          router.refresh();
          return `Produto ${
            isEditing ? "atualizado" : "adicionado"
          } com sucesso!`;
        },
        error: (err) => err.message || "Falha na operação.",
      });
    });
  };

  const dialogContent = (
    <DialogContent className="max-w-4xl h-full sm:h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Produto" : "Adicionar Novo Produto"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Altere os detalhes do produto."
            : "Preencha os detalhes para cadastrar um novo item no cardápio."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={validateAndSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome do Produto</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && (
                  <p className="text-destructive text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="categoryId">Categoria</Label>
                <NativeSelect
                  id="categoryId"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="" disabled>
                    Selecione uma categoria
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </NativeSelect>
                {errors.categoryId && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.categoryId}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ingredientes e detalhes do produto..."
              />
              {errors.description && (
                <p className="text-destructive text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Imagem do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Prévia"
                  width={80}
                  height={80}
                  className="rounded-md object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-md border bg-muted">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="image-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Envie uma imagem para o produto (PNG, JPG, WEBP).
                </p>
              </div>
            </div>
            {isUploading && (
              <p className="text-sm text-primary mt-2">Enviando...</p>
            )}
            {errors.imageUrl && (
              <p className="text-destructive text-sm mt-1">{errors.imageUrl}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preços e Opções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price">Preço Base</Label>
                <Input
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(applyCurrencyMask(e.target.value))}
                  disabled={isPizzaCategory}
                  placeholder={
                    isPizzaCategory ? "Definido por tamanho" : "R$ 0,00"
                  }
                />
                {errors.price && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.price}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="discount">Desconto (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            {isPizzaCategory && (
              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id="isHalfHalf"
                  checked={isHalfHalf}
                  onCheckedChange={(checked) => setIsHalfHalf(!!checked)}
                />
                <Label htmlFor="isHalfHalf" className="cursor-pointer">
                  Permitir meio a meio?
                </Label>
              </div>
            )}
          </CardContent>
        </Card>

        {isPizzaCategory && (
          <Card>
            <CardHeader>
              <CardTitle>Tamanhos da Pizza</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="space-y-3">
                {sizes.map((size, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div className="flex-1 space-y-1.5">
                      <Label htmlFor={`size-name-${index}`}>
                        Nome do Tamanho
                      </Label>
                      <Input
                        id={`size-name-${index}`}
                        placeholder="Ex: Média"
                        value={size.name}
                        onChange={(e) =>
                          updateSizeField(index, "name", e.target.value)
                        }
                      />
                      {errors[`sizes_${index}_name`] && (
                        <p className="text-destructive text-sm mt-1">
                          {errors[`sizes_${index}_name`]}
                        </p>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <Label htmlFor={`size-price-${index}`}>Preço</Label>
                      <Input
                        id={`size-price-${index}`}
                        placeholder="R$ 0,00"
                        value={size.price}
                        onChange={(e) =>
                          updateSizeField(index, "price", e.target.value)
                        }
                      />
                      {errors[`sizes_${index}_price`] && (
                        <p className="text-destructive text-sm mt-1">
                          {errors[`sizes_${index}_price`]}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeSize(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSize}
                className="mt-4"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Tamanho
              </Button>
              {errors.sizes && (
                <p className="text-destructive text-sm mt-1">{errors.sizes}</p>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Extras do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="space-y-3">
              {extras.map((extra, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor={`extra-name-${index}`}>Nome do Extra</Label>
                    <Input
                      id={`extra-name-${index}`}
                      placeholder="Ex: Bacon"
                      value={extra.name}
                      onChange={(e) =>
                        updateExtraField(index, "name", e.target.value)
                      }
                    />
                    {errors[`extras_${index}_name`] && (
                      <p className="text-destructive text-sm mt-1">
                        {errors[`extras_${index}_name`]}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor={`extra-price-${index}`}>Preço</Label>
                    <Input
                      id={`extra-price-${index}`}
                      placeholder="R$ 0,00"
                      value={extra.price}
                      onChange={(e) =>
                        updateExtraField(index, "price", e.target.value)
                      }
                    />
                    {errors[`extras_${index}_price`] && (
                      <p className="text-destructive text-sm mt-1">
                        {errors[`extras_${index}_price`]}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeExtra(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addExtra}
              className="mt-4"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Extra
            </Button>
          </CardContent>
        </Card>
      </form>
      <DialogFooter className="pt-6 mt-4 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpen(false)}
          disabled={isPending || isUploading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending || isUploading}
          form="product-form"
        >
          {isPending
            ? "Salvando..."
            : isUploading
            ? "Aguardando imagem..."
            : isEditing
            ? "Salvar Alterações"
            : "Salvar Produto"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Produto
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}

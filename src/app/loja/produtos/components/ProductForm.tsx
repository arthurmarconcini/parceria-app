"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Category } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { NativeSelect } from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Trash2, PlusCircle, Loader2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { createProduct } from "../actions/product"; // Server Action
import { ProductFormValues, productSchema } from "@/lib/schemas";

interface ProductFormProps {
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormErrors = { [key: string]: string | undefined };

export function ProductForm({
  categories,
  open,
  onOpenChange,
}: ProductFormProps) {
  const initialFormState: ProductFormValues = {
    name: "",
    description: "",
    categoryId: "",
    imageUrl: "",
    price: null,
    discount: 0,
    isHalfHalf: false,
    sizes: [],
    extras: [],
  };

  const [formData, setFormData] = useState<ProductFormValues>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const selectedCategory = categories.find(
    (cat) => cat.id === formData.categoryId
  );
  const hasSizes = formData.sizes && formData.sizes.length > 0;

  const formatToBRL = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, "");
    if (!digitsOnly) return "";
    const numberValue = parseInt(digitsOnly, 10) / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numberValue);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
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

      setFormData((prev) => ({ ...prev, imageUrl: publicUrl }));
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erro no upload da imagem."
      );
      setImageFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    e.preventDefault();
    const { name, value } = e.target;

    if (name === "price") {
      const digitsOnly = value.replace(/\D/g, "");
      const numberValue = digitsOnly
        ? parseInt(digitsOnly, 10) / 100
        : undefined;
      setFormData((prev) => ({ ...prev, [name]: numberValue }));
      return;
    }

    if (name === "categoryId") {
      const selectedCategory = categories.find((cat) => cat.id === value);

      const shouldBeHalfHalf =
        selectedCategory?.name.toLowerCase() === "pizzas";

      setFormData((prev) => ({
        ...prev,
        categoryId: value,
        isHalfHalf: shouldBeHalfHalf,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isHalfHalf: checked }));
  };

  const handleDynamicListChange = (
    listName: "sizes" | "extras",
    index: number,
    field: "name" | "price",
    value: string
  ) => {
    const newList = [...(formData[listName] || [])];
    const processedValue = field === "price" ? formatToBRL(value) : value;
    const currentItem = newList[index] || {};
    newList[index] = { ...currentItem, [field]: processedValue };
    setFormData((prev) => ({ ...prev, [listName]: newList }));
  };

  const addDynamicListItem = (listName: "sizes" | "extras") => {
    setFormData((prev) => ({
      ...prev,
      price: prev.price && null,
      [listName]: [...(prev[listName] || []), { name: "", price: "" }],
    }));
  };

  const removeDynamicListItem = (
    listName: "sizes" | "extras",
    index: number
  ) => {
    const newList = [...(formData[listName] || [])];
    newList.splice(index, 1);
    setFormData((prev) => ({ ...prev, [listName]: newList }));
  };

  const validateForm = (): boolean => {
    const result = productSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join(".");
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      toast.error("Por favor, corrija os erros no formulário.");
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      await createProduct(formData);
      toast.success("Produto criado com sucesso!");
      onOpenChange(false);
      setFormData(initialFormState);
      setImageFile(null);
      setErrors({});
      router.refresh();
    } catch (error) {
      toast.error(
        (error as Error).message || "Ocorreu um erro ao criar o produto."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Produto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="max-h-[70vh] overflow-y-auto p-1 pr-4">
            {/* Seção de Informações */}
            <h3 className="text-lg font-semibold mb-2">Informações</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Pizza de Calabresa"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoria</Label>
                <NativeSelect
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </NativeSelect>
                {errors.categoryId && (
                  <p className="text-sm text-red-500">{errors.categoryId}</p>
                )}
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva o produto..."
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <Separator className="my-6" />

            <div className="space-y-1.5">
              <Label htmlFor="image-upload">Imagem do Produto</Label>

              <div className="flex items-center gap-4">
                <label htmlFor="image-upload" className="flex-1 cursor-pointer">
                  <div className="flex h-20 w-full items-center justify-center rounded-md border-2 border-dashed border-input p-4 text-center text-muted-foreground hover:border-primary">
                    {imageFile ? (
                      <p className="truncate">{imageFile.name}</p>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <UploadCloud className="h-6 w-6" />

                        <span>Clique para selecionar</span>
                      </div>
                    )}
                  </div>
                </label>

                <Input
                  id="image-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  disabled={isUploading}
                />

                {formData.imageUrl && (
                  <Image
                    src={formData.imageUrl}
                    alt="Previa da imagem"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    width={60}
                    height={60}
                  />
                )}
              </div>

              {errors.imageUrl && (
                <p className="text-destructive text-sm mt-1">
                  {errors.imageUrl}
                </p>
              )}
            </div>

            <Separator className="my-6" />

            {/* Seção de Preço */}
            <h3 className="text-lg font-semibold mb-2">Preço e Desconto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!hasSizes && (
                <div className="space-y-2">
                  <Label htmlFor="price">Preço Base (R$)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="text"
                    value={
                      formData.price !== undefined
                        ? formatToBRL(String(formData.price))
                        : ""
                    }
                    onChange={handleInputChange}
                    placeholder="R$ 0,00"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price}</p>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="discount">Desconto (%)</Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={handleInputChange}
                  placeholder="Ex: 10"
                />
                {errors.discount && (
                  <p className="text-sm text-red-500">{errors.discount}</p>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Seção de Configurações */}
            <h3 className="text-lg font-semibold mb-2">
              Configurações Adicionais
            </h3>
            {selectedCategory?.name.toLowerCase() === "pizzas" && (
              <div className="flex items-center space-x-2 border p-4 rounded-md">
                <Checkbox
                  id="isHalfHalf"
                  checked={formData.isHalfHalf}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="isHalfHalf">Permitir Meio a Meio</Label>
              </div>
            )}

            {/* Seção de Tamanhos */}
            <div className="mt-6">
              <h4 className="font-semibold">Tamanhos</h4>
              {(formData.sizes || []).map((size, index) => (
                <div
                  key={index}
                  className="flex items-end gap-2 mt-2 p-2 border rounded-md"
                >
                  <div className="flex-1 space-y-2">
                    <Label>Nome</Label>
                    <Input
                      placeholder="Pequeno"
                      value={size.name}
                      onChange={(e) =>
                        handleDynamicListChange(
                          "sizes",
                          index,
                          "name",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Preço (R$)</Label>
                    <Input
                      name="price"
                      placeholder="R$ 0,00"
                      value={size.price || ""}
                      onChange={(e) =>
                        handleDynamicListChange(
                          "sizes",
                          index,
                          "price",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeDynamicListItem("sizes", index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => addDynamicListItem("sizes")}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Tamanho
              </Button>
            </div>

            {/* Seção de Extras */}
            <div className="mt-6">
              <h4 className="font-semibold">Extras</h4>
              {(formData.extras || []).map((extra, index) => (
                <div
                  key={index}
                  className="flex items-end gap-2 mt-2 p-2 border rounded-md"
                >
                  <div className="flex-1 space-y-2">
                    <Label>Nome</Label>
                    <Input
                      placeholder="Borda de Catupiry"
                      value={extra.name}
                      onChange={(e) =>
                        handleDynamicListChange(
                          "extras",
                          index,
                          "name",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Preço (R$)</Label>
                    <Input
                      name="price"
                      placeholder="R$ 0,00"
                      value={extra.price || ""}
                      onChange={(e) =>
                        handleDynamicListChange(
                          "extras",
                          index,
                          "price",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeDynamicListItem("extras", index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => addDynamicListItem("extras")}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Extra
              </Button>
            </div>
          </div>
          <DialogFooter className="pt-6">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData(initialFormState);
                  setImageFile(null);
                  setErrors({});
                }}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salvar Produto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

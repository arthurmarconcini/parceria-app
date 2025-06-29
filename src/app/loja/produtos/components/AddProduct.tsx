"use client";

import { useState } from "react";
import { Category } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, PlusCircle, UploadCloud } from "lucide-react";
import { ZodError } from "zod";

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
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { addProduct } from "../actions/product";
import { formatBRL } from "@/helpers/currency-format";
import { productSchema } from "@/lib/schemas";
import Image from "next/image";

interface AddProductProps {
  categories: Category[];
}

interface SizeInput {
  name: string;
  price: string;
}

type FormErrors = { [key: string]: string | undefined };

export default function AddProduct({ categories }: AddProductProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [isHalfHalf, setIsHalfHalf] = useState(false);
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [sizes, setSizes] = useState<SizeInput[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const selectedCategory = categories.find((cat) => cat.id === categoryId);
  const isPizzaCategory = selectedCategory?.name.toLowerCase() === "pizzas";

  const resetForm = () => {
    setName("");
    setDescription("");
    setImageUrl("");
    setImageFile(null);
    setCategoryId("");
    setIsHalfHalf(false);
    setPrice("");
    setDiscount("0");
    setSizes([]);
    setErrors({});
  };

  const applyCurrencyMask = (value: string): string => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue === "") {
      return "";
    }
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setIsUploading(true);
    toast.info("Enviando imagem...");

    try {
      // 1. Obter a URL pré-assinada da nossa API
      const presignedUrlResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!presignedUrlResponse.ok) {
        throw new Error("Falha ao obter URL para upload.");
      }

      const { url, publicUrl } = await presignedUrlResponse.json();

      // 2. Enviar o arquivo para a URL pré-assinada do S3
      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error("Falha ao enviar imagem para o S3.");
      }

      // 3. Salvar a URL pública final no estado
      setImageUrl(publicUrl);
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erro no upload da imagem."
      );
      setImageFile(null); // Limpa o arquivo se der erro
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

    setLoading(true);

    const promise = addProduct(validationResult.data);

    toast.promise(promise, {
      loading: "Adicionando produto...",
      success: (result) => {
        if (!result.success) {
          throw new Error(result.error);
        }
        resetForm();
        setOpen(false);
        router.refresh();
        return "Produto adicionado com sucesso!";
      },
      error: (err: ZodError) => {
        setLoading(false);
        return err.message || "Falha ao adicionar produto.";
      },
      finally: () => {
        setLoading(false);
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Produto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Adicionar um novo produto</DialogTitle>
        </DialogHeader>
        <form onSubmit={validateAndSubmit}>
          <ScrollArea className="max-h-[70vh] p-1">
            <div className="space-y-4 px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nome do Produto</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="categoryId">Categoria</Label>
                  <select
                    id="categoryId"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-9 min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
                    "
                  >
                    <option value="" disabled>
                      Selecione uma categoria
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.categoryId}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price">Preço Base</Label>
                  <Input
                    id="price"
                    value={price}
                    onChange={(e) =>
                      setPrice(applyCurrencyMask(e.target.value))
                    }
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

              <div className="space-y-1.5">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ingredientes e detalhes"
                />
                {errors.description && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="imageUrl">URL da Imagem (opcional)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
                {errors.imageUrl && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.imageUrl}
                  </p>
                )}
              </div>

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

              {isPizzaCategory && (
                <div className="space-y-4 pt-2">
                  <Label className="font-semibold">Tamanhos da Pizza</Label>
                  {sizes.map((size, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="flex-1 space-y-1.5">
                        <Input
                          placeholder={`Nome (Ex: Média)`}
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
                        <Input
                          placeholder="Preço"
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSize}
                  >
                    Adicionar Tamanho
                  </Button>
                  {errors.sizes && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.sizes}
                    </p>
                  )}
                </div>
              )}
            </div>
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
                {imageUrl && (
                  <Image
                    src={imageUrl}
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
          </ScrollArea>
          <DialogFooter className="pt-4 mt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

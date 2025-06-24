"use client";

import { useState } from "react";
import { Category } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, PlusCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { addProduct } from "../actions/product";
import { formatBRL } from "@/helpers/currency-format";
import { productSchema } from "@/lib/schemas";

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
  const [imageUrl, setImageUrl] = useState("");
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
                <div>
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
                <div>
                  <Label htmlFor="categoryId">Categoria</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.categoryId}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
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
                <div>
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

              <div>
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

              <div>
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
                      <div className="flex-1">
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
                      <div className="flex-1">
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

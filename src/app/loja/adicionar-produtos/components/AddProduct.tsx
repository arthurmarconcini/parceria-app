"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useState } from "react";
import { addProduct } from "../actions/product";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import { Category } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { formatBRL, parseBRL } from "@/helpers/currency-format";

interface AddProductProps {
  categories: Category[];
}

interface SizeInput {
  name: string;
  price: string;
}

const AddProduct = ({ categories }: AddProductProps) => {
  const [data, setData] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
    categoryId: "",
    discount: "",
    isHalfHalf: false,
  });
  const [sizes, setSizes] = useState<SizeInput[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const selectedCategory = categories.find((cat) => cat.id === data.categoryId);
  const isPizzaCategory = selectedCategory?.name.toLowerCase() === "pizzas";

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!data.name.trim()) newErrors.name = "O nome é obrigatório";
    if (!data.categoryId) newErrors.categoryId = "Selecione uma categoria";
    if (!isPizzaCategory) {
      if (!data.price) newErrors.price = "O preço é obrigatório";
      else if (
        isNaN(Number(parseBRL(data.price))) ||
        Number(parseBRL(data.price)) <= 0
      )
        newErrors.price = "Preço inválido";
    }
    if (
      data.discount &&
      (isNaN(Number(parseBRL(data.discount))) ||
        Number(parseBRL(data.discount)) < 0)
    )
      newErrors.discount = "Desconto inválido";
    if (isPizzaCategory && sizes.length === 0)
      newErrors.sizes = "Pelo menos um tamanho é obrigatório para pizzas";
    sizes.forEach((size, index) => {
      if (!size.name.trim())
        newErrors[`sizeName${index}`] = `Nome do tamanho ${
          index + 1
        } é obrigatório`;
      if (!size.price || isNaN(Number(size.price)))
        newErrors[`sizePrice${index}`] = `Preço do tamanho ${
          index + 1
        } é inválido`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMoneyChange = (
    field: "price" | "discount",
    value: string,
    sizeIndex?: number
  ) => {
    if (sizeIndex !== undefined) {
      const newSizes = [...sizes];
      newSizes[sizeIndex] = { ...newSizes[sizeIndex], price: value };
      setSizes(newSizes);
    } else {
      setData({ ...data, [field]: value });
    }
  };

  // Adicionar um novo tamanho
  const addSize = () => {
    setSizes([...sizes, { name: "", price: "" }]);
  };

  // Remover um tamanho
  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  // Atualizar um tamanho
  const updateSize = (
    index: number,
    field: "name" | "price",
    value: string
  ) => {
    const newSizes = [...sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setSizes(newSizes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast("Erro de validação", {
        style: {
          background: "red",
          color: "white",
        },
        description: "Por favor, corrija os erros no formulário.",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await addProduct({
        name: data.name,
        price: isPizzaCategory ? null : Number(parseBRL(data.price)),
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        categoryId: data.categoryId,
        discount: data.discount ? Number(parseBRL(data.discount)) : null,
        isHalfHalf: data.isHalfHalf,
        sizes: isPizzaCategory
          ? sizes.map((size) => ({
              name: size.name,
              price: Number(parseBRL(size.price)),
            }))
          : [],
      });

      if (result.success) {
        toast("Sucesso", {
          style: {
            background: "green",
            color: "white",
          },
          description: "Produto adicionado com sucesso!",
        });
        setOpen(false); // Fechar o Dialog
        setData({
          name: "",
          price: "",
          description: "",
          imageUrl: "",
          categoryId: "",
          discount: "",
          isHalfHalf: false,
        }); // Resetar o formulário
        setSizes([]);
      } else {
        toast("Erro interno", {
          description: result.error || "Falha ao adicionar o produto.",
          style: {
            background: "red",
            color: "white",
          },
        });
      }
    } catch (error) {
      toast("Erro inesperado", {
        description: "Ocorreu um erro inesperado. Tente novamente.",
        style: {
          background: "red",
          color: "white",
        },
      });

      console.error("Erro ao adicionar produto:", error);
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">Adicionar produto</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar um produto à loja</DialogTitle>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-8">
            <div>
              <Input
                placeholder="Nome"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>
            <div>
              <Input
                type="text"
                placeholder="Preço (obrigatório)"
                value={data.price ? formatBRL(parseBRL(data.price)) : ""}
                onChange={(e) => handleMoneyChange("price", e.target.value)}
                disabled={isPizzaCategory}
              />
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price}</p>
              )}
            </div>
            <Input
              placeholder="Descrição (opcional)"
              value={data.description}
              onChange={(e) =>
                setData({ ...data, description: e.target.value })
              }
            />
            <Input
              placeholder="URL da imagem (opcional)"
              type="url"
              value={data.imageUrl}
              onChange={(e) => setData({ ...data, imageUrl: e.target.value })}
            />
            <div>
              <Input
                type="text"
                placeholder="Desconto (opcional)"
                value={data.discount ? formatBRL(parseBRL(data.discount)) : ""}
                onChange={(e) => handleMoneyChange("discount", e.target.value)}
              />
              {errors.discount && (
                <p className="text-red-500 text-sm">{errors.discount}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={data.isHalfHalf}
                onCheckedChange={(checked) =>
                  setData({ ...data, isHalfHalf: !!checked })
                }
              />
              <label>Produto meio a meio</label>
            </div>
            <div>
              <select
                className="w-full p-2 border rounded-md text-sm text-foreground dark:bg-input/30 placeholder:text-muted-foreground"
                value={data.categoryId}
                onChange={(e) => {
                  if (e.target.value !== data.categoryId) {
                    setData({ ...data, categoryId: e.target.value });

                    const newCategory = categories.find(
                      (category) => category.id === e.target.value
                    );
                    if (newCategory?.name.toLocaleLowerCase() === "pizzas") {
                      setData({
                        ...data,
                        categoryId: e.target.value,
                        isHalfHalf: true,
                      });
                    } else {
                      setSizes([]);
                    }
                  }
                }}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {/* <Select
                value={data.categoryId}
                onValueChange={(value) => {
                  // Só atualiza se o valor mudou
                  if (value !== data.categoryId) {
                    setData({ ...data, categoryId: value });
                    // Limpa tamanhos apenas se a nova categoria não for "Pizzas"
                    const newCategory = categories.find(
                      (cat) => cat.id === value
                    );
                    if (newCategory?.name.toLowerCase() !== "pizzas") {
                      setSizes([]);
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select> */}
              {errors.categoryId && (
                <p className="text-red-500 text-sm">{errors.categoryId}</p>
              )}
            </div>

            {isPizzaCategory && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="font-semibold">Tamanhos</label>
                  <Button type="button" onClick={addSize} variant="outline">
                    Adicionar tamanho
                  </Button>
                </div>
                {sizes.map((size, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Input
                        placeholder={`Nome do tamanho ${index + 1}`}
                        value={size.name}
                        onChange={(e) =>
                          updateSize(index, "name", e.target.value)
                        }
                      />
                      {errors[`sizeName${index}`] && (
                        <p className="text-red-500 text-sm">
                          {errors[`sizeName${index}`]}
                        </p>
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder={`Preço do tamanho ${index + 1}`}
                        value={
                          size.price ? formatBRL(parseBRL(size.price)) : ""
                        }
                        onChange={(e) =>
                          handleMoneyChange("price", e.target.value, index)
                        }
                      />
                      {errors[`sizePrice${index}`] && (
                        <p className="text-red-500 text-sm">
                          {errors[`sizePrice${index}`]}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeSize(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {errors.sizes && (
                  <p className="text-red-500 text-sm">{errors.sizes}</p>
                )}
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Adicionando..." : "Adicionar"}
            </Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AddProduct;

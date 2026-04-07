"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Product } from "@/types/product";
import {
  useCreateProduct,
  useUpdateProduct,
  useArchiveProduct,
} from "@/hooks/use-admin-products";
import { useAdminArtists } from "@/hooks/use-admin-artists";
import { useImageUpload } from "@/hooks/use-image-upload";

interface ProductFormProps {
  product?: Product;
}

interface AttributeRow {
  type: string;
  values: string;
}

interface VariantRow {
  sku: string;
  attributes: string;
  priceModifier: number;
  stock: number;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  basePrice?: string;
  images?: string;
  variants?: string;
  variantRows?: Record<number, { sku?: string; attributes?: string; stock?: string }>;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!product;

  // Form state — null-safe defaults
  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEditable, setSlugEditable] = useState(!isEdit);
  const [slugError, setSlugError] = useState("");
  const [description, setDescription] = useState(product?.description ?? "");
  const [basePrice, setBasePrice] = useState<number>(product?.basePrice ?? 0);
  const [artistId, setArtistId] = useState(product?.artistId ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [attributes, setAttributes] = useState<AttributeRow[]>(
    product?.attributes?.map((a) => ({
      type: a.type ?? "",
      values: a.values?.join(", ") ?? "",
    })) ?? []
  );
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants?.map((v) => ({
      sku: v.sku ?? "",
      attributes: v.attributes
        ? Object.entries(v.attributes)
            .map(([k, val]) => `${k}: ${val}`)
            .join(", ")
        : "",
      priceModifier: v.priceModifier ?? 0,
      stock: v.stock ?? 0,
    })) ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Hooks
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const archiveProduct = useArchiveProduct();
  const imageUpload = useImageUpload();
  const { data: artistsData } = useAdminArtists({ size: 100 });

  const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  const UA_TRANSLIT: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ye",
    ж: "zh", з: "z", и: "y", і: "i", ї: "yi", й: "y", к: "k", л: "l",
    м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
    ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ь: "",
    ю: "yu", я: "ya",
  };

  const transliterate = (text: string): string =>
    text
      .toLowerCase()
      .split("")
      .map((ch) => UA_TRANSLIT[ch] ?? ch)
      .join("")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const validateSlug = (value: string) => {
    if (!value) {
      setSlugError("");
      return true;
    }
    if (!SLUG_REGEX.test(value)) {
      setSlugError("Тільки a-z, 0-9 та дефіс. Без пробілів та кирилиці.");
      return false;
    }
    setSlugError("");
    return true;
  };

  const handleSlugChange = (value: string) => {
    const normalized = value.toLowerCase().replace(/\s+/g, "-");
    setSlug(normalized);
    validateSlug(normalized);
  };

  const generateSlug = () => {
    const generated = transliterate(title);
    setSlug(generated);
    setSlugError("");
    if (isEdit) setSlugEditable(true);
  };

  const parseAttributes = () =>
    attributes
      .filter((a) => a.type.trim())
      .map((a) => ({
        type: a.type.trim(),
        values: a.values
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      }));

  const parseVariants = () =>
    variants
      .filter((v) => v.sku.trim())
      .map((v) => ({
        sku: v.sku.trim(),
        attributes: Object.fromEntries(
          v.attributes
            .split(",")
            .map((pair) => pair.split(":").map((s) => s.trim()))
            .filter(([k, val]) => k && val)
        ),
        priceModifier: v.priceModifier ?? 0,
        stock: v.stock ?? 0,
      }));

  const buildPayload = () => ({
    title,
    slug: slug || undefined,
    description: description || undefined,
    basePrice,
    artistId: artistId || undefined,
    images,
    attributes: parseAttributes(),
    variants: parseVariants(),
    ...(isEdit && product?.status && product.status !== "ARCHIVED"
      ? { status: product.status }
      : {}),
  });

  const scrollToFirstError = useCallback(() => {
    setTimeout(() => {
      const firstError = document.querySelector("[data-error]");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
  }, []);

  const validate = (): ValidationErrors => {
    const errs: ValidationErrors = {};

    if (!title.trim()) errs.title = "Назва обов'язкова";
    if (!description.trim()) errs.description = "Опис обов'язковий";
    if (!basePrice || basePrice <= 0) errs.basePrice = "Вкажіть ціну більше 0";
    if (images.length === 0) errs.images = "Додайте хоча б 1 зображення";
    if (variants.length === 0) errs.variants = "Додайте хоча б 1 варіант";

    if (slug && !SLUG_REGEX.test(slug)) {
      setSlugError("Тільки a-z, 0-9 та дефіс. Без пробілів та кирилиці.");
    }

    // Validate each variant row
    const variantRowErrors: Record<number, { sku?: string; attributes?: string; stock?: string }> = {};
    variants.forEach((v, i) => {
      const rowErr: { sku?: string; attributes?: string; stock?: string } = {};
      if (!v.sku.trim()) rowErr.sku = "SKU обов'язковий";
      if (!v.attributes.trim()) rowErr.attributes = "Атрибути обов'язкові";
      if (v.stock < 0) rowErr.stock = "Не може бути від'ємним";
      if (Object.keys(rowErr).length > 0) variantRowErrors[i] = rowErr;
    });
    if (Object.keys(variantRowErrors).length > 0) errs.variantRows = variantRowErrors;

    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      scrollToFirstError();
      return;
    }

    try {
      if (isEdit) {
        await updateProduct.mutateAsync({
          id: product.id,
          data: buildPayload(),
        });
      } else {
        await createProduct.mutateAsync(buildPayload());
      }
      router.push("/admin/products");
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Помилка збереження"
      );
    }
  };

  const handlePublish = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      scrollToFirstError();
      return;
    }

    try {
      if (isEdit) {
        await updateProduct.mutateAsync({
          id: product.id,
          data: { ...buildPayload(), status: "ACTIVE" },
        });
      } else {
        const created = await createProduct.mutateAsync(buildPayload());
        await updateProduct.mutateAsync({
          id: created.id,
          data: { status: "ACTIVE" },
        });
      }
      router.push("/admin/products");
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Помилка публікації"
      );
    }
  };

  const handleArchive = async () => {
    if (!product) return;
    if (!window.confirm("Архівувати цей товар?")) return;

    try {
      await archiveProduct.mutateAsync(product.id);
      router.push("/admin/products");
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Помилка архівування"
      );
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const publicUrl = await imageUpload.mutateAsync(file);
      setImages((prev) => [...prev, publicUrl]);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.images;
        return next;
      });
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Помилка завантаження"
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isSaving =
    createProduct.isPending ||
    updateProduct.isPending ||
    archiveProduct.isPending;

  const inputClass = (hasError: boolean) =>
    `w-full border rounded-lg px-3 py-2 text-sm outline-none ${
      hasError
        ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-400"
        : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    }`;

  const variantInputClass = (hasError: boolean) =>
    `w-full border rounded-lg px-2 py-1 text-sm outline-none ${
      hasError
        ? "border-red-500 bg-red-50 focus:ring-1 focus:ring-red-400"
        : "border-gray-300 focus:ring-1 focus:ring-blue-500"
    }`;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Basic fields */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <h2 className="text-sm font-medium text-gray-900">Основна інформація</h2>

        <div {...(errors.title ? { "data-error": true } : {})}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Назва <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title && e.target.value.trim()) {
                setErrors((prev) => { const n = { ...prev }; delete n.title; return n; });
              }
            }}
            className={inputClass(!!errors.title)}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug (URL)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              readOnly={isEdit && !slugEditable}
              placeholder="khudi-palindrom-ya-zalyshayus-tut"
              className={`flex-1 border rounded-lg px-3 py-2 text-sm outline-none ${
                slugError
                  ? "border-red-400 focus:ring-2 focus:ring-red-400"
                  : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              } ${isEdit && !slugEditable ? "bg-gray-50 text-gray-500" : ""}`}
            />
            {isEdit && !slugEditable ? (
              <button
                type="button"
                onClick={() => setSlugEditable(true)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
              >
                Змінити
              </button>
            ) : (
              <button
                type="button"
                onClick={generateSlug}
                disabled={!title.trim()}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap"
              >
                Згенерувати
              </button>
            )}
          </div>
          {slugError && (
            <p className="mt-1 text-xs text-red-500">{slugError}</p>
          )}
          {!slug && (
            <p className="mt-1 text-xs text-gray-400">
              Залиште порожнім — бекенд згенерує автоматично
            </p>
          )}
        </div>

        <div {...(errors.description ? { "data-error": true } : {})}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Опис <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description && e.target.value.trim()) {
                setErrors((prev) => { const n = { ...prev }; delete n.description; return n; });
              }
            }}
            rows={3}
            className={inputClass(!!errors.description)}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div {...(errors.basePrice ? { "data-error": true } : {})}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Базова ціна (UAH) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={basePrice || ""}
              onChange={(e) => {
                const val = Number(e.target.value);
                setBasePrice(val);
                if (errors.basePrice && val > 0) {
                  setErrors((prev) => { const n = { ...prev }; delete n.basePrice; return n; });
                }
              }}
              placeholder="0.00"
              className={inputClass(!!errors.basePrice)}
            />
            {errors.basePrice && (
              <p className="mt-1 text-xs text-red-500">{errors.basePrice}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Артист
            </label>
            <select
              value={artistId}
              onChange={(e) => setArtistId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">— Без артиста —</option>
              {artistsData?.content.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Images */}
      <div
        className={`bg-white border rounded-lg p-4 ${errors.images ? "border-red-500" : "border-gray-200"}`}
        {...(errors.images ? { "data-error": true } : {})}
      >
        <h2 className="text-sm font-medium text-gray-900 mb-3">
          Зображення <span className="text-red-500">*</span>
        </h2>

        {errors.images && (
          <p className="mb-3 text-xs text-red-500">{errors.images}</p>
        )}

        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((url, i) => (
            <div key={i} className="relative group">
              <Image
                src={url}
                alt={`Image ${i + 1}`}
                width={96}
                height={96}
                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                unoptimized
              />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          {uploading ? "Завантаження..." : "Додати зображення"}
        </button>
      </div>

      {/* Attributes */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-medium text-gray-900 mb-3">Атрибути</h2>

        <div className="space-y-2">
          {attributes.map((attr, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input
                type="text"
                placeholder="Тип (напр. Розмір)"
                value={attr.type}
                onChange={(e) =>
                  setAttributes((prev) =>
                    prev.map((a, j) =>
                      j === i ? { ...a, type: e.target.value } : a
                    )
                  )
                }
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Значення (M, L, XL)"
                value={attr.values}
                onChange={(e) =>
                  setAttributes((prev) =>
                    prev.map((a, j) =>
                      j === i ? { ...a, values: e.target.value } : a
                    )
                  )
                }
                className="flex-[2] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setAttributes((prev) => prev.filter((_, j) => j !== i))
                }
                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                Видалити
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setAttributes((prev) => [...prev, { type: "", values: "" }])}
          className="mt-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Додати атрибут
        </button>
      </div>

      {/* Variants */}
      <div
        className={`bg-white border rounded-lg p-4 ${errors.variants ? "border-red-500" : "border-gray-200"}`}
        {...(errors.variants ? { "data-error": true } : {})}
      >
        <h2 className="text-sm font-medium text-gray-900 mb-3">
          Варіанти <span className="text-red-500">*</span>
        </h2>

        {errors.variants && (
          <p className="mb-3 text-xs text-red-500">{errors.variants}</p>
        )}

        {variants.length > 0 && (
          <div className="overflow-x-auto mb-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2 font-medium text-gray-500">
                    SKU <span className="text-red-500">*</span>
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-gray-500">
                    Атрибути <span className="text-red-500">*</span>
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-gray-500">
                    Ціна +/-
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-gray-500">
                    Залишок <span className="text-red-500">*</span>
                  </th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => {
                  const rowErr = errors.variantRows?.[i];
                  return (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) =>
                            setVariants((prev) =>
                              prev.map((vr, j) =>
                                j === i ? { ...vr, sku: e.target.value } : vr
                              )
                            )
                          }
                          placeholder="ART-001-M"
                          className={variantInputClass(!!rowErr?.sku)}
                        />
                        {rowErr?.sku && (
                          <p className="mt-0.5 text-xs text-red-500">{rowErr.sku}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          placeholder="Розмір: M, Колір: Чорний"
                          value={v.attributes}
                          onChange={(e) =>
                            setVariants((prev) =>
                              prev.map((vr, j) =>
                                j === i
                                  ? { ...vr, attributes: e.target.value }
                                  : vr
                              )
                            )
                          }
                          className={variantInputClass(!!rowErr?.attributes)}
                        />
                        {rowErr?.attributes && (
                          <p className="mt-0.5 text-xs text-red-500">{rowErr.attributes}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={v.priceModifier}
                          onChange={(e) =>
                            setVariants((prev) =>
                              prev.map((vr, j) =>
                                j === i
                                  ? {
                                      ...vr,
                                      priceModifier: Number(e.target.value),
                                    }
                                  : vr
                              )
                            )
                          }
                          className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          value={v.stock}
                          onChange={(e) =>
                            setVariants((prev) =>
                              prev.map((vr, j) =>
                                j === i
                                  ? { ...vr, stock: Number(e.target.value) }
                                  : vr
                              )
                            )
                          }
                          className={`w-24 ${variantInputClass(!!rowErr?.stock)}`}
                        />
                        {rowErr?.stock && (
                          <p className="mt-0.5 text-xs text-red-500">{rowErr.stock}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() =>
                            setVariants((prev) =>
                              prev.filter((_, j) => j !== i)
                            )
                          }
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            setVariants((prev) => [
              ...prev,
              { sku: "", attributes: "", priceModifier: 0, stock: 0 },
            ])
          }
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Додати варіант
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? "Збереження..." : "Зберегти"}
        </button>

        {(!isEdit || product.status === "DRAFT") && (
          <button
            type="button"
            onClick={handlePublish}
            disabled={isSaving}
            className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            Опублікувати
          </button>
        )}

        {isEdit && (
          <button
            type="button"
            onClick={handleArchive}
            disabled={isSaving}
            className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            Архівувати
          </button>
        )}

        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Назад
        </button>
      </div>
    </div>
  );
}

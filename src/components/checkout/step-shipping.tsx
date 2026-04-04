"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useCitySearch, useWarehouses } from "@/hooks/use-nova-poshta";
import { cn } from "@/lib/cn";
import { ValidationErrors } from "@/lib/utils/validation";
import type { FormData } from "./checkout-form";
import type { NovaWarehouse } from "@/types/order";

const POPULAR_CITIES = [
  { ref: "8d5a980d-391c-11dd-90d9-001a92567626", name: "Київ", region: "Київська" },
  { ref: "db5c88f5-391c-11dd-90d9-001a92567626", name: "Львів", region: "Львівська" },
  { ref: "db5c88d0-391c-11dd-90d9-001a92567626", name: "Одеса", region: "Одеська" },
  { ref: "db5c88de-391c-11dd-90d9-001a92567626", name: "Харків", region: "Харківська" },
  { ref: "db5c88e0-391c-11dd-90d9-001a92567626", name: "Дніпро", region: "Дніпропетровська" },
  { ref: "db5c890b-391c-11dd-90d9-001a92567626", name: "Запоріжжя", region: "Запорізька" },
  { ref: "db5c8892-391c-11dd-90d9-001a92567626", name: "Вінниця", region: "Вінницька" },
  { ref: "db5c88c6-391c-11dd-90d9-001a92567626", name: "Миколаїв", region: "Миколаївська" },
];

interface StepShippingProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: ValidationErrors;
  setErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
}

export function StepShipping({
  formData,
  setFormData,
  errors,
  setErrors,
}: StepShippingProps) {
  const [cityQuery, setCityQuery] = useState(formData.cityName);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [warehouseQuery, setWarehouseQuery] = useState(formData.warehouseDescription);
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);
  const warehouseRef = useRef<HTMLDivElement>(null);

  const { data: cities, isLoading: citiesLoading } =
    useCitySearch(debouncedQuery);
  const { data: warehouses, isLoading: warehousesLoading } = useWarehouses(
    formData.cityRef || null
  );

  // Debounce city search
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(cityQuery);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cityQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
      if (warehouseRef.current && !warehouseRef.current.contains(e.target as Node)) {
        setShowWarehouseDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter and group warehouses by search query and type
  const { filteredBranches, filteredPostboxes } = useMemo(() => {
    if (!warehouses) return { filteredBranches: [], filteredPostboxes: [] };
    const q = warehouseQuery.toLowerCase().trim();
    const filtered = q
      ? warehouses.filter((wh: NovaWarehouse) => {
          const num = wh.number.toString();
          return (
            wh.description.toLowerCase().includes(q) ||
            wh.shortAddress.toLowerCase().includes(q) ||
            num.includes(q) ||
            num.padStart(3, "0").includes(q)
          );
        })
      : warehouses;
    return {
      filteredBranches: filtered.filter((wh) => wh.type === "warehouse"),
      filteredPostboxes: filtered.filter((wh) => wh.type === "postbox"),
    };
  }, [warehouses, warehouseQuery]);

  const hasResults = filteredBranches.length > 0 || filteredPostboxes.length > 0;

  const handleCityInputChange = useCallback(
    (value: string) => {
      setCityQuery(value);
      setShowCityDropdown(true);
      if (formData.cityRef) {
        setFormData((prev) => ({
          ...prev,
          cityName: "",
          cityRef: "",
          warehouseRef: "",
          warehouseDescription: "",
        }));
      }
      if (errors.cityRef) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.cityRef;
          return next;
        });
      }
    },
    [formData.cityRef, errors.cityRef, setFormData, setErrors]
  );

  const handleCitySelect = useCallback(
    (ref: string, name: string) => {
      setCityQuery(name);
      setWarehouseQuery("");
      setShowCityDropdown(false);
      setFormData((prev) => ({
        ...prev,
        cityName: name,
        cityRef: ref,
        warehouseRef: "",
        warehouseDescription: "",
      }));
      if (errors.cityRef) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.cityRef;
          return next;
        });
      }
    },
    [setFormData, errors.cityRef, setErrors]
  );

  const handleWarehouseInputChange = useCallback(
    (value: string) => {
      setWarehouseQuery(value);
      setShowWarehouseDropdown(true);
      // Clear selection if user edits
      if (formData.warehouseRef) {
        setFormData((prev) => ({
          ...prev,
          warehouseRef: "",
          warehouseDescription: "",
        }));
      }
      if (errors.warehouseRef) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.warehouseRef;
          return next;
        });
      }
    },
    [formData.warehouseRef, errors.warehouseRef, setFormData, setErrors]
  );

  const handleWarehouseSelect = useCallback(
    (wh: NovaWarehouse) => {
      setWarehouseQuery(wh.description);
      setShowWarehouseDropdown(false);
      setFormData((prev) => ({
        ...prev,
        warehouseRef: wh.ref,
        warehouseDescription: wh.description,
      }));
      if (errors.warehouseRef) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.warehouseRef;
          return next;
        });
      }
    },
    [setFormData, errors.warehouseRef, setErrors]
  );

  return (
    <div className="py-8">
      <h2 className="font-jakarta font-bold text-xs uppercase tracking-widest mb-6">
        <span className="font-grotesk">02</span> / Доставка
      </h2>
      <div className="flex flex-col gap-4">
        {/* City search */}
        <div ref={cityRef} className="relative">
          <label className="font-jakarta font-bold text-xs uppercase tracking-wider text-stone-500">
            Місто
          </label>
          <input
            type="text"
            name="cityRef"
            value={cityQuery}
            onChange={(e) => handleCityInputChange(e.target.value)}
            onFocus={() => {
              if (!formData.cityRef) setShowCityDropdown(true);
            }}
            placeholder="Почніть вводити назву міста"
            className={cn(
              "input-base",
              errors.cityRef && "border-coral"
            )}
          />
          {errors.cityRef && (
            <span className="text-coral text-xs">
              {errors.cityRef}
            </span>
          )}

          {showCityDropdown && (
            <div className="absolute z-20 left-0 right-0 top-full bg-white rounded-xl shadow-lift border border-stone-200/50 mt-1 overflow-hidden max-h-48 overflow-y-auto">
              {debouncedQuery.length >= 2 ? (
                citiesLoading ? (
                  <div className="px-4 py-3 text-xs text-stone-400">
                    Пошук...
                  </div>
                ) : cities && cities.length > 0 ? (
                  cities.map((city) => (
                    <button
                      key={city.ref}
                      type="button"
                      onClick={() => handleCitySelect(city.ref, city.name)}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-stone-50 border-b border-stone-100 last:border-b-0"
                    >
                      {city.name}
                      {city.region && (
                        <span className="text-stone-400 ml-2">
                          {city.region}
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-xs text-stone-400">
                    Нічого не знайдено
                  </div>
                )
              ) : (
                <>
                  <div className="px-4 py-2 text-[10px] font-jakarta font-bold uppercase tracking-widest text-stone-400 bg-stone-50">
                    Популярні міста
                  </div>
                  {POPULAR_CITIES.map((city) => (
                    <button
                      key={city.ref}
                      type="button"
                      onClick={() => handleCitySelect(city.ref, city.name)}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-stone-50 border-b border-stone-100 last:border-b-0"
                    >
                      {city.name}
                      <span className="text-stone-400 ml-2">
                        {city.region}
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Warehouse search */}
        {formData.cityRef && (
          <div ref={warehouseRef} className="relative">
            <label className="font-jakarta font-bold text-xs uppercase tracking-wider text-stone-500">
              Відділення Нової Пошти
            </label>
            {warehousesLoading ? (
              <div className="py-3 text-xs text-stone-400">
                Завантаження відділень...
              </div>
            ) : (
              <>
                <input
                  type="text"
                  name="warehouseRef"
                  value={warehouseQuery}
                  onChange={(e) => handleWarehouseInputChange(e.target.value)}
                  onFocus={() => {
                    if (!formData.warehouseRef) setShowWarehouseDropdown(true);
                  }}
                  placeholder="Введіть номер або адресу відділення"
                  className={cn(
                    "w-full py-3 px-4 bg-white border border-stone-200 rounded-xl outline-none",
                    "focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10",
                    "placeholder:text-stone-400 transition-all duration-200",
                    errors.warehouseRef && "border-coral"
                  )}
                />

                {showWarehouseDropdown && (
                  <div className="absolute z-20 left-0 right-0 top-full bg-white rounded-xl shadow-lift border border-stone-200/50 mt-1 overflow-hidden max-h-72 overflow-y-auto">
                    {hasResults ? (
                      <>
                        {filteredBranches.length > 0 && (
                          <>
                            <div className="px-4 py-2 text-[10px] font-jakarta font-bold uppercase tracking-widest text-stone-400 bg-stone-50 sticky top-0">
                              Відділення
                            </div>
                            {filteredBranches.map((wh: NovaWarehouse) => (
                              <button
                                key={wh.ref}
                                type="button"
                                onClick={() => handleWarehouseSelect(wh)}
                                className="w-full text-left px-4 py-3 hover:bg-stone-50 border-b border-stone-100 last:border-b-0"
                              >
                                <span className="text-sm font-medium">
                                  №{wh.number}
                                </span>
                                <span className="text-sm text-stone-500 ml-2">
                                  {wh.shortAddress}
                                </span>
                              </button>
                            ))}
                          </>
                        )}
                        {filteredPostboxes.length > 0 && (
                          <>
                            <div className="px-4 py-2 text-[10px] font-jakarta font-bold uppercase tracking-widest text-stone-400 bg-stone-50 sticky top-0">
                              Поштомати
                            </div>
                            {filteredPostboxes.map((wh: NovaWarehouse) => (
                              <button
                                key={wh.ref}
                                type="button"
                                onClick={() => handleWarehouseSelect(wh)}
                                className="w-full text-left px-4 py-3 hover:bg-stone-50 border-b border-stone-100 last:border-b-0"
                              >
                                <span className="text-sm font-medium">
                                  №{wh.number}
                                </span>
                                <span className="text-sm text-stone-500 ml-2">
                                  {wh.shortAddress}
                                </span>
                              </button>
                            ))}
                          </>
                        )}
                      </>
                    ) : (
                      <div className="px-4 py-3 text-xs text-stone-400">
                        Відділення не знайдено
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            {errors.warehouseRef && (
              <span className="text-coral text-xs">
                {errors.warehouseRef}
              </span>
            )}
          </div>
        )}

        {/* Comment */}
        <div>
          <label className="font-jakarta font-bold text-xs uppercase tracking-wider text-stone-500">
            Коментар до замовлення
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, comment: e.target.value }))
            }
            placeholder="Побажання щодо замовлення (необов'язково)"
            rows={3}
            className="input-base resize-none"
          />
        </div>
      </div>
    </div>
  );
}

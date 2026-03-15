"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useCitySearch, useWarehouses } from "@/hooks/use-nova-poshta";
import { ValidationErrors } from "@/lib/utils/validation";
import type { FormData } from "./checkout-form";

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleCityInputChange = useCallback(
    (value: string) => {
      setCityQuery(value);
      setShowCityDropdown(true);
      // Clear selection if user edits
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

  const handleWarehouseSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const ref = e.target.value;
      const wh = warehouses?.find((w) => w.ref === ref);
      setFormData((prev) => ({
        ...prev,
        warehouseRef: ref,
        warehouseDescription: wh?.description || "",
      }));
      if (errors.warehouseRef) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.warehouseRef;
          return next;
        });
      }
    },
    [warehouses, setFormData, errors.warehouseRef, setErrors]
  );

  return (
    <div className="py-8">
      <h2 className="font-jakarta font-bold text-xs uppercase tracking-wider mb-6">
        2. Доставка
      </h2>
      <div className="flex flex-col gap-4">
        {/* City search */}
        <div ref={cityRef} className="relative">
          <label className="font-jakarta font-bold text-xs uppercase tracking-wider text-stone-500">
            Місто
          </label>
          <input
            type="text"
            value={cityQuery}
            onChange={(e) => handleCityInputChange(e.target.value)}
            onFocus={() => {
              if (cityQuery.length >= 2 && !formData.cityRef)
                setShowCityDropdown(true);
            }}
            placeholder="Почніть вводити назву міста"
            className={`
              w-full py-3 px-4 bg-white border border-stone-200 rounded-xl outline-none
              focus:border-coral focus:ring-2 focus:ring-coral/20
              placeholder:text-stone-400 transition-all duration-200
              ${errors.cityRef ? "border-coral" : ""}
            `}
          />
          {errors.cityRef && (
            <span className="text-coral text-xs">
              {errors.cityRef}
            </span>
          )}

          {showCityDropdown && debouncedQuery.length >= 2 && (
            <div className="absolute z-20 left-0 right-0 top-full bg-white rounded-xl shadow-lift border border-stone-200/50 mt-1 overflow-hidden max-h-48 overflow-y-auto">
              {citiesLoading ? (
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
              )}
            </div>
          )}
        </div>

        {/* Warehouse select */}
        {formData.cityRef && (
          <div>
            <label className="font-jakarta font-bold text-xs uppercase tracking-wider text-stone-500">
              Відділення Нової Пошти
            </label>
            {warehousesLoading ? (
              <div className="py-3 text-xs text-stone-400">
                Завантаження відділень...
              </div>
            ) : (
              <select
                value={formData.warehouseRef}
                onChange={handleWarehouseSelect}
                className={`
                  w-full border border-stone-200 rounded-xl py-3 px-4 bg-transparent outline-none
                  appearance-none cursor-pointer
                  focus:border-coral focus:ring-2 focus:ring-coral/20
                  transition-all duration-200
                  ${errors.warehouseRef ? "border-coral" : ""}
                `}
              >
                <option value="">Оберіть відділення</option>
                {warehouses?.map((wh) => (
                  <option key={wh.ref} value={wh.ref}>
                    {wh.description}
                  </option>
                ))}
              </select>
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
            className="
              w-full bg-white border border-stone-200 rounded-xl py-3 px-4 outline-none
              placeholder:text-stone-400 focus:border-coral focus:ring-2 focus:ring-coral/20
              transition-all duration-200 resize-none
            "
          />
        </div>
      </div>
    </div>
  );
}

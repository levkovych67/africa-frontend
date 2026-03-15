"use client";

import { FormInput } from "@/components/ui/form-input";
import { ValidationErrors } from "@/lib/utils/validation";

interface StepShippingProps {
  formData: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  errors: ValidationErrors;
  updateField: (field: "address" | "city" | "postalCode" | "country", value: string) => void;
}

export function StepShipping({ formData, errors, updateField }: StepShippingProps) {
  return (
    <div className="py-8">
      <h2 className="font-mono text-sm uppercase tracking-widest mb-6">
        2. Доставка
      </h2>
      <div className="flex flex-col gap-4">
        <FormInput
          label="Адреса"
          name="address"
          value={formData.address}
          onChange={(e) => updateField("address", e.target.value)}
          error={errors.address}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Місто"
            name="city"
            value={formData.city}
            onChange={(e) => updateField("city", e.target.value)}
            error={errors.city}
          />
          <FormInput
            label="Поштовий індекс"
            name="postalCode"
            value={formData.postalCode}
            onChange={(e) => updateField("postalCode", e.target.value)}
            error={errors.postalCode}
          />
        </div>
        <FormInput
          label="Країна"
          name="country"
          value={formData.country}
          onChange={(e) => updateField("country", e.target.value)}
          error={errors.country}
        />
      </div>
    </div>
  );
}

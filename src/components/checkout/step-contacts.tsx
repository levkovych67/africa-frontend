"use client";

import { FormInput } from "@/components/ui/form-input";
import { ValidationErrors } from "@/lib/utils/validation";

interface StepContactsProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  errors: ValidationErrors;
  updateField: (field: "firstName" | "lastName" | "email" | "phone", value: string) => void;
}

export function StepContacts({ formData, errors, updateField }: StepContactsProps) {
  return (
    <div className="py-8">
      <h2 className="font-jakarta font-bold text-xs uppercase tracking-widest mb-6">
        <span className="font-grotesk">01</span> / Контакти
      </h2>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Ім'я"
            name="firstName"
            autoComplete="given-name"
            value={formData.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            error={errors.firstName}
          />
          <FormInput
            label="Прізвище"
            name="lastName"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            error={errors.lastName}
          />
        </div>
        <FormInput
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          error={errors.email}
        />
        <FormInput
          label="Телефон"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+380"
          value={formData.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          error={errors.phone}
        />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useCheckout } from "@/hooks/use-checkout";
import { CheckoutPayload } from "@/types/order";
import { validateCheckout, ValidationErrors } from "@/lib/utils/validation";
import { ApiRequestError } from "@/lib/api/client";
import { StepContacts } from "./step-contacts";
import { StepShipping } from "./step-shipping";
import { StepPayment } from "./step-payment";
import { CheckoutSuccess } from "./checkout-success";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const checkout = useCheckout();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Ukraine",
  });

  if (items.length === 0 && !orderId) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-20 text-center">
        <p className="font-mono text-sm">Кошик порожній</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 font-mono text-sm underline"
        >
          Повернутися до магазину
        </button>
      </div>
    );
  }

  if (orderId) {
    return <CheckoutSuccess orderId={orderId} />;
  }

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validateCheckout(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStockError(null);

    const payload: CheckoutPayload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      items: items.map((item) => ({
        productId: item.productId,
        sku: item.sku,
        quantity: item.quantity,
      })),
      shippingDetails: {
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
      },
    };

    try {
      const order = await checkout.mutateAsync(payload);
      setOrderId(order.id);
      clearCart();
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 400) {
        setStockError(err.message);
      } else {
        setStockError("Сталася помилка. Спробуйте ще раз.");
      }
    }
  };

  return (
    <div className="max-w-[600px] mx-auto px-6">
      {stockError && (
        <div className="border border-system-red p-4 mb-8">
          <p className="font-mono text-sm text-system-red">{stockError}</p>
        </div>
      )}

      <StepContacts
        formData={formData}
        errors={errors}
        updateField={updateField}
      />

      <div className="border-b border-black" />

      <StepShipping
        formData={formData}
        errors={errors}
        updateField={updateField}
      />

      <div className="border-b border-black" />

      <StepPayment
        items={items}
        total={totalPrice()}
        onSubmit={handleSubmit}
        isLoading={checkout.isPending}
      />
    </div>
  );
}

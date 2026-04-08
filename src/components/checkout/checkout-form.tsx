"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useCheckout } from "@/hooks/use-checkout";
import { CheckoutPayload, PaymentMethod } from "@/types/order";
import { validateCheckout, ValidationErrors } from "@/lib/utils/validation";
import { ApiRequestError } from "@/lib/api/client";
import { createPayment } from "@/lib/api/orders";
import { StepContacts } from "./step-contacts";
import { StepShipping } from "./step-shipping";
import { StepPayment } from "./step-payment";
import { CheckoutSuccess } from "./checkout-success";

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cityName: string;
  cityRef: string;
  warehouseRef: string;
  warehouseDescription: string;
  comment: string;
}

const STORAGE_KEY = "africa-checkout";

function loadSavedForm(): { formData: FormData; paymentMethod: PaymentMethod } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const checkout = useCheckout();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderAccessToken, setOrderAccessToken] = useState<string | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saved = loadSavedForm();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(saved?.paymentMethod ?? "COD");
  const [formData, setFormData] = useState<FormData>(saved?.formData ?? {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cityName: "",
    cityRef: "",
    warehouseRef: "",
    warehouseDescription: "",
    comment: "",
  });

  // Persist form data to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ formData, paymentMethod }));
  }, [formData, paymentMethod]);

  const clearSavedForm = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  if (items.length === 0 && !orderId) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-20 text-center">
        <p className="text-sm">Кошик порожній</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 text-sm text-coral hover:text-coral/80"
        >
          Повернутися до магазину
        </button>
      </div>
    );
  }

  if (orderId) {
    return <CheckoutSuccess orderId={orderId} accessToken={orderAccessToken} />;
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
    if (isSubmitting) return;
    setIsSubmitting(true);

    const validationErrors = validateCheckout(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = Object.keys(validationErrors)[0];
      const el = document.querySelector<HTMLElement>(`[name="${firstErrorField}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
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
        city: formData.cityName,
        cityRef: formData.cityRef,
        warehouseRef: formData.warehouseRef,
        warehouseDescription: formData.warehouseDescription,
      },
      comment: formData.comment || undefined,
      paymentMethod,
    };

    try {
      const order = await checkout.mutateAsync(payload);

      // Clear cart after order is created (stock already locked on backend)
      clearCart();
      clearSavedForm();

      if (paymentMethod === "ONLINE") {
        try {
          if (!order.accessToken) throw new Error("Відсутній токен оплати");
          const redirectUrl = `${window.location.origin}/order/${order.id}?accessToken=${order.accessToken}`;
          const { paymentUrl } = await createPayment(order.id, order.accessToken, redirectUrl);
          window.location.href = paymentUrl;
        } catch {
          // Payment URL creation failed — show order page so user can retry payment
          setOrderAccessToken(order.accessToken ?? null);
          setOrderId(order.id);
        }
      } else {
        setOrderAccessToken(order.accessToken ?? null);
        setOrderId(order.id);
      }
    } catch (err) {
      setIsSubmitting(false);
      if (err instanceof ApiRequestError && (err.status === 400 || err.status === 409 || err.status === 404)) {
        setStockError(err.message);
      } else {
        setStockError("Сталася помилка. Спробуйте ще раз.");
      }
      setTimeout(() => {
        document.querySelector("[data-stock-error]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  return (
    <div className="max-w-[600px] mx-auto px-6">
      {stockError && (
        <div data-stock-error className="bg-coral/10 border border-coral/20 rounded-xl p-4 mb-8">
          <p className="text-sm text-coral">{stockError}</p>
        </div>
      )}

      <StepContacts
        formData={formData}
        errors={errors}
        updateField={updateField}
      />

      <div className="border-b border-stone-200/50" />

      <StepShipping
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
      />

      <div className="border-b border-stone-200/50" />

      <StepPayment
        items={items}
        total={totalPrice()}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}

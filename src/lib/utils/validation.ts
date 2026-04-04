export interface ValidationErrors {
  [key: string]: string;
}

export function validateCheckout(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cityRef: string;
  warehouseRef: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.firstName.trim()) errors.firstName = "Обов'язкове поле";
  if (!data.lastName.trim()) errors.lastName = "Обов'язкове поле";
  if (!data.email.trim()) {
    errors.email = "Обов'язкове поле";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Невірний формат електронної пошти";
  }
  if (!data.phone.trim()) {
    errors.phone = "Обов'язкове поле";
  } else {
    const digits = data.phone.replace(/[\s\-\(\)]+/g, "");
    if (!/^\+?\d{10,13}$/.test(digits)) {
      errors.phone = "Невірний формат номера телефону";
    }
  }
  if (!data.cityRef) errors.cityRef = "Оберіть місто";
  if (!data.warehouseRef) errors.warehouseRef = "Оберіть відділення";

  return errors;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function validateCheckout(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.firstName.trim()) errors.firstName = "Обов'язкове поле";
  if (!data.lastName.trim()) errors.lastName = "Обов'язкове поле";
  if (!data.email.trim()) {
    errors.email = "Обов'язкове поле";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Невірний формат електронної пошти";
  }
  if (!data.phone.trim()) errors.phone = "Обов'язкове поле";
  if (!data.address.trim()) errors.address = "Обов'язкове поле";
  if (!data.city.trim()) errors.city = "Обов'язкове поле";
  if (!data.postalCode.trim()) errors.postalCode = "Обов'язкове поле";
  if (!data.country.trim()) errors.country = "Обов'язкове поле";

  return errors;
}

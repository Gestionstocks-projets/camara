import type {
  AccessoryCategory,
  PaymentMethod,
  PaymentStatus,
  PhoneCondition,
  PhoneStatus,
} from "@/types";

export const PHONE_CONDITION_LABELS: Record<PhoneCondition, string> = {
  neuf: "Neuf",
  quasi_neuf: "Quasi neuf",
};

export const PHONE_STATUS_LABELS: Record<PhoneStatus, string> = {
  en_stock: "En stock",
  reserve: "Réservé",
  vendu: "Vendu",
};

export const PHONE_STATUS_TONE: Record<
  PhoneStatus,
  "neutral" | "warning" | "success"
> = {
  en_stock: "neutral",
  reserve: "warning",
  vendu: "success",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  especes: "Espèces",
  orange_money: "Orange Money",
  wave: "Wave",
  carte: "Carte",
  autre: "Autre",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paye: "Payé",
  partiel: "Partiel",
  en_attente: "En attente",
};

export const PAYMENT_STATUS_TONE: Record<
  PaymentStatus,
  "success" | "warning" | "danger"
> = {
  paye: "success",
  partiel: "warning",
  en_attente: "danger",
};

export const ACCESSORY_CATEGORY_LABELS: Record<AccessoryCategory, string> = {
  chargeur: "Chargeur",
  ecran: "Écran",
  batterie: "Batterie",
  ecouteurs: "Écouteurs",
  airpods: "AirPods",
  coque: "Coque",
  cable: "Câble",
  autre: "Autre",
};

export const COMMON_BRANDS = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "Tecno",
  "Infinix",
] as const;

export const RAM_OPTIONS = [
  "4 Go",
  "6 Go",
  "8 Go",
  "12 Go",
  "16 Go",
  "32 Go",
  "64 Go",
  "128 Go",
] as const;
export const STORAGE_OPTIONS = [
  "64 Go",
  "128 Go",
  "256 Go",
  "512 Go",
  "1 To",
] as const;

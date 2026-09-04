import {
  LayoutDashboard,
  Smartphone,
  PlusCircle,
  Headphones,
  ShoppingCart,
  Users,
  Receipt,
  Truck,
  UserCog,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  ownerOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/stock", label: "Stock", icon: Smartphone },
  { href: "/stock/nouveau", label: "Ajouter un téléphone", icon: PlusCircle },
  { href: "/accessoires", label: "Accessoires", icon: Headphones },
  { href: "/ventes", label: "Ventes", icon: ShoppingCart },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/factures", label: "Factures", icon: Receipt },
  { href: "/fournisseurs", label: "Fournisseurs", icon: Truck, ownerOnly: true },
  { href: "/gerants", label: "Gérants", icon: UserCog, ownerOnly: true },
  { href: "/parametres", label: "Paramètres", icon: Settings, ownerOnly: true },
];

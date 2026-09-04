import { format, startOfMonth, eachDayOfInterval } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getVisibilityFlags } from "@/lib/permissions";
import type { Profile } from "@/types";
import type { PeriodRange } from "@/lib/period";

const DATE_FORMAT = "yyyy-MM-dd";

type RevenueRow = {
  sale_price: number;
  accessories_total: number;
  discount: number;
  profit: number;
  accessories_profit: number;
};

export async function getDashboardData(profile: Profile, period: PeriodRange) {
  const supabase = await createClient();
  const { seeProfit, seePurchasePrice } = await getVisibilityFlags(profile);

  const today = format(new Date(), DATE_FORMAT);
  const monthStart = format(startOfMonth(new Date()), DATE_FORMAT);

  const REVENUE_COLUMNS = "sale_price, accessories_total, discount, profit, accessories_profit";

  const [
    { data: salesToday },
    { data: salesMonth },
    { data: salesAll },
    { data: salesPeriod },
    { data: stockPhones },
    { data: stockAccessories },
    { data: lowStockAccessories },
    { data: recentSalesRaw },
  ] = await Promise.all([
    supabase.from("sales").select(REVENUE_COLUMNS).eq("sale_date", today),
    supabase
      .from("sales")
      .select(REVENUE_COLUMNS)
      .gte("sale_date", monthStart)
      .lte("sale_date", today),
    supabase.from("sales").select(REVENUE_COLUMNS),
    supabase
      .from("sales")
      .select("id, phone_id, client_id, sale_date, sale_price, discount, payment_status")
      .gte("sale_date", period.from)
      .lte("sale_date", period.to)
      .order("sale_date", { ascending: true }),
    supabase
      .from("phones")
      .select("id, condition, status, purchase_price, extra_fees, brand"),
    supabase.from("accessories").select("quantity_in_stock, purchase_price"),
    supabase
      .from("accessories")
      .select("id, name, category, quantity_in_stock, low_stock_threshold")
      .order("quantity_in_stock", { ascending: true }),
    supabase
      .from("sales")
      .select(
        "id, phone_id, client_id, sale_date, sale_price, accessories_total, discount, payment_status",
      )
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const sumRevenue = (rows: RevenueRow[] | null) =>
    (rows ?? []).reduce(
      (sum, row) => sum + (row.sale_price + row.accessories_total - row.discount),
      0,
    );
  const sumProfit = (rows: RevenueRow[] | null) =>
    (rows ?? []).reduce((sum, row) => sum + row.profit, 0);
  const sumAccessoriesRevenue = (rows: RevenueRow[] | null) =>
    (rows ?? []).reduce((sum, row) => sum + row.accessories_total, 0);
  const sumAccessoriesProfit = (rows: RevenueRow[] | null) =>
    (rows ?? []).reduce((sum, row) => sum + row.accessories_profit, 0);
  const sumPhoneRevenue = (rows: RevenueRow[] | null) =>
    (rows ?? []).reduce((sum, row) => sum + (row.sale_price - row.discount), 0);
  const sumPhoneProfit = (rows: RevenueRow[] | null) =>
    (rows ?? []).reduce((sum, row) => sum + (row.profit - row.accessories_profit), 0);

  const phones = stockPhones ?? [];
  const inStock = phones.filter((phone) => phone.status === "en_stock");

  const phoneStockValue = inStock.reduce(
    (sum, phone) => sum + phone.purchase_price + phone.extra_fees,
    0,
  );
  const accessoryStockValue = (stockAccessories ?? []).reduce(
    (sum, acc) => sum + acc.purchase_price * acc.quantity_in_stock,
    0,
  );

  // Marques les plus vendues (téléphones, sur la période) : jointure en mémoire.
  const phonesById = new Map(phones.map((phone) => [phone.id, phone]));
  const brandCounts = new Map<string, number>();
  for (const sale of salesPeriod ?? []) {
    if (!sale.phone_id) continue;
    const brand = phonesById.get(sale.phone_id)?.brand ?? "Autre";
    brandCounts.set(brand, (brandCounts.get(brand) ?? 0) + 1);
  }
  const topBrands = [...brandCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([brand, count]) => ({ brand, count }));

  // Série quotidienne pour le graphique.
  const days = eachDayOfInterval({
    start: new Date(period.from),
    end: new Date(period.to),
  });
  const revenueByDay = new Map<string, number>();
  for (const sale of salesPeriod ?? []) {
    const key = sale.sale_date;
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + (sale.sale_price - sale.discount));
  }
  const chartData = days.map((day) => {
    const key = format(day, DATE_FORMAT);
    return {
      date: format(day, "d MMM"),
      chiffreAffaires: revenueByDay.get(key) ?? 0,
    };
  });

  // Clients/téléphones pour "Dernières ventes".
  const recentSales = recentSalesRaw ?? [];
  const recentPhoneIds = recentSales
    .map((sale) => sale.phone_id)
    .filter((id): id is string => id !== null);
  const recentClientIds = recentSales.map((sale) => sale.client_id);
  const [{ data: recentPhones }, { data: recentClients }, { data: recentInvoices }] =
    await Promise.all([
      recentPhoneIds.length
        ? supabase.from("phones").select("id, brand, model").in("id", recentPhoneIds)
        : Promise.resolve({ data: [] }),
      recentClientIds.length
        ? supabase.from("clients").select("id, first_name, last_name").in("id", recentClientIds)
        : Promise.resolve({ data: [] }),
      recentSales.length
        ? supabase
            .from("invoices")
            .select("id, sale_id, number")
            .in(
              "sale_id",
              recentSales.map((s) => s.id),
            )
        : Promise.resolve({ data: [] }),
    ]);
  const recentPhonesById = new Map((recentPhones ?? []).map((p) => [p.id, p]));
  const recentClientsById = new Map((recentClients ?? []).map((c) => [c.id, c]));
  const recentInvoicesBySale = new Map((recentInvoices ?? []).map((i) => [i.sale_id, i]));

  return {
    revenue: {
      today: sumRevenue(salesToday),
      month: sumRevenue(salesMonth),
      total: sumRevenue(salesAll),
    },
    profit: seeProfit
      ? {
          today: sumProfit(salesToday),
          month: sumProfit(salesMonth),
          total: sumProfit(salesAll),
        }
      : null,
    breakdown: {
      phoneRevenueMonth: sumPhoneRevenue(salesMonth),
      accessoryRevenueMonth: sumAccessoriesRevenue(salesMonth),
      phoneProfitMonth: seeProfit ? sumPhoneProfit(salesMonth) : null,
      accessoryProfitMonth: seeProfit ? sumAccessoriesProfit(salesMonth) : null,
    },
    stock: {
      inStockCount: inStock.length,
      soldInPeriodCount: (salesPeriod ?? []).length,
      newCount: inStock.filter((p) => p.condition === "neuf").length,
      likeNewCount: inStock.filter((p) => p.condition === "quasi_neuf").length,
      value: seePurchasePrice ? phoneStockValue + accessoryStockValue : null,
      accessoryUnitsInStock: (stockAccessories ?? []).reduce(
        (sum, a) => sum + a.quantity_in_stock,
        0,
      ),
    },
    lowStockAccessories: (lowStockAccessories ?? []).filter(
      (a) => a.quantity_in_stock <= a.low_stock_threshold,
    ),
    topBrands,
    chartData,
    recentSales: recentSales.map((sale) => ({
      ...sale,
      phone: sale.phone_id ? (recentPhonesById.get(sale.phone_id) ?? null) : null,
      client: recentClientsById.get(sale.client_id) ?? null,
      invoice: recentInvoicesBySale.get(sale.id) ?? null,
    })),
  };
}

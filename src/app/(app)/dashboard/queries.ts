import { format, startOfMonth, eachDayOfInterval } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getVisibilityFlags } from "@/lib/permissions";
import type { Profile } from "@/types";
import type { PeriodRange } from "@/lib/period";

const DATE_FORMAT = "yyyy-MM-dd";

export async function getDashboardData(profile: Profile, period: PeriodRange) {
  const supabase = await createClient();
  const { seeProfit, seePurchasePrice } = await getVisibilityFlags(profile);

  const today = format(new Date(), DATE_FORMAT);
  const monthStart = format(startOfMonth(new Date()), DATE_FORMAT);

  const [
    { data: salesToday },
    { data: salesMonth },
    { data: salesAll },
    { data: salesPeriod },
    { data: stockPhones },
    { data: recentSalesRaw },
  ] = await Promise.all([
    supabase.from("sales").select("sale_price, discount, profit").eq("sale_date", today),
    supabase
      .from("sales")
      .select("sale_price, discount, profit")
      .gte("sale_date", monthStart)
      .lte("sale_date", today),
    supabase.from("sales").select("sale_price, discount, profit"),
    supabase
      .from("sales")
      .select("id, phone_id, client_id, sale_date, sale_price, discount, payment_status")
      .gte("sale_date", period.from)
      .lte("sale_date", period.to)
      .order("sale_date", { ascending: true }),
    supabase
      .from("phones")
      .select("id, condition, status, purchase_price, extra_fees, brand"),
    supabase
      .from("sales")
      .select("id, phone_id, client_id, sale_date, sale_price, discount, payment_status")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const sumRevenue = (rows: { sale_price: number; discount: number }[] | null) =>
    (rows ?? []).reduce((sum, row) => sum + (row.sale_price - row.discount), 0);
  const sumProfit = (rows: { profit: number }[] | null) =>
    (rows ?? []).reduce((sum, row) => sum + row.profit, 0);

  const phones = stockPhones ?? [];
  const inStock = phones.filter((phone) => phone.status === "en_stock");

  const stockValue = inStock.reduce(
    (sum, phone) => sum + phone.purchase_price + phone.extra_fees,
    0,
  );

  // Marques les plus vendues (sur la période) : jointure en mémoire avec `phones`.
  const phonesById = new Map(phones.map((phone) => [phone.id, phone]));
  const brandCounts = new Map<string, number>();
  for (const sale of salesPeriod ?? []) {
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
  const recentPhoneIds = recentSales.map((sale) => sale.phone_id);
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
    stock: {
      inStockCount: inStock.length,
      soldInPeriodCount: (salesPeriod ?? []).length,
      newCount: inStock.filter((p) => p.condition === "neuf").length,
      likeNewCount: inStock.filter((p) => p.condition === "quasi_neuf").length,
      value: seePurchasePrice ? stockValue : null,
    },
    topBrands,
    chartData,
    recentSales: recentSales.map((sale) => ({
      ...sale,
      phone: recentPhonesById.get(sale.phone_id) ?? null,
      client: recentClientsById.get(sale.client_id) ?? null,
      invoice: recentInvoicesBySale.get(sale.id) ?? null,
    })),
  };
}

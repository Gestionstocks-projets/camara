import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/ui/stat-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PeriodFilter } from "@/components/period-filter";
import { resolvePeriod, PERIOD_LABELS, type PeriodKey } from "@/lib/period";
import { formatFCFA } from "@/lib/utils";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONE } from "@/lib/constants";
import { getDashboardData } from "./queries";
import { SalesChart } from "./sales-chart";
import { ReportButton } from "./report-button";

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const profile = await requireProfile();
  const params = await searchParams;
  const period = resolvePeriod(params.period, params.from, params.to);

  const data = await getDashboardData(profile, period);

  const supabase = await createClient();
  const { data: settings } = await supabase.from("settings").select("shop_name").single();

  const maxBrandCount = Math.max(1, ...data.topBrands.map((b) => b.count));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        actions={
          <ReportButton
            data={{
              shopName: settings?.shop_name ?? "Ma Boutique",
              periodLabel: PERIOD_LABELS[period.key],
              revenue: data.revenue,
              profit: data.profit,
              stock: {
                inStockCount: data.stock.inStockCount,
                soldInPeriodCount: data.stock.soldInPeriodCount,
                value: data.stock.value,
              },
              topBrands: data.topBrands,
            }}
          />
        }
      />

      <div className="mb-6">
        <PeriodFilter current={period.key as PeriodKey} />
      </div>

      {data.lowStockAccessories.length > 0 ? (
        <Card className="mb-6 border-warning/40">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
            <p className="text-sm font-semibold">Stock d&apos;accessoires faible :</p>
            <div className="flex flex-wrap gap-2">
              {data.lowStockAccessories.map((a) => (
                <Link key={a.id} href={`/accessoires/${a.id}`}>
                  <Badge tone="warning">
                    {a.name} — {a.quantity_in_stock} restant(s)
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatTile label="CA du jour" value={formatFCFA(data.revenue.today)} />
        <StatTile label="CA du mois" value={formatFCFA(data.revenue.month)} />
        <StatTile label="CA total" value={formatFCFA(data.revenue.total)} variant="accent" />
        {data.profit ? (
          <>
            <StatTile label="Bénéfice du jour" value={formatFCFA(data.profit.today)} variant="brass" />
            <StatTile label="Bénéfice du mois" value={formatFCFA(data.profit.month)} variant="brass" />
            <StatTile label="Bénéfice total" value={formatFCFA(data.profit.total)} variant="brass" />
          </>
        ) : null}
        <StatTile label="En stock" value={String(data.stock.inStockCount)} />
        <StatTile label="Vendus (période)" value={String(data.stock.soldInPeriodCount)} />
        <StatTile label="Neufs" value={String(data.stock.newCount)} />
        <StatTile label="Quasi neufs" value={String(data.stock.likeNewCount)} />
        <StatTile label="Unités accessoires en stock" value={String(data.stock.accessoryUnitsInStock)} />
        {data.stock.value !== null ? (
          <StatTile label="Valeur du stock (tél. + access.)" value={formatFCFA(data.stock.value)} />
        ) : null}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Téléphones vs Accessoires (ce mois)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border p-4">
            <p className="text-xs font-bold uppercase text-muted">Téléphones</p>
            <p className="tabular mt-1 font-display text-lg font-bold">
              {formatFCFA(data.breakdown.phoneRevenueMonth)}
            </p>
            {data.breakdown.phoneProfitMonth !== null ? (
              <p className="tabular mt-1 text-sm font-semibold text-brass">
                Bénéfice : {formatFCFA(data.breakdown.phoneProfitMonth)}
              </p>
            ) : null}
          </div>
          <div className="rounded-md border border-border p-4">
            <p className="text-xs font-bold uppercase text-muted">Accessoires</p>
            <p className="tabular mt-1 font-display text-lg font-bold">
              {formatFCFA(data.breakdown.accessoryRevenueMonth)}
            </p>
            {data.breakdown.accessoryProfitMonth !== null ? (
              <p className="tabular mt-1 text-sm font-semibold text-brass">
                Bénéfice : {formatFCFA(data.breakdown.accessoryProfitMonth)}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Graphique des ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart data={data.chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marques les plus vendues</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {data.topBrands.length === 0 ? (
              <p className="text-sm text-muted">Aucune vente sur cette période.</p>
            ) : (
              data.topBrands.map((brand) => (
                <div key={brand.brand}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold">{brand.brand}</span>
                    <span className="tabular text-muted">{brand.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-raised">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${(brand.count / maxBrandCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dernières ventes</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {data.recentSales.length === 0 ? (
            <p className="p-5 text-sm text-muted">Aucune vente pour l&apos;instant.</p>
          ) : (
            data.recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div>
                  <p className="text-sm font-semibold">
                    {sale.phone
                      ? `${sale.phone.brand} ${sale.phone.model}`
                      : sale.accessories_total > 0
                        ? "Accessoires"
                        : "—"}
                  </p>
                  <p className="text-xs text-muted">
                    {sale.client ? `${sale.client.first_name} ${sale.client.last_name}` : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={PAYMENT_STATUS_TONE[sale.payment_status]}>
                    {PAYMENT_STATUS_LABELS[sale.payment_status]}
                  </Badge>
                  <span className="tabular text-sm font-semibold">
                    {formatFCFA(sale.sale_price + sale.accessories_total - sale.discount)}
                  </span>
                  {sale.invoice ? (
                    <Link
                      href={`/factures/${sale.invoice.id}`}
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      {sale.invoice.number}
                    </Link>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

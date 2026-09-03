import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { formatFCFA } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#1D1B33" },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  muted: { color: "#736F8C", marginBottom: 16 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    color: "#736F8C",
    marginBottom: 6,
    marginTop: 16,
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E6E1D2",
  },
  value: { fontWeight: 700 },
});

export interface ReportData {
  shopName: string;
  periodLabel: string;
  revenue: { today: number; month: number; total: number };
  profit: { today: number; month: number; total: number } | null;
  stock: {
    inStockCount: number;
    soldInPeriodCount: number;
    value: number | null;
  };
  topBrands: { brand: string; count: number }[];
}

export function DashboardReportPdf({ data }: { data: ReportData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{data.shopName} — Rapport</Text>
        <Text style={styles.muted}>Période : {data.periodLabel}</Text>

        <Text style={styles.sectionTitle}>Chiffre d&apos;affaires</Text>
        <View style={styles.row}>
          <Text>Aujourd&apos;hui</Text>
          <Text style={styles.value}>{formatFCFA(data.revenue.today)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Ce mois</Text>
          <Text style={styles.value}>{formatFCFA(data.revenue.month)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Total</Text>
          <Text style={styles.value}>{formatFCFA(data.revenue.total)}</Text>
        </View>

        {data.profit ? (
          <>
            <Text style={styles.sectionTitle}>Bénéfice</Text>
            <View style={styles.row}>
              <Text>Aujourd&apos;hui</Text>
              <Text style={styles.value}>{formatFCFA(data.profit.today)}</Text>
            </View>
            <View style={styles.row}>
              <Text>Ce mois</Text>
              <Text style={styles.value}>{formatFCFA(data.profit.month)}</Text>
            </View>
            <View style={styles.row}>
              <Text>Total</Text>
              <Text style={styles.value}>{formatFCFA(data.profit.total)}</Text>
            </View>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Stock</Text>
        <View style={styles.row}>
          <Text>Téléphones en stock</Text>
          <Text style={styles.value}>{data.stock.inStockCount}</Text>
        </View>
        <View style={styles.row}>
          <Text>Vendus sur la période</Text>
          <Text style={styles.value}>{data.stock.soldInPeriodCount}</Text>
        </View>
        {data.stock.value !== null ? (
          <View style={styles.row}>
            <Text>Valeur du stock</Text>
            <Text style={styles.value}>{formatFCFA(data.stock.value)}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Marques les plus vendues</Text>
        {data.topBrands.length === 0 ? (
          <Text style={styles.muted}>Aucune vente sur la période.</Text>
        ) : (
          data.topBrands.map((brand) => (
            <View style={styles.row} key={brand.brand}>
              <Text>{brand.brand}</Text>
              <Text style={styles.value}>{brand.count}</Text>
            </View>
          ))
        )}
      </Page>
    </Document>
  );
}

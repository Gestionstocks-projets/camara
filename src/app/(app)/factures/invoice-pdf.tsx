import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { InvoiceData } from "./data";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#1D1B33" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  shopName: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  muted: { color: "#736F8C" },
  invoiceNumber: { fontSize: 14, fontWeight: 700, textAlign: "right" },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    color: "#736F8C",
    marginBottom: 6,
    letterSpacing: 1,
  },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#E6E1D2", marginVertical: 12 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#1D1B33",
    marginTop: 8,
  },
  totalLabel: { fontSize: 12, fontWeight: 700 },
  totalValue: { fontSize: 12, fontWeight: 700, color: "#C6913F" },
});

export function InvoicePdf({ data }: { data: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.shopName}>{data.shop.name}</Text>
            {data.shop.phone ? <Text style={styles.muted}>{data.shop.phone}</Text> : null}
            {data.shop.email ? <Text style={styles.muted}>{data.shop.email}</Text> : null}
            {data.shop.address ? <Text style={styles.muted}>{data.shop.address}</Text> : null}
          </View>
          <View>
            <Text style={styles.invoiceNumber}>{data.invoice.number}</Text>
            <Text style={styles.muted}>{data.invoice.date}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <Text>{data.client.fullName}</Text>
          {data.client.phone ? <Text style={styles.muted}>{data.client.phone}</Text> : null}
          {data.client.email ? <Text style={styles.muted}>{data.client.email}</Text> : null}
        </View>

        {data.phone ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Téléphone</Text>
            <Text>
              {data.phone.brand} {data.phone.model} — {data.phone.condition}
            </Text>
            <Text style={styles.muted}>IMEI : {data.phone.imei}</Text>
            <Text style={styles.muted}>
              {[data.phone.ram, data.phone.storage, data.phone.color].filter(Boolean).join(" · ")}
            </Text>
          </View>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.section}>
          {data.phone ? (
            <View style={styles.row}>
              <Text>Téléphone</Text>
              <Text>{data.phone.priceLabel}</Text>
            </View>
          ) : null}
          {data.accessoryLines.map((line, index) => (
            <View style={styles.row} key={index}>
              <Text>
                {line.name} × {line.quantity}
              </Text>
              <Text>{line.lineTotalLabel}</Text>
            </View>
          ))}
          <View style={styles.row}>
            <Text>Remise</Text>
            <Text>{data.sale.discountLabel}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{data.sale.totalLabel}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.muted}>Mode de paiement</Text>
            <Text>{data.sale.paymentMethodLabel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.muted}>Statut</Text>
            <Text>{data.sale.paymentStatusLabel}</Text>
          </View>
          {data.sale.amountDue > 0 ? (
            <View style={styles.row}>
              <Text style={styles.muted}>Reste à payer</Text>
              <Text>{data.sale.amountDueLabel}</Text>
            </View>
          ) : null}
          {data.sale.warranty ? (
            <View style={styles.row}>
              <Text style={styles.muted}>Garantie</Text>
              <Text>{data.sale.warranty}</Text>
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ExportColumn } from "@/lib/export";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 8, fontFamily: "Helvetica", color: "#1D1B33" },
  title: { fontSize: 14, fontWeight: 700, marginBottom: 2 },
  muted: { fontSize: 9, color: "#736F8C", marginBottom: 14 },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1D1B33",
    paddingBottom: 4,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E6E1D2",
    paddingVertical: 4,
  },
  cell: { flex: 1, paddingRight: 6 },
  headerCell: { flex: 1, paddingRight: 6, fontWeight: 700, fontSize: 8 },
});

export function GenericTablePdf<T>({
  title,
  subtitle,
  rows,
  columns,
}: {
  title: string;
  subtitle?: string;
  rows: T[];
  columns: ExportColumn<T>[];
}) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.muted}>{subtitle}</Text> : null}

        <View style={styles.headerRow}>
          {columns.map((col) => (
            <Text key={col.key} style={styles.headerCell}>
              {col.label}
            </Text>
          ))}
        </View>

        {rows.map((row, index) => (
          <View style={styles.row} key={`row-${index}`}>
            {columns.map((col) => (
              <Text key={col.key} style={styles.cell}>
                {String(col.value(row))}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

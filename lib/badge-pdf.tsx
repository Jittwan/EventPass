import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  page: {
    paddingTop: 64,
    paddingBottom: 64,
    paddingHorizontal: 48,
    fontSize: 14,
    fontFamily: "Helvetica",
    color: "#111",
  },
  card: {
    border: "2pt solid #111",
    borderRadius: 8,
    padding: 32,
  },
  header: {
    textAlign: "center",
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 4,
    marginBottom: 24,
  },
  name: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  refRow: {
    marginTop: 16,
    borderTop: "1pt solid #ccc",
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: { color: "#666", fontSize: 10, marginBottom: 4 },
  value: { fontSize: 14, fontFamily: "Helvetica-Bold" },
});

export type BadgeData = {
  fullName: string;
  referenceCode: string;
  generatedAt: Date;
};

export function BadgeDocument({ fullName, referenceCode, generatedAt }: BadgeData) {
  const dateStr = generatedAt.toISOString().slice(0, 10);
  return (
    <Document title={`EventPass Badge — ${referenceCode}`}>
      <Page size="A6" orientation="landscape" style={styles.page}>
        <View style={styles.card}>
          <Text style={styles.header}>EVENTPASS</Text>
          <Text style={styles.name}>{fullName}</Text>
          <View style={styles.refRow}>
            <View>
              <Text style={styles.label}>Reference</Text>
              <Text style={styles.value}>{referenceCode}</Text>
            </View>
            <View>
              <Text style={styles.label}>Generated</Text>
              <Text style={styles.value}>{dateStr}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function renderBadgePdf(data: BadgeData): Promise<Buffer> {
  return renderToBuffer(<BadgeDocument {...data} />);
}

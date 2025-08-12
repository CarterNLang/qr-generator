// ReceiptDoc.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string;
}

Font.register({
  family: "CourierPrime",
  src: "https://fonts.gstatic.com/s/courierprime/v9/u-450q2lgwslOqpF_6gQ8kELaw9p.woff2",
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "CourierPrime",
    fontSize: 9,
    padding: 6,
    backgroundColor: "#fff",
  },
  receipt: { width: 226 /* 80 mm */, marginHorizontal: "auto" },
  center: { textAlign: "center" },
  divider: {
    borderBottomWidth: 1,
    borderStyle: "dotted",
    marginVertical: 4,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
});

interface Props {
  transactions: Transaction[];
}

const ReceiptDoc: React.FC<Props> = ({ transactions }) => {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const balance = income - expense;

  return (
    <Document>
      <Page size={{ width: 226, height: 320 }} style={styles.page}>
        <View style={styles.receipt}>
          <Text style={styles.center}>Budget-Tracker Receipt</Text>
          <Text style={styles.center}>
            {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </Text>

          <View style={styles.divider} />

          {transactions.map((t) => (
            <View key={t.id} style={styles.row}>
              <Text>
                {t.description} ({t.type})
              </Text>
              <Text>
                {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text>Income</Text>
            <Text>${income.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text>Expense</Text>
            <Text>${expense.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={{ fontWeight: "bold" }}>Balance</Text>
            <Text style={{ fontWeight: "bold" }}>${balance.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />
          <Text style={styles.center}>Thank you!</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReceiptDoc;

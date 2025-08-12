import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Minimal styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
  },
});

interface Props {
  transactions: {
    id: string;
    description: string;
    amount: number;
    type: string;
    date: string;
  }[];
}

const ReceiptDoc = ({ transactions }: Props) => {
  console.log("Generating PDF with:", transactions);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text>Transaction Count: {transactions.length}</Text>
          {transactions.map((t) => (
            <Text key={t.id}>
              {t.description} - ${t.amount}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default ReceiptDoc;

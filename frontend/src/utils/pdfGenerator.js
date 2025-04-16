import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image
} from '@react-pdf/renderer';

import logo from '../assets/black_logo.png';

// ✅ Roboto fontunu kaydet
Font.register({
  family: 'Roboto',
  src: require('../fonts/Roboto-Regular.ttf'),
});

// ✅ Stil ayarları
const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
    fontFamily: 'Roboto',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  infoSection: {
    border: '1pt solid #ccc',
    padding: 10,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    width: '40%',
  },
  value: {
    width: '60%',
    textAlign: 'right',
  },
  table: {
    width: '100%',
    marginTop: 10,
    border: '1pt solid #000',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderBottom: '1pt solid #000',
    paddingVertical: 6,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #ccc',
    paddingVertical: 5,
  },
  colCode: { width: '18%', paddingHorizontal: 4 },
  colName: { width: '32%', paddingHorizontal: 4 },
  colQty: { width: '12%', paddingHorizontal: 4, textAlign: 'center' },
  colPrice: { width: '18%', paddingHorizontal: 4, textAlign: 'right' },
  colTotal: { width: '20%', paddingHorizontal: 4, textAlign: 'right' },

  totalSection: {
    marginTop: 14,
    alignItems: 'flex-end',
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
    fontSize: 10,
    marginBottom: 2,
  },
  grandTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 6,
    borderTop: '1pt solid #000',
    paddingTop: 4,
  }
});

// ✅ PDF bileşeni
const InvoicePDF = ({ order }) => (
  <Document>
    <Page size="A5" style={styles.page}>
      
      {/* Üst Alan (Logo + Başlık) */}
      <View style={styles.header}>
        <Image src={logo} style={styles.logoImage} />
        <Text style={styles.invoiceTitle}>🧾 Sipariş Faturası</Text>
      </View>

      {/* Sipariş Bilgileri */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Firma:</Text>
          <Text style={styles.value}>{order.company_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Sipariş Tarihi:</Text>
          <Text style={styles.value}>{order.created_at.split('T')[0]}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Teslim Tarihi:</Text>
          <Text style={styles.value}>{order.delivery_date}</Text>
        </View>
      </View>

      {/* Ürün Tablosu */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colCode}>Kod</Text>
          <Text style={styles.colName}>Ürün</Text>
          <Text style={styles.colQty}>Adet</Text>
          <Text style={styles.colPrice}>Birim</Text>
          <Text style={styles.colTotal}>Tutar</Text>
        </View>

        {order.items.map(item => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.colCode}>{item.product_code}</Text>
            <Text style={styles.colName}>{item.product_name}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>{Number(item.unit_price).toFixed(2)}₺</Text>
            <Text style={styles.colTotal}>
              {(item.quantity * item.unit_price).toFixed(2)}₺
            </Text>
          </View>
        ))}
      </View>

      {/* Toplamlar */}
      <View style={styles.totalSection}>
        <View style={styles.totalLine}>
          <Text>Ara Toplam:</Text>
          <Text>{order.subtotal}₺</Text>
        </View>
        <View style={styles.totalLine}>
          <Text>İskonto:</Text>
          <Text>{order.discount_amount}₺</Text>
        </View>
        <View style={styles.totalLine}>
          <Text>KDV ({order.vat_rate}%):</Text>
          <Text>{order.vat_amount}₺</Text>
        </View>
        <View style={styles.grandTotal}>
          <Text>Genel Toplam: {order.total}₺</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default InvoicePDF;

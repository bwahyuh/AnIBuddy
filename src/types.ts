/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SalesRecord {
  tanggal: string;
  nama_produk: string;
  jumlah: number;
  harga_total: number;
  dateObj?: Date;
}

export interface BusinessMetrics {
  totalRevenue: number;
  totalTransactions: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
  busiestDay: string;
  averageTransactionValue: number;
  salesTrend: { date: string; revenue: number; transactions: number }[];
  productDistribution: { name: string; value: number }[];
}

export interface AnalysisResponse {
  metrics: BusinessMetrics;
  rawData: SalesRecord[];
}

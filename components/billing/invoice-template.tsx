"use client";

import { IInvoice } from "@/models/Invoice"; // Note: Importing interface from model on client might need type-only import or shared type file.
// Better to define local interface or shared type.
import { format } from "date-fns";

interface InvoiceItem {
    name: string;
    price: number;
    quantity: number;
    total: number;
}

interface InvoiceData {
    purchaseId: string;
    createdAt: string;
    products: InvoiceItem[];
    totalCount: number;
    totalAmount: number;
}

interface InvoiceTemplateProps {
    invoice: InvoiceData;
}

// Simple styles for thermal printing
const styles = `
    @media print {
        @page {
            margin: 0;
            size: auto;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: 'Courier New', Courier, monospace;
        }
        .invoice-container {
            width: 80mm; /* Standard thermal width */
            padding: 10px;
            font-size: 12px;
        }
        .header {
            text-align: center;
            margin-bottom: 10px;
        }
        .header h1 {
            font-size: 16px;
            margin: 0;
            font-weight: bold;
        }
        .header p {
            margin: 2px 0;
        }
        .divider {
            border-top: 1px dashed black;
            margin: 5px 0;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
        }
        .table th {
            text-align: left;
            border-bottom: 1px dashed black;
        }
        .table td {
            text-align: left;
        }
        .text-right {
            text-align: right !important;
        }
        .footer {
            text-align: center;
            margin-top: 10px;
        }
    }
`;

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ invoice }) => {
    return (
        <div className="invoice-container p-4 bg-white text-black" style={{ width: "80mm" }}>
            <style>{styles}</style>
            <div className="header text-center">
                <h1 className="font-bold text-lg">Murj Gulf Sooq</h1>
                <p>Phone: +968 1234 5678</p>
                <p>Muscat, Oman</p>
            </div>

            <div className="divider border-t border-dashed border-black my-2"></div>

            <div className="info text-xs">
                <p><strong>Invoice:</strong> {invoice.purchaseId}</p>
                <p><strong>Date:</strong> {format(new Date(invoice.createdAt || Date.now()), "dd/MM/yyyy HH:mm")}</p>
            </div>

            <div className="divider border-t border-dashed border-black my-2"></div>

            <table className="table w-full text-xs">
                <thead>
                    <tr>
                        <th className="text-left py-1">Item</th>
                        <th className="text-center py-1">Qty</th>
                        <th className="text-right py-1">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.products.map((item, index) => (
                        <tr key={index}>
                            <td className="py-1">
                                <div>{item.name}</div>
                                <div className="text-[10px] text-gray-500">@{item.price.toFixed(3)}</div>
                            </td>
                            <td className="text-center py-1">{item.quantity}</td>
                            <td className="text-right py-1">{item.total.toFixed(3)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="divider border-t border-dashed border-black my-2"></div>

            <div className="totals flex justify-between font-bold text-sm">
                <span>Total Qty:</span>
                <span>{invoice.totalCount}</span>
            </div>
            <div className="totals flex justify-between font-bold text-base mt-1">
                <span>Total Amount:</span>
                <span>OMR {invoice.totalAmount.toFixed(3)}</span>
            </div>

            <div className="divider border-t border-dashed border-black my-2"></div>

            <div className="footer text-center text-xs mt-4">
                <p>Thank you for shopping with us!</p>
                <p>No Exchange/Refund without receipt</p>
            </div>
        </div>
    );
};

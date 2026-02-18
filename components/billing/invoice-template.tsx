"use client";

import { format } from "date-fns";

interface InvoiceItem {
    productId: {
        name: string;
        price: number;
    };
    quantity: number;
}

interface InvoiceData {
    invoiceNumber: string;
    purchaseId: string;
    createdAt: string;
    products: InvoiceItem[];
    totalCount: number;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    cashierName: string;
    paymentMethod: string;
}

interface InvoiceTemplateProps {
    invoice: InvoiceData;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ invoice }) => {
    const invoiceDate = format(new Date(invoice.createdAt || Date.now()), "dd/MM/yyyy");
    const invoiceTime = format(new Date(invoice.createdAt || Date.now()), "HH:mm:ss");

    return (
        <>
            <style>{`
                @media print {
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        width: 80mm;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
                
                .receipt {
                    width: 80mm;
                    max-width: 80mm;
                    margin: 0 auto;
                    padding: 5mm;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 12px;
                    line-height: 1.5;
                    color: #000;
                    background: #fff;
                }
                
                .receipt-header {
                    text-align: center;
                    margin-bottom: 10px;
                    padding-bottom: 10px;
                    border-bottom: 2px dashed #000;
                }
                
                .receipt-header h1 {
                    margin: 0 0 5px 0;
                    font-size: 20px;
                    font-weight: bold;
                }
                
                .receipt-header p {
                    margin: 2px 0;
                    font-size: 11px;
                }
                
                .receipt-info {
                    margin: 10px 0;
                    font-size: 11px;
                }
                
                .receipt-info-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 3px 0;
                }
                
                .receipt-divider {
                    border-top: 1px dashed #000;
                    margin: 10px 0;
                }
                
                .receipt-items {
                    margin: 10px 0;
                }
                
                .receipt-item {
                    margin: 5px 0;
                    font-size: 11px;
                }
                
                .receipt-item-name {
                    font-weight: bold;
                    margin-bottom: 2px;
                }
                
                .receipt-item-details {
                    display: flex;
                    justify-content: space-between;
                    font-size: 10px;
                }
                
                .receipt-totals {
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px dashed #000;
                }
                
                .receipt-total-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 3px 0;
                    font-size: 11px;
                }
                
                .receipt-grand-total {
                    display: flex;
                    justify-content: space-between;
                    margin: 5px 0;
                    padding-top: 5px;
                    border-top: 2px solid #000;
                    font-size: 14px;
                    font-weight: bold;
                }
                
                .receipt-footer {
                    text-align: center;
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 1px dashed #000;
                    font-size: 10px;
                }
                
                .receipt-footer-thanks {
                    font-weight: bold;
                    font-size: 12px;
                    margin-bottom: 5px;
                }
            `}</style>

            <div className="receipt">
                {/* Header */}
                <div className="receipt-header">
                    <h1>MURJ GULF SOUQ</h1>
                    <p>Muscat, Sultanate of Oman</p>
                    <p>Tel: +968 1234 5678</p>
                    <p>TRN: 123456789</p>
                </div>

                {/* Invoice Info */}
                <div className="receipt-info">
                    <div className="receipt-info-row">
                        <span>Invoice:</span>
                        <span>{invoice.invoiceNumber}</span>
                    </div>
                    <div className="receipt-info-row">
                        <span>Date:</span>
                        <span>{invoiceDate}</span>
                    </div>
                    <div className="receipt-info-row">
                        <span>Time:</span>
                        <span>{invoiceTime}</span>
                    </div>
                    <div className="receipt-info-row">
                        <span>Cashier:</span>
                        <span>{invoice.cashierName}</span>
                    </div>
                </div>

                <div className="receipt-divider"></div>

                {/* Items */}
                <div className="receipt-items">
                    {invoice.products.map((item, index) => {
                        const name = item.productId?.name || "Unknown";
                        const price = item.productId?.price || 0;
                        const total = price * item.quantity;

                        return (
                            <div key={index} className="receipt-item">
                                <div className="receipt-item-name">{name}</div>
                                <div className="receipt-item-details">
                                    <span>{item.quantity} x INR {price.toFixed(3)}</span>
                                    <span>INR {total.toFixed(3)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Totals */}
                <div className="receipt-totals">
                    <div className="receipt-total-row">
                        <span>Items:</span>
                        <span>{invoice.totalCount}</span>
                    </div>
                    <div className="receipt-total-row">
                        <span>Subtotal:</span>
                        <span>INR {invoice.subtotal.toFixed(3)}</span>
                    </div>
                    <div className="receipt-total-row">
                        <span>VAT ({invoice.taxRate}%):</span>
                        <span>INR {invoice.taxAmount.toFixed(3)}</span>
                    </div>
                    <div className="receipt-grand-total">
                        <span>TOTAL:</span>
                        <span>INR {invoice.totalAmount.toFixed(3)}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="receipt-footer">
                    <p className="receipt-footer-thanks">Thank You!</p>
                    <p>Please keep this receipt</p>
                    <p>No refund without receipt</p>
                    <p style={{ marginTop: '8px', fontSize: '9px' }}>Ref: {invoice.purchaseId}</p>
                </div>
            </div>
        </>
    );
};

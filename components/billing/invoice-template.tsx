"use client";

import { format } from "date-fns";

interface InvoiceItem {
    productId: {
        name: string;
        price: number;
        offerPrice?: number;
    };
    quantity: number;
}

interface InvoiceData {
    invoiceNumber: string;
    purchaseId: string;
    createdAt: string;
    products: InvoiceItem[];
    totalCount: number;
    subtotal: number;      // cart total at effective prices
    discountTotal: number; // combined savings (offer prices + bill discount)
    totalAmount: number;   // final amount paid
    cashierName: string;
    paymentMethod: string;
}

interface InvoiceTemplateProps {
    invoice: InvoiceData;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ invoice }) => {
    const dateObj = invoice.createdAt ? new Date(invoice.createdAt) : new Date();
    const invoiceDate = format(dateObj, "dd/MM/yyyy");
    const invoiceTime = format(dateObj, "HH:mm:ss");

    const hasDiscount = (invoice.discountTotal ?? 0) > 0;
    const mrpTotal = (invoice.subtotal ?? 0) + (invoice.discountTotal ?? 0);

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
                        background-color: #fff;
                    }
                }
                
                .receipt {
                    width: 80mm;
                    padding: 4mm;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 13px; 
                    line-height: 1.2;
                    color: #000;
                    background: #fff;
                    text-transform: uppercase;
                }
                
                .receipt-header {
                    text-align: center;
                    margin-bottom: 8px;
                }
                
                .receipt-header h1 {
                    margin: 0;
                    font-size: 22px;
                    font-weight: 900;
                }
                
                .receipt-header p {
                    margin: 2px 0;
                    font-size: 13px;
                    font-weight: bold;
                }
                
                .receipt-info {
                    margin: 10px 0;
                }
                
                .receipt-info-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 2px 0;
                    font-weight: bold;
                }
                
                .receipt-divider {
                    border-top: 2px dashed #000;
                    margin: 8px 0;
                }
                
                .receipt-items {
                    margin: 10px 0;
                }
                
                .receipt-item {
                    margin-bottom: 8px;
                }
                
                .receipt-item-name {
                    font-weight: 900;
                    font-size: 14px;
                }

                .receipt-item-offer {
                    font-size: 11px;
                    font-weight: bold;
                }
                
                .receipt-item-details {
                    display: flex;
                    justify-content: space-between;
                    font-weight: bold;
                }
                
                .receipt-totals {
                    margin-top: 5px;
                }
                
                .receipt-total-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 2px 0;
                    font-weight: bold;
                }

                .receipt-discount-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 2px 0;
                    font-weight: bold;
                }
                
                .receipt-grand-total {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 5px;
                    padding-top: 5px;
                    border-top: 3px solid #000;
                    font-size: 18px;
                    font-weight: 900;
                }
                
                .receipt-footer {
                    text-align: center;
                    margin-top: 15px;
                    font-weight: bold;
                }
                
                .receipt-footer-thanks {
                    font-size: 16px;
                    font-weight: 900;
                    margin-bottom: 5px;
                }

                .ref-text {
                    font-size: 11px;
                    margin-top: 10px;
                }
            `}</style>

            <div className="receipt">
                <div className="receipt-header">
                    <h1>MARJ GULF SOUQ</h1>
                    <p>Kavanur</p>
                    <p>Tel: +91 79-02259260</p>
                </div>

                <div className="receipt-divider"></div>

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

                <div className="receipt-items">
                    {invoice.products.map((item, index) => {
                        const hasOffer = item.productId?.offerPrice != null;
                        const unitPrice = hasOffer ? item.productId.offerPrice! : item.productId?.price;
                        const lineTotal = unitPrice * item.quantity;
                        return (
                            <div key={index} className="receipt-item">
                                <div className="receipt-item-name">{item.productId?.name}</div>
                                {hasOffer && (
                                    <div className="receipt-item-offer">
                                        MRP: INR {item.productId.price.toFixed(3)} | OFFER APPLIED
                                    </div>
                                )}
                                <div className="receipt-item-details">
                                    <span>{item.quantity} x INR {unitPrice.toFixed(3)}</span>
                                    <span>INR {lineTotal.toFixed(3)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="receipt-divider"></div>

                <div className="receipt-totals">
                    <div className="receipt-total-row">
                        <span>Items:</span>
                        <span>{invoice.totalCount}</span>
                    </div>

                    {/* MRP total + combined discount row */}
                    {hasDiscount && (
                        <div className="receipt-total-row">
                            <span>MRP Total:</span>
                            <span>INR {mrpTotal.toFixed(3)}</span>
                        </div>
                    )}
                    {hasDiscount && (
                        <div className="receipt-discount-row">
                            <span>Discount:</span>
                            <span>-INR {(invoice.discountTotal ?? 0).toFixed(3)}</span>
                        </div>
                    )}

                    <div className="receipt-grand-total">
                        <span>TOTAL:</span>
                        <span>INR {invoice.totalAmount.toFixed(3)}</span>
                    </div>
                </div>

                <div className="receipt-footer">
                    <div className="receipt-divider"></div>
                    <p className="receipt-footer-thanks">THANK YOU!</p>
                    <p>Please keep this receipt</p>
                    <p>No refund without receipt</p>
                    <p className="ref-text">Ref: {invoice.purchaseId}</p>
                </div>
            </div>
        </>
    );
};
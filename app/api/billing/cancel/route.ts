import { NextResponse } from "next/server";
import { Invoice } from "@/models/Invoice";
import { getSessionUser } from "@/lib/auth-helper";
import connectDB from "@/lib/db";

export async function POST(req: Request) {
    try {
        const user = await getSessionUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { invoiceId } = body;

        if (!invoiceId) {
            return new NextResponse("Invoice ID required", { status: 400 });
        }

        await connectDB();

        try {
            // Find the pending invoice
            const invoice = await Invoice.findById(invoiceId);

            if (!invoice) {
                throw new Error("Invoice not found");
            }

            if (invoice.status !== "pending") {
                throw new Error("Invoice already processed");
            }

            // Update invoice status to cancelled
            invoice.status = "cancelled";
            await invoice.save();

            console.log("[BILLING_CANCEL_SUCCESS]", invoice.invoiceNumber);
            return NextResponse.json({ success: true, message: "Invoice cancelled" });

        } catch (error: any) {
            console.error("[BILLING_CANCEL_ERROR]", error);
            return new NextResponse(error.message || "Cancellation failed", { status: 400 });
        }
    } catch (error) {
        console.error("[BILLING_CANCEL_FATAL]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

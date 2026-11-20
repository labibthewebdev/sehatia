import crypto from "crypto";

const MIDTRANS_BASE_URL =
  process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

export const PLANS = {
  pro_monthly: {
    id: "pro_monthly",
    name: "Sehatia Pro (1 Bulan)",
    amount: 39000,
    durationDays: 30,
  },
  pro_quarterly: {
    id: "pro_quarterly",
    name: "Sehatia Pro (3 Bulan - Hemat)",
    amount: 89000,
    durationDays: 90,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export async function createMidtransSnapTransaction(params: {
  orderId: string;
  planKey: PlanKey;
  customerPhone: string;
  customerName?: string | null;
}) {
  const plan = PLANS[params.planKey];
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const authHeader = Buffer.from(`${serverKey}:`).toString("base64");

  const payload = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: plan.amount,
    },
    item_details: [
      {
        id: plan.id,
        price: plan.amount,
        quantity: 1,
        name: plan.name,
      },
    ],
    customer_details: {
      first_name: params.customerName || "Member Sehatia",
      phone: params.customerPhone,
    },
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
    },
  };

  const res = await fetch(MIDTRANS_BASE_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${authHeader}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorDetail = await res.text();
    throw new Error(`Midtrans Snap error: ${errorDetail}`);
  }

  return (await res.json()) as {
    token: string;
    redirect_url: string;
  };
}

export function verifyMidtransSignature(params: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const raw = `${params.orderId}${params.statusCode}${params.grossAmount}${serverKey}`;
  const expected = crypto.createHash("sha512").update(raw).digest("hex");
  return expected === params.signatureKey;
}

export async function sendWhatsAppMessage(targetPhone: string, message: string) {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    console.error("FONNTE_TOKEN belum diatur");
    return null;
  }

  const response = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target: targetPhone,
      message,
      countryCode: "62",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gagal kirim pesan Fonnte:", errText);
  }

  return response.json().catch(() => null);
}

export async function downloadMediaAsBase64(
  mediaUrl: string
): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const res = await fetch(mediaUrl);
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return {
      base64,
      mimeType: contentType.startsWith("image/") ? contentType : "image/jpeg",
    };
  } catch (error) {
    console.error("Gagal mengunduh media dari Fonnte:", error);
    return null;
  }
}

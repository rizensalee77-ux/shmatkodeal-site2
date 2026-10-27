
export default async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405
    });
  }

  try {
    const data = await request.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      throw new Error("Telegram settings missing");
    }

    const fields = Object.entries(data)
      .map(([key, value]) =>
        `${key}: ${String(value).slice(0, 1000)}`
      )
      .join("\n");

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🔔 Новая заявка с сайта!\n\n${fields}`
        })
      }
    );

    if (!response.ok) {
      throw new Error("Telegram delivery failed");
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { success: false, error: "Could not send lead" },
      { status: 500 }
    );
  }
};

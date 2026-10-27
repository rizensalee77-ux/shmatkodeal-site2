
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
      console.error("Missing Telegram environment variables");
      return Response.json(
        { success: false, error: "Missing Telegram settings in Netlify" },
        { status: 500 }
      );
    }

    const fields = Object.entries(data)
      .map(([key, value]) => `${key}: ${String(value).slice(0, 1000)}`)
      .join("\n");

    const tgResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🔔 Новая заявка с сайта!\n\n${fields}`
        })
      }
    );

    const tgResult = await tgResponse.json();

    if (!tgResponse.ok || !tgResult.ok) {
      console.error("Telegram API error:", tgResult.error_code, tgResult.description);
      return Response.json(
        {
          success: false,
          error: "Telegram API error",
          code: tgResult.error_code,
          description: tgResult.description
        },
        { status: 502 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Lead function error:", error);
    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
};

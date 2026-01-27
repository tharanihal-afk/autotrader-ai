const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "new_trade" | "trade_executed" | "trade_failed";
  symbol: string;
  action: "BUY" | "SELL";
  quantity: number;
  price: number;
  reason?: string;
  error?: string;
}

interface ResendEmailResponse {
  id: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL");

    if (!RESEND_API_KEY) {
      console.log("Resend API key not configured, skipping notification");
      return new Response(
        JSON.stringify({ success: false, error: "RESEND_API_KEY not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!NOTIFICATION_EMAIL) {
      console.log("Notification email not configured, skipping");
      return new Response(
        JSON.stringify({ success: false, error: "NOTIFICATION_EMAIL not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data: NotificationRequest = await req.json();

    let subject = "";
    let htmlContent = "";
    const total = (data.quantity * data.price).toFixed(2);

    switch (data.type) {
      case "new_trade":
        subject = `🔔 Quantio: New ${data.action} Signal for ${data.symbol}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d1117; color: #e6edf3; padding: 24px; border-radius: 12px;">
            <h1 style="color: #39d0d8; margin-bottom: 24px;">📊 New Trade Signal</h1>
            <div style="background: #161b22; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 12px 0;"><strong>Action:</strong> <span style="color: ${data.action === 'BUY' ? '#3fb950' : '#f85149'};">${data.action}</span></p>
              <p style="margin: 0 0 12px 0;"><strong>Symbol:</strong> ${data.symbol}</p>
              <p style="margin: 0 0 12px 0;"><strong>Quantity:</strong> ${data.quantity}</p>
              <p style="margin: 0 0 12px 0;"><strong>Price:</strong> $${data.price.toFixed(2)}</p>
              <p style="margin: 0 0 12px 0;"><strong>Total:</strong> $${total}</p>
              ${data.reason ? `<p style="margin: 0; color: #8b949e;"><strong>Reason:</strong> ${data.reason}</p>` : ''}
            </div>
            <p style="color: #8b949e; font-size: 14px;">Log in to Quantio to approve or reject this trade.</p>
          </div>
        `;
        break;

      case "trade_executed":
        subject = `✅ Quantio: ${data.action} Order Executed for ${data.symbol}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d1117; color: #e6edf3; padding: 24px; border-radius: 12px;">
            <h1 style="color: #3fb950; margin-bottom: 24px;">✅ Trade Executed</h1>
            <div style="background: #161b22; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 12px 0;"><strong>Action:</strong> <span style="color: ${data.action === 'BUY' ? '#3fb950' : '#f85149'};">${data.action}</span></p>
              <p style="margin: 0 0 12px 0;"><strong>Symbol:</strong> ${data.symbol}</p>
              <p style="margin: 0 0 12px 0;"><strong>Quantity:</strong> ${data.quantity}</p>
              <p style="margin: 0 0 12px 0;"><strong>Price:</strong> $${data.price.toFixed(2)}</p>
              <p style="margin: 0;"><strong>Total:</strong> $${total}</p>
            </div>
            <p style="color: #8b949e; font-size: 14px;">Your trade has been successfully executed on Binance.</p>
          </div>
        `;
        break;

      case "trade_failed":
        subject = `❌ Quantio: Trade Failed for ${data.symbol}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d1117; color: #e6edf3; padding: 24px; border-radius: 12px;">
            <h1 style="color: #f85149; margin-bottom: 24px;">❌ Trade Failed</h1>
            <div style="background: #161b22; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 12px 0;"><strong>Action:</strong> ${data.action}</p>
              <p style="margin: 0 0 12px 0;"><strong>Symbol:</strong> ${data.symbol}</p>
              <p style="margin: 0 0 12px 0;"><strong>Quantity:</strong> ${data.quantity}</p>
              ${data.error ? `<p style="margin: 0; color: #f85149;"><strong>Error:</strong> ${data.error}</p>` : ''}
            </div>
            <p style="color: #8b949e; font-size: 14px;">Please check your Binance account and try again.</p>
          </div>
        `;
        break;
    }

    console.log(`Sending ${data.type} notification to ${NOTIFICATION_EMAIL}`);

    // Use Resend REST API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Quantio <onboarding@resend.dev>", // Use your verified domain in production
        to: [NOTIFICATION_EMAIL],
        subject,
        html: htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Resend API error: ${errorText}`);
    }

    const emailResult: ResendEmailResponse = await emailResponse.json();
    console.log("Email sent:", emailResult);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Notification error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

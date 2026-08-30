export async function sendWhatsAppPurchaseNotification(studentName: string, studentPhone: string, courseTitle: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || "course_purchase";

  if (!token || !phoneId) {
    console.log("WhatsApp: Credentials are not fully configured in environment (.env).");
    return;
  }

  // Sanitize the phone number to digits only
  let formattedPhone = studentPhone.replace(/\D/g, "");
  if (formattedPhone.length === 10) {
    formattedPhone = "91" + formattedPhone; // Default to India country code if 10 digits
  }

  if (!formattedPhone) {
    console.log("WhatsApp: Student phone number is empty or invalid. Skipping.");
    return;
  }

  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;

  // 1. Send pre-approved template message (business-initiated requirement)
  const templatePayload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: formattedPhone,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: "en"
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: studentName
            },
            {
              type: "text",
              text: courseTitle
            }
          ]
        }
      ]
    }
  };

  try {
    console.log(`WhatsApp: Sending template notification to ${formattedPhone}...`);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(templatePayload)
    });

    const data = await res.json() as any;
    if (!res.ok) {
      console.error("WhatsApp: Template API rejected the request, trying fallback text message. Response:", data);
      
      // 2. Fallback text payload if the template is not registered or approved in the dashboard
      const textPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "text",
        text: {
          preview_url: false,
          body: `Hi ${studentName}, thank you for purchasing "${courseTitle}". You can now access your course from the dashboard!`
        }
      };

      const fallbackRes = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(textPayload)
      });
      
      const fallbackData = await fallbackRes.json();
      if (!fallbackRes.ok) {
        console.error("WhatsApp: Fallback text message also failed. Response:", fallbackData);
      } else {
        console.log("WhatsApp: Fallback text message sent successfully:", fallbackData);
      }
    } else {
      console.log("WhatsApp: Template notification sent successfully:", data);
    }
  } catch (error) {
    console.error("WhatsApp: Network or connection error:", error);
  }
}

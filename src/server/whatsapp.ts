export async function sendWhatsAppActivationLink(
  studentName: string,
  studentPhone: string,
  courseTitle: string,
  activationUrl: string
) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.log("WhatsApp: Credentials are not fully configured in environment (.env).");
    return;
  }

  let formattedPhone = studentPhone.replace(/\D/g, "");
  if (formattedPhone.length === 10) {
    formattedPhone = "91" + formattedPhone;
  }
  if (!formattedPhone) {
    console.log("WhatsApp: Student phone number is empty or invalid. Skipping.");
    return;
  }

  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
  const bodyText = `Hi ${studentName}, thank you for purchasing ${courseTitle} from Sarvpratham Analytics!

Your course is unlocked and ready to access right away.

To save your account for next time, set a password here: ${activationUrl}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "text",
        text: { preview_url: true, body: bodyText },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("WhatsApp: Activation link text message failed. Response:", data);
    } else {
      console.log("WhatsApp: Activation link sent successfully:", data);
    }
  } catch (error) {
    console.error("WhatsApp: Network or connection error sending activation link:", error);
  }
}

export async function sendWhatsAppPurchaseNotification(
  studentName: string,
  studentPhone: string,
  courseTitle: string,
  orderId: string = "N/A",
  orderStatus: string = "PAID"
) {
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
            },
            {
              type: "text",
              text: orderId
            },
            {
              type: "text",
              text: orderStatus
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
      
      const fallbackText = `Thank you for choosing SarvPratham.
Hi ${studentName}, your enrolment for ${courseTitle} is confirmed. 
Order #${orderId} is ${orderStatus}. 

Please Click "Access Course Here" Button below to Access your Course Now. 
Link: https://sarvprathamanalytics.com/dashboard

If it prompts for a login, kindly use your opted username/ email and password else reset your password with "Forget Password" link.`;

      // 2. Fallback text payload if the template is not registered or approved in the dashboard
      const textPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "text",
        text: {
          preview_url: true,
          body: fallbackText
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

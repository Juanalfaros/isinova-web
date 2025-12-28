/**
 * Netlify Function: contact-form
 * Maneja el envío del formulario de contacto a Brevo
 */

// Load .env for local development
import 'dotenv/config';

export const handler = async (event, context) => {
    // Solo permitir POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Método no permitido" }),
        };
    }

    // Headers CORS
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    };

    // Handle preflight
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" };
    }

    try {
        const { name, email, project } = JSON.parse(event.body);

        // Validación básica
        if (!name || !email || !project) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: "Todos los campos son requeridos" }),
            };
        }

        const BREVO_API_KEY = process.env.BREVO_API_KEY;
        const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || "contacto@isinova.cl";
        const BREVO_LIST_ID = process.env.BREVO_LIST_ID;

        if (!BREVO_API_KEY) {
            console.error("BREVO_API_KEY no configurada");
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: "Error de configuración del servidor" }),
            };
        }

        // Mapeo de tipos de proyecto
        const projectTypes = {
            lms: "Implementación LMS",
            web: "Desarrollo Web",
            support: "Soporte Técnico",
            other: "Otro",
        };

        const projectLabel = projectTypes[project] || project;

        // 1. Crear/Actualizar contacto en Brevo
        const contactPayload = {
            email: email,
            attributes: {
                FIRSTNAME: name.split(" ")[0],
                LASTNAME: name.split(" ").slice(1).join(" ") || "",
                NOMBRE_COMPLETO: name,
                TIPO_PROYECTO: projectLabel,
                ORIGEN: "Formulario Web Isinova",
            },
            updateEnabled: true,
        };

        // Si hay lista configurada, añadir a la lista
        if (BREVO_LIST_ID) {
            contactPayload.listIds = [parseInt(BREVO_LIST_ID)];
        }

        const contactResponse = await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": BREVO_API_KEY,
            },
            body: JSON.stringify(contactPayload),
        });

        if (!contactResponse.ok && contactResponse.status !== 204) {
            const errorData = await contactResponse.text();
            console.error("Error creando contacto:", errorData);
            // Continuamos aunque falle la creación del contacto (puede que ya exista)
        }

        // 2. Enviar email de notificación
        const emailPayload = {
            sender: {
                name: "Formulario Isinova",
                email: "noreply@isinova.cl",
            },
            to: [{ email: NOTIFICATION_EMAIL }],
            subject: `🚀 Nueva solicitud: ${projectLabel}`,
            htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #6246ea, #00ff8c); padding: 20px; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">Nueva Solicitud de Contacto</h1>
                    </div>
                    <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #64748b;">Nombre:</td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #64748b;">Email:</td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;"><a href="mailto:${email}">${email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Tipo de Proyecto:</td>
                                <td style="padding: 10px 0; color: #1e293b;">${projectLabel}</td>
                            </tr>
                        </table>
                        <div style="margin-top: 20px; padding: 15px; background: #e0f2fe; border-radius: 8px;">
                            <p style="margin: 0; color: #0369a1; font-size: 14px;">
                                💡 Responde en menos de 24 horas para mantener el compromiso con el cliente.
                            </p>
                        </div>
                    </div>
                </div>
            `,
        };

        const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": BREVO_API_KEY,
            },
            body: JSON.stringify(emailPayload),
        });

        if (!emailResponse.ok) {
            const errorData = await emailResponse.text();
            console.error("Error enviando email:", errorData);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: "Error al enviar la notificación" }),
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: "Solicitud enviada correctamente"
            }),
        };

    } catch (error) {
        console.error("Error en contact-form:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Error interno del servidor" }),
        };
    }
};

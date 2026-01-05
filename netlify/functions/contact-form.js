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
        const { name, email, institution, phone, project, message, listId, source } = JSON.parse(event.body);

        // Validación básica
        if (!name || !email || !project) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: "Nombre, email y categoría son requeridos" }),
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
            lms: "Implementación LMS (Moodle/Canvas)",
            web: "Desarrollo Web EdTech",
            data: "Migración de Datos",
            support: "Soporte Estratégico",
            newsletter: "Suscripción Newsletter",
            quiz_report: "Reporte de Diagnóstico PDF",
            other: "Otro Requerimiento",
        };

        const projectLabel = projectTypes[project] || project;

        // 1. Crear/Actualizar contacto en Brevo
        const contactPayload = {
            email: email,
            attributes: {
                FIRSTNAME: name.split(" ")[0],
                LASTNAME: name.split(" ").slice(1).join(" ") || "",
                NOMBRE_COMPLETO: name,
                INSTITUCION: institution || "",
                TELEFONO: phone || "",
                TIPO_PROYECTO: projectLabel,
                MENSAJE: message || "",
                ORIGEN: source || "Formulario Web Isinova",
            },
            updateEnabled: true,
        };

        // Asignar a lista (prioridad: body.listId > env.BREVO_LIST_ID)
        const targetListId = listId || BREVO_LIST_ID;
        if (targetListId) {
            contactPayload.listIds = [parseInt(targetListId)];
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
        }

        // 2. Enviar email de notificación
        const emailPayload = {
            sender: {
                name: "Formulario Isinova",
                email: "noreply@isinova.cl",
            },
            to: [{ email: NOTIFICATION_EMAIL }],
            replyTo: { email: email, name: name },
            subject: `🚀 Nueva solicitud: ${projectLabel} - ${institution || name}`,
            htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
                    <div style="background: linear-gradient(135deg, #6246ea, #10b981); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">Nueva Solicitud de Contacto</h1>
                    </div>
                    <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; border-top: none;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b; width: 30%;">Nombre:</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Institución:</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${institution || 'No especificada'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Email:</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #6366f1;"><a href="mailto:${email}" style="color: #6366f1; text-decoration: none;">${email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Teléfono:</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${phone || 'No proporcionado'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Categoría:</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${projectLabel}</td>
                            </tr>
                        </table>
                        
                        <div style="margin-top: 25px;">
                            <p style="font-weight: bold; color: #64748b; margin-bottom: 10px;">Mensaje:</p>
                            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; color: #334155; line-height: 1.6; border: 1px solid #e2e8f0;">
                                ${message ? message.replace(/\n/g, '<br>') : 'Sin mensaje adicional.'}
                            </div>
                        </div>

                        <div style="margin-top: 30px; padding: 15px; background: #eff6ff; border-radius: 8px; text-align: center;">
                            <p style="margin: 0; color: #1d4ed8; font-size: 14px; font-weight: 500;">
                                Este contacto ha sido registrado en Brevo (Lista ID: ${targetListId || 'Default'}).
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

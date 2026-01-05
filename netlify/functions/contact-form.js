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

        // 2. Enviar email de notificación (DISEÑO OPTIMIZADO PARA EMAILS)
        const emailPayload = {
            sender: {
                name: "Formulario Isinova",
                email: "noreply@isinova.cl",
            },
            to: [{ email: NOTIFICATION_EMAIL }],
            replyTo: { email: email, name: name },
            subject: `🚀 Nueva solicitud: ${projectLabel} - ${institution || name}`,
            htmlContent: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Nueva Solicitud</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9;">
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; width: 600px; max-width: 100%;">
                                    
                                    <tr>
                                        <td style="background-color: #6246ea; background: linear-gradient(135deg, #6246ea, #10b981); padding: 30px; text-align: center;">
                                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">
                                                Nueva Solicitud de Contacto
                                            </h1>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding: 30px;">
                                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                
                                                <tr>
                                                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b; width: 35%;">
                                                        Nombre:
                                                    </td>
                                                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">
                                                        ${name}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">
                                                        Institución:
                                                    </td>
                                                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">
                                                        ${institution || 'No especificada'}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">
                                                        Email:
                                                    </td>
                                                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                                                        <a href="mailto:${email}" style="color: #6246ea; text-decoration: none; font-weight: 500;">${email}</a>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">
                                                        Teléfono:
                                                    </td>
                                                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">
                                                        ${phone || 'No proporcionado'}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">
                                                        Categoría:
                                                    </td>
                                                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-weight: 500;">
                                                        ${projectLabel}
                                                    </td>
                                                </tr>
                                            </table>

                                            <div style="margin-top: 25px;">
                                                <p style="font-weight: bold; color: #64748b; margin-bottom: 10px; margin-top: 0;">Mensaje:</p>
                                                <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; color: #334155; line-height: 1.6; border: 1px solid #e2e8f0; font-size: 15px;">
                                                    ${message ? message.replace(/\n/g, '<br>') : 'Sin mensaje adicional.'}
                                                </div>
                                            </div>

                                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 30px;">
                                                <tr>
                                                    <td style="background-color: #eff6ff; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #dbeafe;">
                                                        <p style="margin: 0; color: #1e40af; font-size: 13px;">
                                                            ✓ Contacto registrado en Brevo (Lista ID: ${targetListId || 'Default'}).
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        
                                        </td>
                                    </tr>
                                </table>
                                <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
                                    Este correo fue generado automáticamente por el sistema de Isinova.
                                </p>
                            
                            </td>
                        </tr>
                    </table>

                </body>
                </html>
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
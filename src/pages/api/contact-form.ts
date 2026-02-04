import type { APIRoute, APIContext } from 'astro';

export const POST: APIRoute = async ({ request, locals }: APIContext) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    };

    try {
        const body = await request.json();
        const { name, email, institution, phone, project, message, listId, source, quizData } = body;

        // Validación básica
        if (!name || !email || !project) {
            return new Response(JSON.stringify({ error: "Datos incompletos" }), { status: 400, headers });
        }

        const env = (locals as any).runtime?.env || import.meta.env;
        const BREVO_API_KEY = env.BREVO_API_KEY;
        const BREVO_LIST_ID = env.BREVO_LIST_ID;

        // --- PREPARACIÓN DE DESTINATARIOS (Routing Mixto) ---
        // Helper para convertir "a@a.com, b@b.com" en array
        const parseRecipients = (envVar: string) => {
            const raw = envVar || "";
            return raw.split(',').map(e => e.trim()).filter(e => e).map(email => ({ email, name: "Equipo Isinova" }));
        };

        const RECIPIENTS_SALES = parseRecipients(env.NOTIFICATION_SALES);
        const RECIPIENTS_SUPPORT = parseRecipients(env.NOTIFICATION_SUPPORT);
        const RECIPIENTS_MARKETING = parseRecipients(env.NOTIFICATION_MARKETING);

        // Template IDs
        const TPL_RECEIPT = parseInt(env.BREVO_TEMPLATE_ID_RECEIPT || '1');
        const TPL_SALES_LEAD = parseInt(env.BREVO_TEMPLATE_ID_SALES_LEAD || '5');
        const TPL_QUIZ_CLIENT = parseInt(env.BREVO_TEMPLATE_ID_QUIZ_PROCESSING || '3');
        const TPL_QUIZ_INTERNAL = parseInt(env.BREVO_TEMPLATE_ID_QUIZ_INTERNAL || '4');
        const TPL_NEWSLETTER = parseInt(env.BREVO_TEMPLATE_ID_NEWSLETTER || '2');
        const TPL_NEWSLETTER_INTERNAL = parseInt(env.BREVO_TEMPLATE_ID_NEWSLETTER_INTERNAL || '9');
        const TPL_SUPPORT = parseInt(env.BREVO_TEMPLATE_ID_SUPPORT_ALERT || '6');

        if (!BREVO_API_KEY) {
            return new Response(JSON.stringify({ error: "Error de configuración de API" }), { status: 500, headers });
        }

        // --- 1. PREPARACIÓN DE DATOS ---
        const projectTypes: Record<string, string> = {
            lms: "Implementación LMS",
            web: "Desarrollo Web EdTech",
            data: "Migración de Datos",
            support: "Soporte Estratégico",
            newsletter: "Suscripción Newsletter",
            quiz_report: "Diagnóstico",
            other: "Otro Requerimiento",
        };
        const projectLabel = projectTypes[project] || project;
        const ticketId = Math.floor(1000 + Math.random() * 9000).toString();

        // Objecto de contacto unificado
        const contactAttributes = {
            NOMBRE: name.split(" ")[0],
            NOMBRE_COMPLETO: name,
            INSTITUCION: institution || "No especificada",
            TELEFONO: phone || "No especificado",
            TIPO_PROYECTO: projectLabel,
            MENSAJE: message || (project === "newsletter" ? "Suscripción desde Footer" : "Sin mensaje"),
            ORIGEN: source || "Web Isinova",
            EXT_ID: ticketId,
            ...(quizData ? {
                QUIZ_ETAPA: quizData.step1,
                QUIZ_PRIORIDAD: quizData.step2,
                QUIZ_VOLUMEN: quizData.step3,
                QUIZ_RESULTADO: quizData.resultTitle
            } : {})
        };

        // --- 2. SINCRONIZACIÓN CRM (Crear/Actualizar Contacto) ---
        // Esto mantiene la base de datos de Brevo ordenada, aunque los emails salgan por Transaccional via código.
        try {
            await fetch("https://api.brevo.com/v3/contacts", {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "content-type": "application/json",
                    "api-key": BREVO_API_KEY
                },
                body: JSON.stringify({
                    email: email,
                    attributes: contactAttributes,
                    updateEnabled: true,
                    listIds: [listId || parseInt(BREVO_LIST_ID || '2')]
                })
            });
        } catch (e) {
            console.error("CRM Sync Warning:", e);
        }

        // --- 3. LÓGICA DE EMAILS TRANSACCIONALES (Code-Driven) ---

        // Helper para enviar correo (Soporta múltiples destinatarios en 'to')
        const sendEmail = async (to: any[], templateId: number, params: any) => {
            console.log(`[Brevo] Sending Template ${templateId} to ${JSON.stringify(to)}. Payload: flat params`);
            const res = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "content-type": "application/json",
                    "api-key": BREVO_API_KEY
                },
                body: JSON.stringify({
                    to: to, // 'to' ya es un array de objetos {email, name}
                    templateId: templateId,
                    params: params
                })
            });
            if (!res.ok) console.error(`Email Error (Tpl ${templateId}):`, await res.text());
        };

        const promises = [];

        // CASO A: QUIZ (Diagnóstico) -> VENTAS
        if (quizData) {
            // 1. Al Cliente
            promises.push(sendEmail([{ email, name }], TPL_QUIZ_CLIENT, contactAttributes));
            // 2. Al Equipo Ventas
            promises.push(sendEmail(RECIPIENTS_SALES, TPL_QUIZ_INTERNAL, contactAttributes));
        }
        // CASO B: SOPORTE -> SOPORTE
        else if (project === 'support') {
            // 1. Al Cliente
            promises.push(sendEmail([{ email, name }], TPL_RECEIPT, contactAttributes));
            // 2. Al Equipo Soporte
            promises.push(sendEmail(RECIPIENTS_SUPPORT, TPL_SUPPORT, contactAttributes));
        }
        // CASO C: NEWSLETTER -> MARKETING
        else if (project === 'newsletter') {
            // 1. Al Cliente
            promises.push(sendEmail([{ email, name }], TPL_NEWSLETTER, contactAttributes));
            // 2. Al Equipo Marketing (si existe template)
            if (TPL_NEWSLETTER_INTERNAL) {
                promises.push(sendEmail(RECIPIENTS_MARKETING, TPL_NEWSLETTER_INTERNAL, contactAttributes));
            }
        }
        // CASO D: CONTACTO GENERAL -> VENTAS (Default)
        else {
            // 1. Al Cliente
            promises.push(sendEmail([{ email, name }], TPL_RECEIPT, contactAttributes));
            // 2. Al Equipo Ventas
            promises.push(sendEmail(RECIPIENTS_SALES, TPL_SALES_LEAD, contactAttributes));
        }

        await Promise.all(promises);

        return new Response(JSON.stringify({ success: true }), { status: 200, headers });

    } catch (error) {
        console.error("API Error General", error);
        return new Response(JSON.stringify({ error: "Server Error" }), { status: 500, headers });
    }
};

export const OPTIONS: APIRoute = async () => {
    return new Response(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
        }
    });
};

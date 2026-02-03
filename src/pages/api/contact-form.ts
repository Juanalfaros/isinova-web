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

        const env = (locals as any).runtime?.env;
        const BREVO_API_KEY = env?.BREVO_API_KEY;
        const BREVO_LIST_ID = env?.BREVO_LIST_ID;
        const RECAPTCHA_SECRET_KEY = env?.RECAPTCHA_SECRET_KEY;

        if (!BREVO_API_KEY) {
            return new Response(JSON.stringify({ error: "Error de configuración de API" }), { status: 500, headers });
        }

        // --- 1. RECAPTCHA Check (Opcional si está configurado) ---
        if (RECAPTCHA_SECRET_KEY) {
            const { recaptchaToken } = body;
            if (recaptchaToken) {
                try {
                    const verify = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`, { method: "POST" });
                    const vData = await verify.json();
                    if (!vData.success || vData.score < 0.5) {
                        console.warn("Recaptcha low score or failure", vData);
                    }
                } catch (e) {
                    console.error("Error verificando reCAPTCHA", e);
                }
            }
        }

        // --- 2. PREPARACIÓN DE DATOS ---
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

        // Generamos un ID de ticket simple para auditoría interna en Brevo
        const ticketId = Math.floor(1000 + Math.random() * 9000).toString();

        // --- 3. SINCRONIZACIÓN CON BREVO CRM ---
        // Enviamos todos los datos como atributos para que puedas usarlos en tus Automatizaciones Visuales
        const contactPayload: any = {
            email: email,
            attributes: {
                NOMBRE: name.split(" ")[0],
                NOMBRE_COMPLETO: name,
                INSTITUCION: institution || "No especificada",
                TELEFONO: phone || "No especificado",
                TIPO_PROYECTO: projectLabel,
                MENSAJE: message || (project === "newsletter" ? "Suscripción desde Footer" : "Sin mensaje"),
                ORIGEN: source || "Web Isinova",
                EXT_ID: ticketId,
                // Atributos del Quiz (Si existen)
                ...(quizData ? {
                    QUIZ_ETAPA: quizData.step1,
                    QUIZ_PRIORIDAD: quizData.step2,
                    QUIZ_VOLUMEN: quizData.step3,
                    QUIZ_RESULTADO: quizData.resultTitle
                } : {})
            },
            updateEnabled: true, // Si el contacto existe, lo actualiza
            listIds: [listId || parseInt(BREVO_LIST_ID || '2')] // Se añade a la lista correspondiente
        };

        const response = await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": BREVO_API_KEY
            },
            body: JSON.stringify(contactPayload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error sincronizando con Brevo:", errorText);
            // Seguimos adelante para no bloquear al usuario si es un error de "Ya existe en la lista"
        }

        // IMPORTANTE: Aquí termina el proceso. No se envían correos desde el código.
        // Toda la lógica de envío de emails (Internos y Clientes) debe ser configurada 
        // en Brevo mediante Workflows de Automatización disparados por "Añadir a lista" 
        // o "Actualizar atributo".

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

import { defineCollection, z } from 'astro:content';

const serviciosCollection = defineCollection({
    type: 'content', // Use 'content' for MDX files (body contains the full HTML content)
    schema: z.object({
        slug: z.string().optional(), // In content collections, slug is usually file name, but keeping it for compatibility if referenced explicitly
        featured: z.boolean().optional(),
        shortTitle: z.string().optional(),
        icon: z.string(),
        heroImage: z.string(),
        heroTitle: z.string(),
        title: z.string(),
        description: z.string(),
        tags: z.array(z.string()),
        price: z.string(),
        duration: z.string(),
        calLinkPrefix: z.string(),
        // Section specific titles/subtitles
        titleSituaciones: z.string(),
        subtitleSituaciones: z.string(),
        titleEnfoque: z.string(),
        subtitleEnfoque: z.string(),
        titleTips: z.string(),
        subtitleTips: z.string(),
        titleFaqs: z.string(),
        subtitleFaqs: z.string(),
        // Arrays of objects
        situaciones: z.array(z.object({
            icon: z.string(),
            text: z.string(),
        })),
        enfoque: z.array(z.object({
            numero: z.string(),
            titulo: z.string(),
            texto: z.string(),
        })),
        highlightBox: z.object({
            h3: z.string(),
            p: z.string(),
        }),
        tips: z.array(z.object({
            icon: z.string(),
            title: z.string(),
            text: z.string(),
        })),
        faqs: z.array(z.object({
            question: z.string(),
            answer: z.string(),
        })),
        bookingCard: z.object({
            title: z.string(),
            paragraph: z.string(),
            benefits: z.array(z.object({
                icon: z.string(),
                text: z.string(),
            })),
            buttonText: z.string(),
        }),
    }),
});

const equipoCollection = defineCollection({
    type: 'data',
    schema: ({ image }) => z.object({
        name: z.string(),
        role: z.string(),
        bio: z.string(),
        specialties: z.array(z.string()),
        isLeader: z.boolean(),
        initials: z.string(),
        image: image(),
        mail: z.string().email().optional(),
        linkedin: z.string().url().optional(),
        order: z.number().optional(),
    }),
});

export const collections = {
    'servicios': serviciosCollection,
    'equipo': equipoCollection,
};

import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.date(),
    sourceUrl: z.string().optional(),
    sourceAuthor: z.string().optional(),
    country: z.enum([
      'brasil', 'eua', 'russia', 'china', 'israel',
      'ucrania', 'alemanha'
    ]),
  }),
});

export const collections = { posts };

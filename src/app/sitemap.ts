import { MetadataRoute } from 'next'
import { psychologistService } from '@/services/psychologist.service'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mindcare.com.co'

  // Fetch all psychologists to include in sitemap
  let psychologists: any[] = []
  try {
    psychologists = await psychologistService.getVerifiedPsychologists()
  } catch (error) {
    console.error('Failed to fetch psychologists for sitemap')
  }

  const psychologistUrls = psychologists.map((psy) => ({
    url: `${baseUrl}/psychologists/${psy.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/psychologists`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...psychologistUrls,
  ]
}

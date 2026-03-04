import { buildUrlSet, SITE_URL } from "@/app/lib/sitemapHelper";

export async function GET() {
    const today = new Date().toISOString().split('T')[0];

    const urls = [
        { loc: `${SITE_URL}/`, lastmod: today },
        { loc: `${SITE_URL}/achievements`, lastmod: today },
        { loc: `${SITE_URL}/floorplanner`, lastmod: today },
        { loc: `${SITE_URL}/fusions`, lastmod: today },
        { loc: `${SITE_URL}/gifts`, lastmod: today },
        { loc: `${SITE_URL}/themepacks`, lastmod: today },
        { loc: `${SITE_URL}/universal`, lastmod: today },
    ];

    return new Response(buildUrlSet(urls), {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400',
        },
    });
}

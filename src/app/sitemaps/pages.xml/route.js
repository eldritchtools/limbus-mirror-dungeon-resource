import { buildUrlSet, SITE_URL } from "@/app/lib/sitemapHelper";

export async function GET() {
    const today = new Date().toISOString().split('T')[0];

    const urls = [
        { loc: `${SITE_URL}/`, lastmod: today },
        { loc: `${SITE_URL}/builds`, lastmod: today },
        { loc: `${SITE_URL}/identities`, lastmod: today },
        { loc: `${SITE_URL}/egos`, lastmod: today },
    ];

    return new Response(buildUrlSet(urls), {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400',
        },
    });
}

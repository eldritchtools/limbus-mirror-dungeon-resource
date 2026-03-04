/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
    },
    reactCompiler: true,
    env: {
        NEXT_PUBLIC_LAST_UPDATED: new Date().toISOString(),
    },
    // async headers() {
    //     // Only apply CSP in production
    //     if (process.env.NODE_ENV !== "production") {
    //         return [];
    //     }

    //     const csp = [
    //         "default-src 'self'",
    //         "img-src 'self' https: data:",
    //         "style-src 'self' 'unsafe-inline'",
    //         "font-src 'self' https:",
    //         "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    //         "connect-src 'self' https:",
    //         "frame-ancestors 'none'",
    //     ].join("; ");

    //     return [
    //         {
    //             source: "/(.*)",
    //             headers: [
    //                 {
    //                     key: "Content-Security-Policy",
    //                     value: csp,
    //                 },
    //             ],
    //         },
    //     ];
    // },
};

export default nextConfig;

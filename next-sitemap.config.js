/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://rules.fyi',
    generateRobotsTxt: true, // (optional)
    // ...other options
}
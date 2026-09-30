import { databaseUrl, uploadsDirectory } from "./config/storage.mjs";
import { enquiriesPlugin } from "@northfield/enquiries";
import node from "@astrojs/node";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import emdash, { local } from "emdash/astro";
import { sqlite } from "emdash/db";

const publicSite = process.env.EMDASH_SITE_URL ? new URL(process.env.EMDASH_SITE_URL) : undefined;

export default defineConfig({
	...(publicSite ? {
		site: publicSite.origin,
		security: { allowedDomains: [{ hostname: publicSite.hostname, protocol: publicSite.protocol.slice(0, -1) }] },
	} : {}),
	output: "server",
	adapter: node({
		mode: "standalone",
	}),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			plugins: [enquiriesPlugin()],
			database: sqlite({ url: databaseUrl }),
			storage: local({
				directory: uploadsDirectory,
				baseUrl: "/_emdash/api/media/file",
			}),
		}),
	],
	devToolbar: { enabled: false },
});

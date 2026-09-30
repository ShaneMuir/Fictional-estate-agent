# Local editor walkthrough

Use the admin URL from README. Normal passkey registration must be completed by the person who owns the account. For this isolated local evaluation, the official development sign-in opens the existing Dev Admin session without registering a passkey.

1. Open **Properties**. Create a property with a unique slug/reference, title, transaction type, price, qualifier, availability and property type. Add images and select its agent/branch/area. Save as a draft.
2. Open its **Preview** action. The signed preview should show the draft. Opening the clean public URL in an unsigned session should return 404.
3. Publish the property. Open the clean URL again; it should now render.
4. Edit its title or price and save. The public page keeps the published version until **Publish changes**.
5. Change **Availability** to **Sold**, save and publish. The entry remains published, and the public listing shows Sold. The viewing endpoint will reject a new viewing request for it.
6. Open revision history, restore the earlier Available version and publish the restored draft. The earlier content returns on the public page.
7. Open **Site Content → Shared site content**. Change `Shared CTA heading`, save and publish. Compare the homepage and selling page. Both use the same shared content. Restore the original copy afterward if desired.
8. Open **Pages → home**. Reorder or edit native layout blocks. Each block has a supported type; the custom Astro renderer controls visual presentation.
9. Submit a fictional viewing or valuation enquiry on the public site. In **Private enquiries**, inspect its property association and captured test email, change assigned colleague/status and save.
10. Review the permissions evidence: Subscribers, Contributors and Authors are denied private enquiries; Editors can manage them but cannot manage users; Contributors cannot publish. Invite real test users only when you want to assess human sign-in, with a configured test email transport and user-owned passkeys.

The automated equivalent is `node scripts/verify.mjs`. Its workflow property is moved to trash afterwards, and its shared CTA change is reverted. Test enquiries remain labelled as test data so the inbox can be reviewed.

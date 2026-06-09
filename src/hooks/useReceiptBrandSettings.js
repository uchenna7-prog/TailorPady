import { useProfileSettings } from "../contexts/ProfileSettingsContext";
import { useGeneralSettings } from "../contexts/GeneralSettingsContext";

const PLACEHOLDERS = {
    name: 'Your Brand Name',
    tagline: 'Your tagline here',
    phone: '+234 000 000 0000',
    email: 'email@yourdomain.com',
    address: '1 Brand Street, Lagos',
    website: 'www.yourbrand.com',
    accountBank: 'Your Bank',
    accountNumber: '0000000000',
    accountName: 'Your Account Name',
}

export function useReceiptBrandSettings() {

    const { generalSettings } = useGeneralSettings()
    const { profileSettings } = useProfileSettings()

    const RECEIPT_BRAND_SETTINGS = {

        name: profileSettings.brandName || PLACEHOLDERS.name,
        tagline: profileSettings.brandTagline || PLACEHOLDERS.tagline,
        colourId: profileSettings.brandColourId || 'classic-warm-black',
        colour: profileSettings.brandColour || '#1C1814',
        logo: profileSettings.brandLogo || null,

        phone: profileSettings.brandPhone || PLACEHOLDERS.phone,
        email: profileSettings.brandEmail || PLACEHOLDERS.email,
        address: profileSettings.brandAddress || PLACEHOLDERS.address,
        website: profileSettings.brandWebsite || PLACEHOLDERS.website,

        signature: profileSettings.brandSignature || null,

        accountBank: profileSettings.accountBank || PLACEHOLDERS.accountBank,
        accountNumber: profileSettings.accountNumber || PLACEHOLDERS.accountNumber,
        accountName: profileSettings.accountName || PLACEHOLDERS.accountName,

        prefix: generalSettings.receiptPrefix || 'RCP',
        currency: generalSettings.receiptCurrency.symbol || '₦',
        template: generalSettings.receiptTemplate || 'receiptTemplate1',
        showTax: generalSettings.receiptShowTax || false,
        taxRate: generalSettings.receiptTaxRate || 0,
        footer: generalSettings.receiptFooter || 'Thank you for your patronage 🙏',

    }

    return RECEIPT_BRAND_SETTINGS

}
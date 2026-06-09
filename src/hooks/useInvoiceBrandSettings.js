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

export function useInvoiceBrandSettings() {

    const { generalSettings } = useGeneralSettings()
    const { profileSettings } = useProfileSettings()

    const INVOICE_BRAND_SETTINGS = {

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
        paymentTerms: profileSettings.brandPaymentTerms?.length > 0
        ? profileSettings.brandPaymentTerms
        : ['Payment Term 1', 'Payment Term 2'],

        accountBank: profileSettings.accountBank || PLACEHOLDERS.accountBank,
        accountNumber: profileSettings.accountNumber || PLACEHOLDERS.accountNumber,
        accountName: profileSettings.accountName || PLACEHOLDERS.accountName,

        prefix: generalSettings.invoicePrefix || 'INV',
        currency: generalSettings.invoiceCurrency.symbol || '₦',
        template: generalSettings.invoiceTemplate || 'invoiceTemplate1',
        dueDays: generalSettings.invoiceDueDays || 7,
        showTax: generalSettings.invoiceShowTax || false,
        taxRate: generalSettings.invoiceTaxRate || 0,
        footer: generalSettings.invoiceFooter || 'Thank you for your patronage 🙏',

    }

    return INVOICE_BRAND_SETTINGS

}
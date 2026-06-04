import { InvoiceTemplate1 }  from '../../../components/Templates/InvoiceTemplates/Template1'
import { InvoiceTemplate2 }  from '../../../components/Templates/InvoiceTemplates/Template2'
import { InvoiceTemplate3 }  from '../../../components/Templates/InvoiceTemplates/Template3'
import { InvoiceTemplate4 }  from '../../../components/Templates/InvoiceTemplates/Template4'
import { InvoiceTemplate5 }  from '../../../components/Templates/InvoiceTemplates/Template5'
import { InvoiceTemplate6 }  from '../../../components/Templates/InvoiceTemplates/Template6'
import { InvoiceTemplate7 }  from '../../../components/Templates/InvoiceTemplates/Template7'
import { InvoiceTemplate8 }  from '../../../components/Templates/InvoiceTemplates/Template8'
import { InvoiceTemplate9 }  from '../../../components/Templates/InvoiceTemplates/Template9'
import { InvoiceTemplate10 } from '../../../components/Templates/InvoiceTemplates/Template10'
import { InvoiceTemplate11 } from '../../../components/Templates/InvoiceTemplates/Template11'
import { InvoiceTemplate12 } from '../../../components/Templates/InvoiceTemplates/Template12'
import { InvoiceTemplate13 } from '../../../components/Templates/InvoiceTemplates/Template13'
import { InvoiceTemplate14 } from '../../../components/Templates/InvoiceTemplates/Template14'
import { InvoiceTemplate15 } from '../../../components/Templates/InvoiceTemplates/Template15'
import { InvoiceTemplate16 } from '../../../components/Templates/InvoiceTemplates/Template16'
import { InvoiceTemplate17 } from '../../../components/Templates/InvoiceTemplates/Template17'
import { InvoiceTemplate18 } from '../../../components/Templates/InvoiceTemplates/Template18'
import { InvoiceTemplate19 } from '../../../components/Templates/InvoiceTemplates/Template19'
import { InvoiceTemplate20 } from '../../../components/Templates/InvoiceTemplates/Template20'

const ALL_REQUIRES = [
  'logo',
  'name',
  'tagline',
  'address',
  'phone',
  'email',
  'website',
  'signature',
  'accountBank',
  'accountNumber',
  'accountName',
  'paymentTerms',
]

export const INVOICE_TEMPLATE_GROUPS = [
  {
    groupLabel: 'Clean',
    templates: [
      {
        id: 'invoiceTemplate1',
        label: 'Balanced',
        tags: ['clean', 'no logo'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate1,
      },
      {
        id: 'invoiceTemplate2',
        label: 'Sectioned',
        tags: ['clean', 'has logo'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate2,
      },

      {
        id: 'invoiceTemplate3',
        label: 'Spine',
        tags: ['clean', 'has logo', 'terms'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate3,
      },

      {
        id: 'invoiceTemplate4',
        label: 'Info Pair',
        tags: ['clean', 'has logo'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate4,
      },


      {
        id: 'invoiceTemplate5',
        label: 'Parallel',
        tags: ['clean', 'no logo'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate5,
      },
      {
        id: 'invoiceTemplate6',
        label: 'Bold Corporate',
        tags: ['clean', 'has logo'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate6,
      },
      {
        id: 'invoiceTemplate7',
        label: 'Refined Full',
        tags: ['clean', 'has logo'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate7,
      },
    ],
  },

  {
    groupLabel: 'Accent',
    templates: [
      {
        id: 'invoiceTemplate8',
        label: 'Colour Header',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate8,
      },
      {
        id: 'invoiceTemplate9',
        label: 'Info Bar',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate9,
      },
      {
        id: 'invoiceTemplate10',
        label: 'Stitched Top',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate10,
      },
      {
        id: 'invoiceTemplate11',
        label: 'Header Band',
        tags: ['accent', 'has logo', 'signature'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate11,
      },
      {
        id: 'invoiceTemplate12',
        label: 'Full Details',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate12,
      },
      {
        id: 'invoiceTemplate13',
        label: 'Amount First',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate13,
      },
      {
        id: 'invoiceTemplate14',
        label: 'Summary Panel',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate14,
      },
      {
        id: 'invoiceTemplate15',
        label: 'Simple Footer',
        tags: ['accent', 'no logo', 'notes'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate15,
      },
      {
        id: 'invoiceTemplate16',
        label: 'Stitched Split',
        tags: ['accent', 'has logo', 'terms'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate16,
      },
      {
        id: 'invoiceTemplate17',
        label: 'Corner Block',
        tags: ['accent', 'has logo', 'notes'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate17,
      },
      {
        id: 'invoiceTemplate18',
        label: 'Diagonal Cut',
        tags: ['accent', 'no logo', 'has signature'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate18,
      },
    ],
  },

  {
    groupLabel: 'Solid',
    templates: [
      {
        id: 'invoiceTemplate19',
        label: 'Full Background',
        tags: ['solid', 'no logo', 'terms'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate19,
      },
      {
        id: 'invoiceTemplate20',
        label: 'Colour Block',
        tags: ['solid', 'no logo', 'terms'],
        requires: ALL_REQUIRES,
        Component: InvoiceTemplate20,
      },
    ],
  },
]
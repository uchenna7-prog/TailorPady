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
import { InvoiceTemplate21 } from '../../../components/Templates/InvoiceTemplates/Template21'
import {InvoiceTemplate22 } from '../../../components/Templates/InvoiceTemplates/Template22'


export const INVOICE_TEMPLATE_GROUPS = [
  {
    groupLabel: 'Clean',
    templates: [
      {
        id: 'invoiceTemplate1',
        label: 'Balanced',
        tags: ['clean', 'no logo'],
        requires: [
          'name',
          'tagline',
          'address',
          'phone',
          'email',
          'accountBank',
          'accountNumber',
          'accountName',
        ],
        Component: InvoiceTemplate1,
      },
      {
        id: 'invoiceTemplate2',
        label: 'Sectioned',
        tags: ['clean', 'has logo'],
        requires: [
          'logo',
          'name',
          'address',
          'phone',
          'email',
          'accountBank',
          'accountNumber',
          'accountName'
        ],
        Component: InvoiceTemplate2,
      },

      {
        id: 'invoiceTemplate3',
        label: 'Spine',
        tags: ['clean', 'has logo', 'payment terms'],
        requires: [
          'logo',
          'name',
          'tagline',
          'address',
          'phone',
          'email',
          'website',
          'accountBank',
          'accountNumber',
          'accountName',
          'paymentTerms',
        ],
        Component: InvoiceTemplate3,
      },

      {
        id: 'invoiceTemplate4',
        label: 'Info Pair',
        tags: ['clean', 'has logo'],
        requires: [
          'logo',
          'name',
          'address',
          'phone',
          'email',
          'website',
          'accountBank',
          'accountNumber',
          'accountName'
        ],
        Component: InvoiceTemplate4,
      },


      {
        id: 'invoiceTemplate5',
        label: 'Parallel',
        tags: ['clean', 'no logo'],
        requires: [
          'name',
          'address',
          'phone',
          'email',
          'accountBank',
          'accountNumber',
          'accountName',
        ],
        Component: InvoiceTemplate5,
      },

        {
        id: 'invoiceTemplate6',
        label: 'Gradient',
        tags: ['clean', 'has logo', 'payment terms','has signature'],
        requires: [
          'name',
          'address',
          'phone',
          'email',
          'accountBank',
          'accountNumber',
          'accountName',
          'paymentTerms',
        ],
        Component: InvoiceTemplate6,
      },
      {
        id: 'invoiceTemplate7',
        label: 'Gradient',
        tags: ['clean', 'has logo','has signature'],
        requires: [
          'name',
          'address',
          'phone',
          'email',
          'accountBank',
          'accountNumber',
          'accountName',
          'paymentTerms',
        ],
        Component: InvoiceTemplate7,
      },

      {
        id: 'invoiceTemplate8',
        label: 'Bold Corporate',
        tags: ['clean', 'has logo'],
        requires: [
          'logo',
          'name',
          'address',
          'phone',
          'email',
          'accountBank',
          'accountNumber',
          'accountName',
        ],
        Component: InvoiceTemplate8,
      },
      {
        id: 'invoiceTemplate9',
        label: 'Refined Full',
        tags: ['clean', 'has logo'],
        requires: [
          'logo',
          'name',
          'address',
          'phone',
          'email',
          'website',
          'accountBank',
          'accountNumber',
          'accountName'
        ],
        Component: InvoiceTemplate9,
      },
    ],
  },

  {
    groupLabel: 'Accent',
    templates: [
      {
        id: 'invoiceTemplate10',
        label: 'Colour Header',
        tags: ['accent', 'has logo'],
        requires: [
          'logo',
          'name',
          'address',
          'phone',
          'email',
          'accountBank',
          'accountNumber',
          'accountName',
        ],
        Component: InvoiceTemplate10,
      },
      {
        id: 'invoiceTemplate11',
        label: 'Info Bar',
        tags: ['accent', 'has logo'],
        requires: [
          'logo',
          'name',
          'tagline',
          'address',
          'phone',
          'email',
          'website',
          'accountBank',
          'accountNumber',
          'accountName'
        ],
        Component: InvoiceTemplate11,
      },
      {
        id: 'invoiceTemplate12',
        label: 'Stitched Top',
        tags: ['accent', 'has logo'],
        requires: [
          'logo',
          'name',
          'tagline',
          'address',
          'phone',
          'email',
          'website',
          'accountBank',
          'accountNumber',
          'accountName'
        ],
        Component: InvoiceTemplate12,
      },
      {
        id: 'invoiceTemplate13',
        label: 'Header Band',
        tags: ['accent', 'has logo', 'signature'],
        requires: [
          'logo',
          'name',
          'tagline',
          'address',
          'phone',
          'email',
          'signature',
          'accountBank',
          'accountNumber',
          'accountName'
        ],
        Component: InvoiceTemplate13,
      },
      {
        id: 'invoiceTemplate14',
        label: 'Full Details',
        tags: ['accent', 'has logo'],
        requires: [
          'logo',
          'name',
          'address',
          'phone',
          'email',
          'accountBank',
          'accountNumber',
          'accountName',
        ],
        Component: InvoiceTemplate14,
      },
      {
        id: 'invoiceTemplate15',
        label: 'Amount First',
        tags: ['accent', 'has logo'],
        requires: [
          'logo',
          'name',
          'tagline',
          'address',
          'phone',
          'email',
          'website',
          'accountBank',
          'accountNumber',
          'accountName',
        ],
        Component: InvoiceTemplate15,
      },
      {
        id: 'invoiceTemplate16',
        label: 'Summary Panel',
        tags: ['accent', 'has logo'],
        requires: [
          'logo',
          'name',
          'tagline',
          'address',
          'phone',
          'email',
          'accountBank',
          'accountNumber',
          'accountName'
        ],
        Component: InvoiceTemplate16,
      },
      {
        id: 'invoiceTemplate17',
        label: 'Simple Footer',
        tags: ['accent', 'no logo'],
        requires: [
          'name',
          'tagline',
          'address',
          'phone',
          'email',
          'accountBank',
          'accountNumber',
          'accountName',
        ],
        Component: InvoiceTemplate17,
      },
      {
        id: 'invoiceTemplate18',
        label: 'Stitched Split',
        tags: ['accent', 'has logo', 'payment terms'],
        requires: [
          'logo',
          'name',
          'tagline',
          'address',
          'phone',
          'email',
          'website',
          'accountBank',
          'accountNumber',
          'accountName',
          'paymentTerms',
        ],
        Component: InvoiceTemplate18,
      },
      {
        id: 'invoiceTemplate19',
        label: 'Corner Block',
        tags: ['accent', 'has logo', 'notes'],
        requires: [
          'logo',
          'name',
          'tagline',
          'address',
          'phone',
          'email',
          'website',
          'accountBank',
          'accountNumber',
          'accountName',
        ],
        Component: InvoiceTemplate19,
      },
      {
        id: 'invoiceTemplate20',
        label: 'Diagonal Cut',
        tags: ['accent', 'no logo', 'has signature'],
        requires: [
          'name',
          'address',
          'phone',
          'email',
          'signature',
          'accountBank',
          'accountNumber',
          'accountName',
        ],
        Component: InvoiceTemplate20,
      },
    ],
  },


  {
    groupLabel: 'Solid',
    templates: [
      {
        id: 'invoiceTemplate21',
        label: 'Full Background',
        tags: ['solid', 'no logo', 'payment terms'],
        requires: [
          'name',
          'address',
          'phone',
          'email',
          'accountBank',
          'accountNumber',
          'accountName',
          'paymentTerms',
        ],
        Component: InvoiceTemplate21,
      },
      {
        id: 'invoiceTemplate22',
        label: 'Colour Block',
        tags: ['solid', 'no logo', 'payment terms'],
        requires: [
          'name',
          'address',
          'phone',
          'email',
          'website',
          'accountBank',
          'accountNumber',
          'accountName',
          'paymentTerms',
        ],
        Component: InvoiceTemplate22,
      },
    ],
  },

]
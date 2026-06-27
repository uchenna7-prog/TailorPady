import { ReceiptTemplate1 }  from '../../../components/Templates/ReceiptTemplates/Template1'
import { ReceiptTemplate2 }  from '../../../components/Templates/ReceiptTemplates/Template2'
import { ReceiptTemplate3 }  from '../../../components/Templates/ReceiptTemplates/Template3'
import { ReceiptTemplate4 }  from '../../../components/Templates/ReceiptTemplates/Template4'
import { ReceiptTemplate5 }  from '../../../components/Templates/ReceiptTemplates/Template5'
import { ReceiptTemplate6 }  from '../../../components/Templates/ReceiptTemplates/Template6'
import { ReceiptTemplate7 }  from '../../../components/Templates/ReceiptTemplates/Template7'
import { ReceiptTemplate8 }  from '../../../components/Templates/ReceiptTemplates/Template8'
import { ReceiptTemplate9 }  from '../../../components/Templates/ReceiptTemplates/Template9'
import { ReceiptTemplate10 } from '../../../components/Templates/ReceiptTemplates/Template10'
import { ReceiptTemplate11 } from '../../../components/Templates/ReceiptTemplates/Template11'
import { ReceiptTemplate12 } from '../../../components/Templates/ReceiptTemplates/Template12'
import { ReceiptTemplate13 } from '../../../components/Templates/ReceiptTemplates/Template13'
import { ReceiptTemplate14 } from '../../../components/Templates/ReceiptTemplates/Template14'
import { ReceiptTemplate15 } from '../../../components/Templates/ReceiptTemplates/Template15'
import { ReceiptTemplate16 } from '../../../components/Templates/ReceiptTemplates/Template16'
import { ReceiptTemplate17 } from '../../../components/Templates/ReceiptTemplates/Template17'
import { ReceiptTemplate18 } from '../../../components/Templates/ReceiptTemplates/Template18'
import { ReceiptTemplate19 } from '../../../components/Templates/ReceiptTemplates/Template19'
import { ReceiptTemplate20 } from '../../../components/Templates/ReceiptTemplates/Template20'
import { ReceiptTemplate21 } from '../../../components/Templates/ReceiptTemplates/Template21'
import {ReceiptTemplate22 } from '../../../components/Templates/ReceiptTemplates/Template22'


export const RECEIPT_TEMPLATE_GROUPS = [
  {
    groupLabel: 'Clean',
    templates: [
      {
        id: 'receiptTemplate1',
        label: 'Balanced',
        tags: ['clean', 'no logo'],
        requires: [
          'name',
          'tagline',
          'address',
          'phone',
          'email',
          'accountName',
        ],
        Component: ReceiptTemplate1,
      },
      {
        id: 'receiptTemplate2',
        label: 'Sectioned',
        tags: ['clean', 'has logo'],
        requires: [
          'logo',
          'name',
          'address',
          'phone',
          'email',
          'accountName'
        ],
        Component: ReceiptTemplate2,
      },

      {
        id: 'receiptTemplate3',
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
          'accountName',
   
        ],
        Component: ReceiptTemplate3,
      },

      {
        id: 'receiptTemplate4',
        label: 'Info Pair',
        tags: ['clean', 'has logo'],
        requires: [
          'logo',
          'name',
          'address',
          'phone',
          'email',
          'website',
          'accountName'
        ],
        Component: ReceiptTemplate4,
      },


      {
        id: 'receiptTemplate5',
        label: 'Parallel',
        tags: ['clean', 'no logo'],
        requires: [
          'name',
          'address',
          'phone',
          'email',
          'accountName',
        ],
        Component: ReceiptTemplate5,
      },

        {
        id: 'receiptTemplate6',
        label: 'Gradient',
        tags: ['clean', 'has logo', 'payment terms','has signature'],
        requires: [
          'name',
          'address',
          'phone',
          'email',
          'accountName',
   
        ],
        Component: ReceiptTemplate6,
      },
      {
        id: 'receiptTemplate7',
        label: 'Gradient',
        tags: ['clean', 'has logo', 'payment terms','has signature'],
        requires: [
          'name',
          'address',
          'phone',
          'email',
          'accountName',
   
        ],
        Component: ReceiptTemplate7,
      },

      {
        id: 'receiptTemplate8',
        label: 'Bold Corporate',
        tags: ['clean', 'has logo'],
        requires: [
          'logo',
          'name',
          'address',
          'phone',
          'email',
          'accountName',
        ],
        Component: ReceiptTemplate8,
      },
      {
        id: 'receiptTemplate9',
        label: 'Refined Full',
        tags: ['clean', 'has logo'],
        requires: [
          'logo',
          'name',
          'address',
          'phone',
          'email',
          'website',
          'accountName'
        ],
        Component: ReceiptTemplate9,
      },
    ],
  },

  {
    groupLabel: 'Accent',
    templates: [
      {
        id: 'receiptTemplate10',
        label: 'Colour Header',
        tags: ['accent', 'has logo'],
        requires: [
          'logo',
          'name',
          'address',
          'phone',
          'email',
          'accountName',
        ],
        Component: ReceiptTemplate10,
      },
      {
        id: 'receiptTemplate11',
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
          'accountName'
        ],
        Component: ReceiptTemplate11,
      },
      {
        id: 'receiptTemplate12',
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
          'accountName'
        ],
        Component: ReceiptTemplate12,
      },
      {
        id: 'receiptTemplate13',
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
          'accountName'
        ],
        Component: ReceiptTemplate13,
      },
      {
        id: 'receiptTemplate14',
        label: 'Full Details',
        tags: ['accent', 'has logo'],
        requires: [
          'logo',
          'name',
          'address',
          'phone',
          'email',
          'accountName',
        ],
        Component: ReceiptTemplate14,
      },
      {
        id: 'receiptTemplate15',
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
          'accountName',
        ],
        Component: ReceiptTemplate15,
      },
      {
        id: 'receiptTemplate16',
        label: 'Summary Panel',
        tags: ['accent', 'has logo'],
        requires: [
          'logo',
          'name',
          'tagline',
          'address',
          'phone',
          'email',
          'accountName'
        ],
        Component: ReceiptTemplate16,
      },
      {
        id: 'receiptTemplate17',
        label: 'Simple Footer',
        tags: ['accent', 'no logo'],
        requires: [
          'name',
          'tagline',
          'address',
          'phone',
          'email',
          'accountName',
        ],
        Component: ReceiptTemplate17,
      },
      {
        id: 'receiptTemplate18',
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
          'accountName',
   
        ],
        Component: ReceiptTemplate18,
      },
      {
        id: 'receiptTemplate19',
        label: 'Corner Block',
        tags: ['accent', 'has logo'],
        requires: [
          'logo',
          'name',
          'tagline',
          'address',
          'phone',
          'email',
          'website',
          'accountName',
        ],
        Component: ReceiptTemplate19,
      },
      {
        id: 'receiptTemplate20',
        label: 'Diagonal Cut',
        tags: ['accent', 'no logo', 'has signature'],
        requires: [
          'name',
          'address',
          'phone',
          'email',
          'signature',
          'accountName',
        ],
        Component: ReceiptTemplate20,
      },
    ],
  },


  {
    groupLabel: 'Solid',
    templates: [
      {
        id: 'receiptTemplate21',
        label: 'Full Background',
        tags: ['solid', 'no logo', 'payment terms'],
        requires: [
          'name',
          'address',
          'phone',
          'email',
          'accountName',
   
        ],
        Component: ReceiptTemplate21,
      },
      {
        id: 'receiptTemplate22',
        label: 'Colour Block',
        tags: ['solid', 'no logo', 'payment terms'],
        requires: [
          'name',
          'address',
          'phone',
          'email',
          'website',
          'accountName',
   
        ],
        Component: ReceiptTemplate22,
      },
    ],
  },

]
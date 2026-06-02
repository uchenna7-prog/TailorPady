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

export const RECEIPT_TEMPLATE_GROUPS = [
  {
    groupLabel: 'Clean',
    templates: [
      {
        id: 'receiptTemplate1',
        label: 'Balanced',
        tags: ['clean', 'no logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate1,
      },
      {
        id: 'receiptTemplate2',
        label: 'Sectioned',
        tags: ['clean', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate2,
      },
      {
        id: 'receiptTemplate17',
        label: 'Spine',
        tags: ['clean', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate17,
      },
      {
        id: 'receiptTemplate14',
        label: 'Info Pair',
        tags: ['clean', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate14,
      },
      {
        id: 'receiptTemplate3',
        label: 'Parallel',
        tags: ['clean', 'no logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate3,
      },
      {
        id: 'receiptTemplate19',
        label: 'Bold Corporate',
        tags: ['clean', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate19,
      },
      {
        id: 'receiptTemplate20',
        label: 'Refined Full',
        tags: ['clean', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate20,
      },
    ],
  },

  {
    groupLabel: 'Accent',
    templates: [
      {
        id: 'receiptTemplate4',
        label: 'Colour Header',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate4,
      },
      {
        id: 'receiptTemplate9',
        label: 'Info Bar',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate9,
      },
      {
        id: 'receiptTemplate15',
        label: 'Stitched Top',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate15,
      },
      {
        id: 'receiptTemplate10',
        label: 'Header Band',
        tags: ['accent', 'has logo', 'signature'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate10,
      },
      {
        id: 'receiptTemplate7',
        label: 'Full Details',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate7,
      },
      {
        id: 'receiptTemplate11',
        label: 'Amount First',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate11,
      },
      {
        id: 'receiptTemplate8',
        label: 'Summary Panel',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate8,
      },
      {
        id: 'receiptTemplate13',
        label: 'Simple Footer',
        tags: ['accent', 'no logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate13,
      },
      {
        id: 'receiptTemplate16',
        label: 'Stitched Split',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate16,
      },
      {
        id: 'receiptTemplate12',
        label: 'Corner Block',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate12,
      },
      {
        id: 'receiptTemplate6',
        label: 'Diagonal Cut',
        tags: ['accent', 'no logo', 'has signature'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate6,
      },
    ],
  },

  {
    groupLabel: 'Solid',
    templates: [
      {
        id: 'receiptTemplate5',
        label: 'Full Background',
        tags: ['solid', 'no logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate5,
      },
      {
        id: 'receiptTemplate18',
        label: 'Colour Block',
        tags: ['solid', 'no logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate18,
      },
    ],
  },
]
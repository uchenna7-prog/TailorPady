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
  'accountName'
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
        id: 'receiptTemplate3',
        label: 'Spine',
        tags: ['clean', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate3,
      },

      {
        id: 'receiptTemplate4',
        label: 'Info Pair',
        tags: ['clean', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate4,
      },


      {
        id: 'receiptTemplate5',
        label: 'Parallel',
        tags: ['clean', 'no logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate5,
      },
      {
        id: 'receiptTemplate6',
        label: 'Bold Corporate',
        tags: ['clean', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate6,
      },
      {
        id: 'receiptTemplate7',
        label: 'Refined Full',
        tags: ['clean', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate7,
      },
    ],
  },

  {
    groupLabel: 'Accent',
    templates: [
      {
        id: 'receiptTemplate8',
        label: 'Colour Header',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate8,
      },
      {
        id: 'receiptTemplate9',
        label: 'Info Bar',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate9,
      },
      {
        id: 'receiptTemplate10',
        label: 'Stitched Top',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate10,
      },
      {
        id: 'receiptTemplate11',
        label: 'Header Band',
        tags: ['accent', 'has logo', 'signature'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate11,
      },
      {
        id: 'receiptTemplate12',
        label: 'Full Details',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate12,
      },
      {
        id: 'receiptTemplate13',
        label: 'Amount First',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate13,
      },
      {
        id: 'receiptTemplate14',
        label: 'Summary Panel',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate14,
      },
      {
        id: 'receiptTemplate15',
        label: 'Simple Footer',
        tags: ['accent', 'no logo', 'notes'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate15,
      },
      {
        id: 'receiptTemplate16',
        label: 'Stitched Split',
        tags: ['accent', 'has logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate16,
      },
      {
        id: 'receiptTemplate17',
        label: 'Corner Block',
        tags: ['accent', 'has logo', 'notes'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate17,
      },
      {
        id: 'receiptTemplate18',
        label: 'Diagonal Cut',
        tags: ['accent', 'no logo', 'has signature'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate18,
      },
    ],
  },

  {
    groupLabel: 'Solid',
    templates: [
      {
        id: 'receiptTemplate19',
        label: 'Full Background',
        tags: ['solid', 'no logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate19,
      },
      {
        id: 'receiptTemplate20',
        label: 'Colour Block',
        tags: ['solid', 'no logo'],
        requires: ALL_REQUIRES,
        Component: ReceiptTemplate20,
      },
    ],
  },
]
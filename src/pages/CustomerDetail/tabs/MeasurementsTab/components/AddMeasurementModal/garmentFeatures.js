import jettedOneBackPocket             from '../../../../../../assets/maleGarmentFeatures/lowerWearFeatures/backPocketType/jettedOnePocket.jpg'
import jettedTwoBackPocket             from '../../../../../../assets/maleGarmentFeatures/lowerWearFeatures/backPocketType/jettedTwoPockets.jpg'
import jettedOneBackPocketWithFlap     from '../../../../../../assets/maleGarmentFeatures/lowerWearFeatures/backPocketType/jettedWithFlapOnePocket.jpg'
import jettedTwoBackPocketWithFlap     from '../../../../../../assets/maleGarmentFeatures/lowerWearFeatures/backPocketType/jettedWithFlapTwoPockets.jpg'
import jettedOneBackPocketWithTab      from '../../../../../../assets/maleGarmentFeatures/lowerWearFeatures/backPocketType/jettedWithTabOnePocket.jpg'
import jettedTwoBackPocketWithTab      from '../../../../../../assets/maleGarmentFeatures/lowerWearFeatures/backPocketType/jettedWithTabTwoPockets.jpg'
import jettedOneBackPocketWithZip      from '../../../../../../assets/maleGarmentFeatures/lowerWearFeatures/backPocketType/jettedWithZipOnePocket.jpg'
import jettedTwoBackPocketWithZip      from '../../../../../../assets/maleGarmentFeatures/lowerWearFeatures/backPocketType/jettedWithZipTwoPockets.jpg'
import weltOneBackPocket               from '../../../../../../assets/maleGarmentFeatures/lowerWearFeatures/backPocketType/weltOnePocket.jpg'
import weltTwoBackPocket               from '../../../../../../assets/maleGarmentFeatures/lowerWearFeatures/backPocketType/weltTwoPockets.jpg'
import weltOneBackPocketWithButton     from '../../../../../../assets/maleGarmentFeatures/lowerWearFeatures/backPocketType/weltWithButtonOnePocket.jpg'
import weltTwoBackPocketWithButton     from '../../../../../../assets/maleGarmentFeatures/lowerWearFeatures/backPocketType/weltWithButtonTwoPockets.jpg'
import weltOneBackPocketWithTopStitch  from '../../../../../../assets/maleGarmentFeatures/lowerWearFeatures/backPocketType/weltWithTopStitchOnePocket.jpg'
import weltTwoBackPocketWithTopStitch  from '../../../../../../assets/maleGarmentFeatures/lowerWearFeatures/backPocketType/weltWithTopStitchTwoPockets.jpg'

import classicOneFrontPocket           from '../../../../../../assets/maleGarmentFeatures/upperWearFeatures/frontPocketType/classicOneFrontPockets.jpg'
import classicTwoFrontPocket           from '../../../../../../assets/maleGarmentFeatures/upperWearFeatures/frontPocketType/classicTwoFrontPocket.jpg'
import roundOneFrontPocket             from '../../../../../../assets/maleGarmentFeatures/upperWearFeatures/frontPocketType/roundOneFrontPocket.jpg'
import roundTwoFrontPockets            from '../../../../../../assets/maleGarmentFeatures/upperWearFeatures/frontPocketType/roundTwoFrontPockets.jpg'
import squareOneFrontPocket            from '../../../../../../assets/maleGarmentFeatures/upperWearFeatures/frontPocketType/squareOneFrontPocket.jpg'
import squareTwoFrontPockets           from '../../../../../../assets/maleGarmentFeatures/upperWearFeatures/frontPocketType/squareTwoFrontPockets.jpg'


export const GARMENT_CATEGORIES = [
  { id: 'upper_body', label: 'Upper Body' },
  { id: 'lower_body', label: 'Lower Body' },
  { id: 'full_body',  label: 'Full Body'  },
]


export const FULL_WEAR_TYPES = [
  { id: 'gown',     label: 'Gown'     },
  { id: 'dress',    label: 'Dress'    },
  { id: 'jumpsuit', label: 'Jumpsuit' },
  { id: 'romper',   label: 'Romper'   },
  { id: 'agbada',   label: 'Agbada'   },
  { id: 'kaftan',   label: 'Kaftan'   },
  { id: 'senator',  label: 'Senator'  },
  { id: 'bubu',     label: 'Bubu'     },
]


const POCKET_IMGS = {
  jettedOneBackPocket,
  jettedTwoBackPocket,
  jettedOneBackPocketWithFlap,
  jettedTwoBackPocketWithFlap,
  jettedOneBackPocketWithTab,
  jettedTwoBackPocketWithTab,
  jettedOneBackPocketWithZip,
  jettedTwoBackPocketWithZip,
  weltOneBackPocket,
  weltTwoBackPocket,
  weltOneBackPocketWithButton,
  weltTwoBackPocketWithButton,
  weltOneBackPocketWithTopStitch,
  weltTwoBackPocketWithTopStitch,
  classicOneFrontPocket,
  classicTwoFrontPocket,
  roundOneFrontPocket,
  roundTwoFrontPockets,
  squareOneFrontPocket,
  squareTwoFrontPockets,
}


const SHARED_SLOTS = {
  neckline: {
    id:      'neckline',
    label:   'Neckline',
    options: [
      { id: 'round',        label: 'Round Neck',   img: null },
      { id: 'v_neck',       label: 'V-Neck',       img: null },
      { id: 'square',       label: 'Square Neck',  img: null },
      { id: 'sweetheart',   label: 'Sweetheart',   img: null },
      { id: 'boat',         label: 'Boat Neck',    img: null },
      { id: 'halter',       label: 'Halter',       img: null },
      { id: 'off_shoulder', label: 'Off-Shoulder', img: null },
      { id: 'turtleneck',   label: 'Turtleneck',   img: null },
    ],
  },
  sleeve: {
    id:      'sleeve',
    label:   'Sleeve',
    options: [
      { id: 'sleeveless', label: 'Sleeveless',   img: null },
      { id: 'short',      label: 'Short Sleeve', img: null },
      { id: 'long',       label: 'Long Sleeve',  img: null },
      { id: 'puff',       label: 'Puff Sleeve',  img: null },
      { id: 'bell',       label: 'Bell Sleeve',  img: null },
      { id: 'cap',        label: 'Cap Sleeve',   img: null },
      { id: 'raglan',     label: 'Raglan',       img: null },
    ],
  },
  fit: {
    id:      'fit',
    label:   'Fit',
    options: [
      { id: 'fitted',    label: 'Fitted',    img: null },
      { id: 'regular',   label: 'Regular',   img: null },
      { id: 'loose',     label: 'Loose',     img: null },
      { id: 'oversized', label: 'Oversized', img: null },
    ],
  },
}


const POCKET_SLOT_MALE_BACK = {
  id:       'back_pocket',
  label:    'Back Pocket Style',
  type:     'grouped',
  subSlots: [
    {
      id:      'back_pocket_one',
      label:   '1 Pocket',
      options: [
        { id: 'jetted',         label: 'Jetted',               img: POCKET_IMGS.jettedOneBackPocket            },
        { id: 'jetted_flap',    label: 'Jetted with Flap',     img: POCKET_IMGS.jettedOneBackPocketWithFlap    },
        { id: 'jetted_tab',     label: 'Jetted with Tab',      img: POCKET_IMGS.jettedOneBackPocketWithTab     },
        { id: 'jetted_zip',     label: 'Jetted with Zip',      img: POCKET_IMGS.jettedOneBackPocketWithZip     },
        { id: 'welt',           label: 'Welt',                 img: POCKET_IMGS.weltOneBackPocket              },
        { id: 'welt_button',    label: 'Welt with Button',     img: POCKET_IMGS.weltOneBackPocketWithButton    },
        { id: 'welt_topstitch', label: 'Welt with Top Stitch', img: POCKET_IMGS.weltOneBackPocketWithTopStitch },
      ],
    },
    {
      id:      'back_pocket_two',
      label:   '2 Pockets',
      options: [
        { id: 'jetted',         label: 'Jetted',               img: POCKET_IMGS.jettedTwoBackPocket            },
        { id: 'jetted_flap',    label: 'Jetted with Flap',     img: POCKET_IMGS.jettedTwoBackPocketWithFlap    },
        { id: 'jetted_tab',     label: 'Jetted with Tab',      img: POCKET_IMGS.jettedTwoBackPocketWithTab     },
        { id: 'jetted_zip',     label: 'Jetted with Zip',      img: POCKET_IMGS.jettedTwoBackPocketWithZip     },
        { id: 'welt',           label: 'Welt',                 img: POCKET_IMGS.weltTwoBackPocket              },
        { id: 'welt_button',    label: 'Welt with Button',     img: POCKET_IMGS.weltTwoBackPocketWithButton    },
        { id: 'welt_topstitch', label: 'Welt with Top Stitch', img: POCKET_IMGS.weltTwoBackPocketWithTopStitch },
      ],
    },
  ],
}

const POCKET_SLOT_MALE_FRONT = {
  id:       'front_pocket',
  label:    'Front Pocket Style',
  type:     'grouped',
  subSlots: [
    {
      id:      'front_pocket_one',
      label:   '1 Pocket',
      options: [
        { id: 'classic', label: 'Classic', img: POCKET_IMGS.classicOneFrontPocket },
        { id: 'round',   label: 'Round',   img: POCKET_IMGS.roundOneFrontPocket   },
        { id: 'square',  label: 'Square',  img: POCKET_IMGS.squareOneFrontPocket  },
      ],
    },
    {
      id:      'front_pocket_two',
      label:   '2 Pockets',
      options: [
        { id: 'classic', label: 'Classic', img: POCKET_IMGS.classicTwoFrontPocket },
        { id: 'round',   label: 'Round',   img: POCKET_IMGS.roundTwoFrontPockets  },
        { id: 'square',  label: 'Square',  img: POCKET_IMGS.squareTwoFrontPockets },
      ],
    },
  ],
}

const POCKET_SLOT_FEMALE = {
  id:      'pocket_style',
  label:   'Pocket Style',
  options: [
    { id: 'none',        label: 'None',             img: null },
    { id: 'side_seam',   label: 'Side Seam',        img: null },
    { id: 'patch',       label: 'Patch Pocket',     img: null },
    { id: 'welt',        label: 'Welt',             img: POCKET_IMGS.weltOneBackPocket           },
    { id: 'welt_button', label: 'Welt with Button', img: POCKET_IMGS.weltOneBackPocketWithButton },
  ],
}


function buildUpperWearSlots(gender) {
  const base = [
    SHARED_SLOTS.neckline,
    SHARED_SLOTS.sleeve,
    {
      id:      'length',
      label:   'Length',
      options: [
        { id: 'crop',  label: 'Crop',  img: null },
        { id: 'waist', label: 'Waist', img: null },
        { id: 'hip',   label: 'Hip',   img: null },
        { id: 'tunic', label: 'Tunic', img: null },
      ],
    },
    SHARED_SLOTS.fit,
  ]

  if (gender === 'Male') return [...base, POCKET_SLOT_MALE_FRONT]

  return base
}


function buildLowerWearSlots(gender) {
  const pocketSlot = gender === 'Female' ? POCKET_SLOT_FEMALE : POCKET_SLOT_MALE_BACK

  return [
    {
      id:      'waist_style',
      label:   'Waist Style',
      options: [
        { id: 'high',       label: 'High Waist',  img: null },
        { id: 'mid',        label: 'Mid Waist',   img: null },
        { id: 'low',        label: 'Low Waist',   img: null },
        { id: 'elastic',    label: 'Elastic',     img: null },
        { id: 'drawstring', label: 'Drawstring',  img: null },
      ],
    },
    {
      id:      'leg_style',
      label:   'Leg Style',
      options: [
        { id: 'straight', label: 'Straight', img: null },
        { id: 'flared',   label: 'Flared',   img: null },
        { id: 'tapered',  label: 'Tapered',  img: null },
        { id: 'wide_leg', label: 'Wide Leg', img: null },
        { id: 'skinny',   label: 'Skinny',   img: null },
        { id: 'bootcut',  label: 'Bootcut',  img: null },
      ],
    },
    {
      id:      'length',
      label:   'Length',
      options: gender === 'Female'
        ? [
            { id: 'mini',        label: 'Mini',        img: null },
            { id: 'knee',        label: 'Knee Length', img: null },
            { id: 'midi',        label: 'Midi',        img: null },
            { id: 'ankle',       label: 'Ankle',       img: null },
            { id: 'full_length', label: 'Full Length', img: null },
          ]
        : [
            { id: 'shorts',    label: 'Shorts',        img: null },
            { id: 'knee',      label: 'Knee Length',   img: null },
            { id: 'three_qtr', label: 'Three-Quarter', img: null },
            { id: 'ankle',     label: 'Ankle',         img: null },
            { id: 'full',      label: 'Full Length',   img: null },
          ],
    },
    pocketSlot,
    SHARED_SLOTS.fit,
  ]
}


const FULL_WEAR_SLOTS = {
  gown: [
    SHARED_SLOTS.neckline,
    SHARED_SLOTS.sleeve,
    {
      id:      'length',
      label:   'Length',
      options: [
        { id: 'mini',  label: 'Mini',         img: null },
        { id: 'knee',  label: 'Knee Length',  img: null },
        { id: 'midi',  label: 'Midi',         img: null },
        { id: 'maxi',  label: 'Maxi',         img: null },
        { id: 'floor', label: 'Floor Length', img: null },
        { id: 'train', label: 'With Train',   img: null },
      ],
    },
    {
      id:      'back_design',
      label:   'Back Design',
      options: [
        { id: 'closed',  label: 'Closed Back', img: null },
        { id: 'open',    label: 'Open Back',   img: null },
        { id: 'keyhole', label: 'Keyhole',     img: null },
        { id: 'lace_up', label: 'Lace-Up',     img: null },
        { id: 'zipper',  label: 'Zipper',      img: null },
      ],
    },
    {
      id:      'silhouette',
      label:   'Silhouette',
      options: [
        { id: 'fitted',       label: 'Fitted',       img: null },
        { id: 'a_line',       label: 'A-Line',       img: null },
        { id: 'ballgown',     label: 'Ballgown',     img: null },
        { id: 'mermaid',      label: 'Mermaid',      img: null },
        { id: 'shift',        label: 'Shift',        img: null },
        { id: 'empire_waist', label: 'Empire Waist', img: null },
      ],
    },
  ],

  dress: [
    SHARED_SLOTS.neckline,
    SHARED_SLOTS.sleeve,
    {
      id:      'length',
      label:   'Length',
      options: [
        { id: 'mini', label: 'Mini',        img: null },
        { id: 'knee', label: 'Knee Length', img: null },
        { id: 'midi', label: 'Midi',        img: null },
        { id: 'maxi', label: 'Maxi',        img: null },
      ],
    },
    SHARED_SLOTS.fit,
  ],

  jumpsuit: [
    SHARED_SLOTS.neckline,
    SHARED_SLOTS.sleeve,
    {
      id:      'leg_style',
      label:   'Leg Style',
      options: [
        { id: 'straight', label: 'Straight', img: null },
        { id: 'wide_leg', label: 'Wide Leg', img: null },
        { id: 'tapered',  label: 'Tapered',  img: null },
        { id: 'flared',   label: 'Flared',   img: null },
      ],
    },
    SHARED_SLOTS.fit,
  ],

  romper: [
    SHARED_SLOTS.neckline,
    SHARED_SLOTS.sleeve,
    SHARED_SLOTS.fit,
  ],

  agbada: [
    {
      id:      'sleeve_width',
      label:   'Sleeve Width',
      options: [
        { id: 'standard', label: 'Standard',   img: null },
        { id: 'wide',     label: 'Wide',       img: null },
        { id: 'extra',    label: 'Extra Wide', img: null },
      ],
    },
    {
      id:      'embroidery',
      label:   'Embroidery',
      options: [
        { id: 'none',       label: 'None',         img: null },
        { id: 'collar',     label: 'Collar Only',  img: null },
        { id: 'full_front', label: 'Full Front',   img: null },
        { id: 'cuffs',      label: 'Sleeve Cuffs', img: null },
        { id: 'all_over',   label: 'All Over',     img: null },
      ],
    },
    {
      id:      'inner_lining',
      label:   'Inner Lining',
      options: [
        { id: 'none',  label: 'None',  img: null },
        { id: 'light', label: 'Light', img: null },
        { id: 'full',  label: 'Full',  img: null },
      ],
    },
  ],

  kaftan: [
    {
      id:      'neckline',
      label:   'Neckline',
      options: [
        { id: 'round',    label: 'Round Neck',      img: null },
        { id: 'v_neck',   label: 'V-Neck',          img: null },
        { id: 'mandarin', label: 'Mandarin Collar', img: null },
        { id: 'open',     label: 'Open Collar',     img: null },
      ],
    },
    SHARED_SLOTS.sleeve,
    {
      id:      'embroidery',
      label:   'Embroidery',
      options: [
        { id: 'none',       label: 'None',        img: null },
        { id: 'collar',     label: 'Collar Only', img: null },
        { id: 'full_front', label: 'Full Front',  img: null },
        { id: 'all_over',   label: 'All Over',    img: null },
      ],
    },
  ],

  senator: [
    {
      id:      'neckline',
      label:   'Neckline',
      options: [
        { id: 'round',    label: 'Round Neck',      img: null },
        { id: 'mandarin', label: 'Mandarin Collar', img: null },
        { id: 'v_neck',   label: 'V-Neck',          img: null },
      ],
    },
    SHARED_SLOTS.sleeve,
    {
      id:      'embroidery',
      label:   'Embroidery',
      options: [
        { id: 'none',   label: 'None',         img: null },
        { id: 'collar', label: 'Collar Only',  img: null },
        { id: 'chest',  label: 'Chest Pocket', img: null },
      ],
    },
  ],

  bubu: [
    {
      id:      'neckline',
      label:   'Neckline',
      options: [
        { id: 'round',  label: 'Round Neck', img: null },
        { id: 'v_neck', label: 'V-Neck',     img: null },
        { id: 'scoop',  label: 'Scoop Neck', img: null },
      ],
    },
    {
      id:      'embroidery',
      label:   'Embroidery',
      options: [
        { id: 'none',       label: 'None',        img: null },
        { id: 'collar',     label: 'Collar Only', img: null },
        { id: 'full_front', label: 'Full Front',  img: null },
        { id: 'all_over',   label: 'All Over',    img: null },
      ],
    },
    SHARED_SLOTS.fit,
  ],
}


export function getSlotsForCard(category, fullWearType, gender) {
  if (!category) return []

  if (category === 'upper_body') return buildUpperWearSlots(gender)

  if (category === 'lower_body') return buildLowerWearSlots(gender)

  if (category === 'full_body') {
    if (!fullWearType) return []
    return FULL_WEAR_SLOTS[fullWearType] || []
  }

  return []
}
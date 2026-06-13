import {
  TROUSER_SLOTS,
  MALE_COLLAR_SLOT,
  MALE_CUFF_SLOT,
  MALE_FRONT_NECK_SLOT,
  MALE_SLEEVE_TYPE_SLOT,
  MALE_SLEEVE_SHAPE_SLOT,
  MALE_FIT_SLOT,
  MALE_BACK_DESIGN_SLOT,
  MALE_BUTTON_STYLE_SLOT,
  POCKET_SLOT_MALE_FRONT,
} from './datas/maleGarmentFeaturesDatas'

import {
  FEMALE_NECKLINE_SLOT,
  FEMALE_SKIRT_BASE_SLOTS,
} from './datas/femaleGarmentFeaturesDatas'

export const GARMENT_CATEGORIES = [
  { id: 'upper_body', label: 'Upper Body' },
  { id: 'lower_body', label: 'Lower Body' },
  { id: 'full_body', label: 'Full Body' },
]

export const FULL_WEAR_TYPES = [
  { id: 'gown', label: 'Gown' },
  { id: 'dress', label: 'Dress' },
  { id: 'jumpsuit', label: 'Jumpsuit' },
  { id: 'romper', label: 'Romper' },
  { id: 'agbada', label: 'Agbada' },
  { id: 'kaftan', label: 'Kaftan' },
  { id: 'senator', label: 'Senator' },
  { id: 'bubu', label: 'Bubu' },
]

export const FEMALE_LOWER_BODY_TYPES = [
  { id: 'skirt', label: 'Skirt' },
  { id: 'trousers', label: 'Trousers' },
]

const SHARED_SLOTS = {
  sleeve: {
    id: 'sleeve',
    label: 'Sleeve',
    options: [
      { id: 'sleeveless', label: 'Sleeveless', img: null },
      { id: 'short', label: 'Short Sleeve', img: null },
      { id: 'long', label: 'Long Sleeve', img: null },
      { id: 'puff', label: 'Puff Sleeve', img: null },
      { id: 'bell', label: 'Bell Sleeve', img: null },
      { id: 'cap', label: 'Cap Sleeve', img: null },
      { id: 'raglan', label: 'Raglan', img: null },
    ],
  },
  fit: {
    id: 'fit',
    label: 'Fit',
    options: [
      { id: 'fitted', label: 'Fitted', img: null },
      { id: 'regular', label: 'Regular', img: null },
      { id: 'loose', label: 'Loose', img: null },
      { id: 'oversized', label: 'Oversized', img: null },
    ],
  },
  neckline: {
    id: 'neckline',
    label: 'Neckline',
    options: [
      { id: 'round', label: 'Round Neck', img: null },
      { id: 'v_neck', label: 'V-Neck', img: null },
      { id: 'square', label: 'Square Neck', img: null },
      { id: 'sweetheart', label: 'Sweetheart', img: null },
      { id: 'boat', label: 'Boat Neck', img: null },
      { id: 'halter', label: 'Halter', img: null },
      { id: 'off_shoulder', label: 'Off-Shoulder', img: null },
      { id: 'turtleneck', label: 'Turtleneck', img: null },
    ],
  },
}

const UPPER_WEAR_LENGTH_SLOT = {
  id: 'length',
  label: 'Length',
  options: [
    { id: 'crop', label: 'Crop', img: null },
    { id: 'waist', label: 'Waist', img: null },
    { id: 'hip', label: 'Hip', img: null },
    { id: 'tunic', label: 'Tunic', img: null },
  ],
}

const FULL_WEAR_SLOTS = {
  gown: [
    SHARED_SLOTS.neckline,
    SHARED_SLOTS.sleeve,
    {
      id: 'length',
      label: 'Length',
      options: [
        { id: 'mini', label: 'Mini', img: null },
        { id: 'knee', label: 'Knee Length', img: null },
        { id: 'midi', label: 'Midi', img: null },
        { id: 'maxi', label: 'Maxi', img: null },
        { id: 'floor', label: 'Floor Length', img: null },
        { id: 'train', label: 'With Train', img: null },
      ],
    },
    {
      id: 'back_design',
      label: 'Back Design',
      options: [
        { id: 'closed', label: 'Closed Back', img: null },
        { id: 'open', label: 'Open Back', img: null },
        { id: 'keyhole', label: 'Keyhole', img: null },
        { id: 'lace_up', label: 'Lace-Up', img: null },
        { id: 'zipper', label: 'Zipper', img: null },
      ],
    },
    {
      id: 'silhouette',
      label: 'Silhouette',
      options: [
        { id: 'fitted', label: 'Fitted', img: null },
        { id: 'a_line', label: 'A-Line', img: null },
        { id: 'ballgown', label: 'Ballgown', img: null },
        { id: 'mermaid', label: 'Mermaid', img: null },
        { id: 'shift', label: 'Shift', img: null },
        { id: 'empire_waist', label: 'Empire Waist', img: null },
      ],
    },
  ],

  dress: [
    SHARED_SLOTS.neckline,
    SHARED_SLOTS.sleeve,
    {
      id: 'length',
      label: 'Length',
      options: [
        { id: 'mini', label: 'Mini', img: null },
        { id: 'knee', label: 'Knee Length', img: null },
        { id: 'midi', label: 'Midi', img: null },
        { id: 'maxi', label: 'Maxi', img: null },
      ],
    },
    SHARED_SLOTS.fit,
  ],

  jumpsuit: [
    SHARED_SLOTS.neckline,
    SHARED_SLOTS.sleeve,
    {
      id: 'leg_style',
      label: 'Leg Style',
      options: [
        { id: 'straight', label: 'Straight', img: null },
        { id: 'wide_leg', label: 'Wide Leg', img: null },
        { id: 'tapered', label: 'Tapered', img: null },
        { id: 'flared', label: 'Flared', img: null },
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
      id: 'sleeve_width',
      label: 'Sleeve Width',
      options: [
        { id: 'standard', label: 'Standard', img: null },
        { id: 'wide', label: 'Wide', img: null },
        { id: 'extra', label: 'Extra Wide', img: null },
      ],
    },
    {
      id: 'embroidery',
      label: 'Embroidery',
      options: [
        { id: 'none', label: 'None', img: null },
        { id: 'collar', label: 'Collar Only', img: null },
        { id: 'full_front', label: 'Full Front', img: null },
        { id: 'cuffs', label: 'Sleeve Cuffs', img: null },
        { id: 'all_over', label: 'All Over', img: null },
      ],
    },
    {
      id: 'inner_lining',
      label: 'Inner Lining',
      options: [
        { id: 'none', label: 'None', img: null },
        { id: 'light', label: 'Light', img: null },
        { id: 'full', label: 'Full', img: null },
      ],
    },
  ],

  kaftan: [
    {
      id: 'neckline',
      label: 'Neckline',
      options: [
        { id: 'round', label: 'Round Neck', img: null },
        { id: 'v_neck', label: 'V-Neck', img: null },
        { id: 'mandarin', label: 'Mandarin Collar', img: null },
        { id: 'open', label: 'Open Collar', img: null },
      ],
    },
    SHARED_SLOTS.sleeve,
    {
      id: 'embroidery',
      label: 'Embroidery',
      options: [
        { id: 'none', label: 'None', img: null },
        { id: 'collar', label: 'Collar Only', img: null },
        { id: 'full_front', label: 'Full Front', img: null },
        { id: 'all_over', label: 'All Over', img: null },
      ],
    },
  ],

  senator: [
    {
      id: 'neckline',
      label: 'Neckline',
      options: [
        { id: 'round', label: 'Round Neck', img: null },
        { id: 'mandarin', label: 'Mandarin Collar', img: null },
        { id: 'v_neck', label: 'V-Neck', img: null },
      ],
    },
    SHARED_SLOTS.sleeve,
    {
      id: 'embroidery',
      label: 'Embroidery',
      options: [
        { id: 'none', label: 'None', img: null },
        { id: 'collar', label: 'Collar Only', img: null },
        { id: 'chest', label: 'Chest Pocket', img: null },
      ],
    },
  ],

  bubu: [
    {
      id: 'neckline',
      label: 'Neckline',
      options: [
        { id: 'round', label: 'Round Neck', img: null },
        { id: 'v_neck', label: 'V-Neck', img: null },
        { id: 'scoop', label: 'Scoop Neck', img: null },
      ],
    },
    {
      id: 'embroidery',
      label: 'Embroidery',
      options: [
        { id: 'none', label: 'None', img: null },
        { id: 'collar', label: 'Collar Only', img: null },
        { id: 'full_front', label: 'Full Front', img: null },
        { id: 'all_over', label: 'All Over', img: null },
      ],
    },
    SHARED_SLOTS.fit,
  ],
}

function buildUpperWearSlots(gender) {
  if (gender === 'Female') {
    return [
      FEMALE_NECKLINE_SLOT,
      SHARED_SLOTS.sleeve,
      UPPER_WEAR_LENGTH_SLOT,
      SHARED_SLOTS.fit,
    ]
  }

  return [
    MALE_COLLAR_SLOT,
    MALE_FRONT_NECK_SLOT,
    MALE_SLEEVE_TYPE_SLOT,
    MALE_SLEEVE_SHAPE_SLOT,
    MALE_CUFF_SLOT,
    UPPER_WEAR_LENGTH_SLOT,
    MALE_FIT_SLOT,
    POCKET_SLOT_MALE_FRONT,
    MALE_BACK_DESIGN_SLOT,
    MALE_BUTTON_STYLE_SLOT,
  ]
}

function buildLowerWearSlots(gender, lowerBodyType) {
  if (gender === 'Female') {
    if (lowerBodyType === 'trousers') return TROUSER_SLOTS
    if (lowerBodyType === 'skirt') return [...FEMALE_SKIRT_BASE_SLOTS, SHARED_SLOTS.fit]
    return []
  }

  return TROUSER_SLOTS
}

function getSlotsForCard(category, fullWearType, gender, lowerBodyType) {
  if (!category) return []

  if (category === 'upper_body') return buildUpperWearSlots(gender)

  if (category === 'lower_body') return buildLowerWearSlots(gender, lowerBodyType)

  if (category === 'full_body') {
    if (!fullWearType) return []
    return FULL_WEAR_SLOTS[fullWearType] || []
  }

  return []
}

export function useGarmentFeatures() {
  return {
    GARMENT_CATEGORIES,
    FULL_WEAR_TYPES,
    FEMALE_LOWER_BODY_TYPES,
    getSlotsForCard,
  }
}
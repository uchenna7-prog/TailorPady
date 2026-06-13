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
  FEMALE_COLLAR_SLOT,
  FEMALE_SLEEVE_TYPE_SLOT,
  FEMALE_SLEEVE_SHAPE_SLOT,
  FEMALE_CUFF_SLOT,
  FEMALE_BUTTON_STYLE_SLOT,
  FEMALE_BACK_DESIGN_SLOT,
  FEMALE_BACK_NECK_SLOT,
  FEMALE_SKIRT_BASE_SLOTS,
} from './datas/femaleGarmentFeaturesDatas'

export const GARMENT_CATEGORIES = [
  { id: 'upper_body', label: 'Upper Body' },
  { id: 'lower_body', label: 'Lower Body' },
  { id: 'full_body', label: 'Full Body' },
]

export const FULL_WEAR_TYPES = []

export const FEMALE_LOWER_BODY_TYPES = [
  { id: 'skirt', label: 'Skirt' },
  { id: 'trousers', label: 'Trousers' },
]

function buildUpperWearSlots(gender) {
  if (gender === 'Female') {
    return [
      FEMALE_NECKLINE_SLOT,
      FEMALE_COLLAR_SLOT,
      FEMALE_BUTTON_STYLE_SLOT,
      FEMALE_SLEEVE_TYPE_SLOT,
      FEMALE_SLEEVE_SHAPE_SLOT,
      FEMALE_CUFF_SLOT,
      FEMALE_BACK_NECK_SLOT,
      FEMALE_BACK_DESIGN_SLOT,
    ]
  }

  return [
    MALE_FIT_SLOT,
    MALE_COLLAR_SLOT,
    MALE_FRONT_NECK_SLOT,
    MALE_BUTTON_STYLE_SLOT,
    MALE_SLEEVE_TYPE_SLOT,
    MALE_SLEEVE_SHAPE_SLOT,
    MALE_CUFF_SLOT,
    POCKET_SLOT_MALE_FRONT,
    MALE_BACK_DESIGN_SLOT,
  ]
}

function buildLowerWearSlots(gender, lowerBodyType) {
  if (gender === 'Female') {
    if (lowerBodyType === 'trousers') return TROUSER_SLOTS
    if (lowerBodyType === 'skirt') return FEMALE_SKIRT_BASE_SLOTS
    return []
  }

  return TROUSER_SLOTS
}

function getSlotsForCard(category, fullWearType, gender, lowerBodyType) {
  if (!category) return []

  if (category === 'upper_body') return buildUpperWearSlots(gender)

  if (category === 'lower_body') return buildLowerWearSlots(gender, lowerBodyType)

  if (category === 'full_body') return []

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
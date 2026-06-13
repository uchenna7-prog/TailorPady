import femAsymmetricBottom from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/bottomType/asymmetricBottom.jpg'
import femRuffledBottom from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/bottomType/ruffledBottom.jpg'
import femSlitBottom from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/bottomType/slitBottom.jpg'
import femStraightBottom from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/bottomType/straightBottom.jpg'

import femFullLining from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/liningType/fullLining.jpg'
import femHalfLining from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/liningType/halfLining.jpg'
import femNoLining from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/liningType/noLining.jpg'

import femKneeLengthSkirt from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/skirtLength/kneeLengthSkirt.jpg'
import femMaxiSkirt from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/skirtLength/maxiSkirt.jpg'
import femMidiSkirt from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/skirtLength/midiSkirt.jpg'
import femMiniSkirt from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/skirtLength/miniSkirt.jpg'

import femALineShape from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/skirtShape/a-lineShape.jpg'
import femFlaredShape from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/skirtShape/flaredShape.jpg'
import femLayeredShape from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/skirtShape/layeredShape.jpg'
import femPencilShape from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/skirtShape/pencilShape.jpg'
import femPleatedShape from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/skirtShape/pleatedShape.jpg'
import femWrapShape from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/skirtShape/wrapShape.jpg'


import femDrawStringWaist from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/waistType/drawStringWaist.jpg'
import femElasticatedWaist from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/waistType/elasticatedWaist.jpg'
import femHighWaist from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/waistType/highWaist.jpg'
import femLowWaist from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/waistType/lowWaist.jpg'
import femMidWaist from '../../../assets/femaleGarmentFeatures/lowerWearFeatures/waistType/midWaist.jpg'

import femUNeck from '../../../assets/femaleGarmentFeatures/upperWearFeatures/frontNeckType/U-Neck.jpg'
import femVNeck from '../../../assets/femaleGarmentFeatures/upperWearFeatures/frontNeckType/V-Neck.jpg'
import femBasketNeck from '../../../assets/femaleGarmentFeatures/upperWearFeatures/frontNeckType/basketNeck.jpg'
import femBoatNeck from '../../../assets/femaleGarmentFeatures/upperWearFeatures/frontNeckType/boatNeck.jpg'
import femCollarNeck from '../../../assets/femaleGarmentFeatures/upperWearFeatures/frontNeckType/collarNeck.jpg'
import femDeepUNeck from '../../../assets/femaleGarmentFeatures/upperWearFeatures/frontNeckType/deepUNeck.jpg'
import femHalterNeck from '../../../assets/femaleGarmentFeatures/upperWearFeatures/frontNeckType/halterNeck.jpg'
import femRoundNeck from '../../../assets/femaleGarmentFeatures/upperWearFeatures/frontNeckType/roundNeck.jpg'
import femWideSquareNeck from '../../../assets/femaleGarmentFeatures/upperWearFeatures/frontNeckType/wideSquareNeck.jpg'

import weltOneBackPocket from '../../../assets/maleGarmentFeatures/lowerWearFeatures/backPocketType/weltOnePocket.jpg'
import weltOneBackPocketWithButton from '../../../assets/maleGarmentFeatures/lowerWearFeatures/backPocketType/weltWithButtonOnePocket.jpg'

const FEMALE_LOWER_WEAR_IMGS = {
  asymmetricBottom: femAsymmetricBottom,
  ruffledBottom: femRuffledBottom,
  slitBottom: femSlitBottom,
  straightBottom: femStraightBottom,
  fullLining: femFullLining,
  halfLining: femHalfLining,
  noLining: femNoLining,
  kneeLengthSkirt: femKneeLengthSkirt,
  maxiSkirt: femMaxiSkirt,
  midiSkirt: femMidiSkirt,
  miniSkirt: femMiniSkirt,
  aLineShape: femALineShape,
  flaredShape: femFlaredShape,
  layeredShape: femLayeredShape,
  pencilShape: femPencilShape,
  pleatedShape: femPleatedShape,
  wrapShape: femWrapShape,
  drawStringWaist: femDrawStringWaist,
  elasticatedWaist: femElasticatedWaist,
  highWaist: femHighWaist,
  lowWaist: femLowWaist,
  midWaist: femMidWaist,
}

const FEMALE_NECK_IMGS = {
  uNeck: femUNeck,
  vNeck: femVNeck,
  basket: femBasketNeck,
  boat: femBoatNeck,
  collar: femCollarNeck,
  deepU: femDeepUNeck,
  halter: femHalterNeck,
  round: femRoundNeck,
  wideSquare: femWideSquareNeck,
}

const FEMALE_WAIST_STYLE_SLOT = {
  id: 'waist_style',
  label: 'Waist Style',
  options: [
    { id: 'high', label: 'High Waist', img: FEMALE_LOWER_WEAR_IMGS.highWaist },
    { id: 'mid', label: 'Mid Waist', img: FEMALE_LOWER_WEAR_IMGS.midWaist },
    { id: 'low', label: 'Low Waist', img: FEMALE_LOWER_WEAR_IMGS.lowWaist },
    { id: 'elastic', label: 'Elastic', img: FEMALE_LOWER_WEAR_IMGS.elasticatedWaist },
    { id: 'drawstring', label: 'Drawstring', img: FEMALE_LOWER_WEAR_IMGS.drawStringWaist },
  ],
}

const FEMALE_SKIRT_SHAPE_SLOT = {
  id: 'skirt_shape',
  label: 'Skirt Shape',
  options: [
    { id: 'a_line', label: 'A-Line', img: FEMALE_LOWER_WEAR_IMGS.aLineShape },
    { id: 'flared', label: 'Flared', img: FEMALE_LOWER_WEAR_IMGS.flaredShape },
    { id: 'layered', label: 'Layered', img: FEMALE_LOWER_WEAR_IMGS.layeredShape },
    { id: 'pencil', label: 'Pencil', img: FEMALE_LOWER_WEAR_IMGS.pencilShape },
    { id: 'pleated', label: 'Pleated', img: FEMALE_LOWER_WEAR_IMGS.pleatedShape },
    { id: 'wrap', label: 'Wrap', img: FEMALE_LOWER_WEAR_IMGS.wrapShape },
  ],
}

const FEMALE_SKIRT_LENGTH_SLOT = {
  id: 'length',
  label: 'Length',
  options: [
    { id: 'mini', label: 'Mini', img: FEMALE_LOWER_WEAR_IMGS.miniSkirt },
    { id: 'knee', label: 'Knee Length', img: FEMALE_LOWER_WEAR_IMGS.kneeLengthSkirt },
    { id: 'midi', label: 'Midi', img: FEMALE_LOWER_WEAR_IMGS.midiSkirt },
    { id: 'maxi', label: 'Maxi', img: FEMALE_LOWER_WEAR_IMGS.maxiSkirt },
    { id: 'ankle', label: 'Ankle', img: null },
    { id: 'full_length', label: 'Full Length', img: null },
  ],
}

const FEMALE_BOTTOM_STYLE_SLOT = {
  id: 'bottom_style',
  label: 'Bottom Style',
  options: [
    { id: 'straight', label: 'Straight', img: FEMALE_LOWER_WEAR_IMGS.straightBottom },
    { id: 'asymmetric', label: 'Asymmetric', img: FEMALE_LOWER_WEAR_IMGS.asymmetricBottom },
    { id: 'ruffled', label: 'Ruffled', img: FEMALE_LOWER_WEAR_IMGS.ruffledBottom },
    { id: 'slit', label: 'Slit', img: FEMALE_LOWER_WEAR_IMGS.slitBottom },
  ],
}

const FEMALE_LINING_SLOT = {
  id: 'lining_type',
  label: 'Lining',
  options: [
    { id: 'none', label: 'No Lining', img: FEMALE_LOWER_WEAR_IMGS.noLining },
    { id: 'half', label: 'Half Lining', img: FEMALE_LOWER_WEAR_IMGS.halfLining },
    { id: 'full', label: 'Full Lining', img: FEMALE_LOWER_WEAR_IMGS.fullLining },
  ],
}

const POCKET_SLOT_FEMALE = {
  id: 'pocket_style',
  label: 'Pocket Style',
  options: [
    { id: 'none', label: 'None', img: null },
    { id: 'side_seam', label: 'Side Seam', img: null },
    { id: 'patch', label: 'Patch Pocket', img: null },
    { id: 'welt', label: 'Welt', img: weltOneBackPocket },
    { id: 'welt_button', label: 'Welt with Button', img: weltOneBackPocketWithButton },
  ],
}

export const FEMALE_NECKLINE_SLOT = {
  id: 'neckline',
  label: 'Neckline',
  options: [
    { id: 'round', label: 'Round Neck', img: FEMALE_NECK_IMGS.round },
    { id: 'v_neck', label: 'V-Neck', img: FEMALE_NECK_IMGS.vNeck },
    { id: 'u_neck', label: 'U-Neck', img: FEMALE_NECK_IMGS.uNeck },
    { id: 'deep_u', label: 'Deep U-Neck', img: FEMALE_NECK_IMGS.deepU },
    { id: 'boat', label: 'Boat Neck', img: FEMALE_NECK_IMGS.boat },
    { id: 'basket', label: 'Basket Neck', img: FEMALE_NECK_IMGS.basket },
    { id: 'halter', label: 'Halter', img: FEMALE_NECK_IMGS.halter },
    { id: 'collar', label: 'Collar Neck', img: FEMALE_NECK_IMGS.collar },
    { id: 'wide_square', label: 'Wide Square', img: FEMALE_NECK_IMGS.wideSquare },
  ],
}

export const FEMALE_SKIRT_BASE_SLOTS = [
  FEMALE_WAIST_STYLE_SLOT,
  FEMALE_SKIRT_SHAPE_SLOT,
  FEMALE_SKIRT_LENGTH_SLOT,
  FEMALE_BOTTOM_STYLE_SLOT,
  FEMALE_LINING_SLOT,
  POCKET_SLOT_FEMALE,
]
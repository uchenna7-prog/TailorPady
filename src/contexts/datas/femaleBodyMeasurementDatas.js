import neck from '../../assets/femaleBodyMeasurementImages/neck.jpg'
import frontNeckDepth from '../../assets/femaleBodyMeasurementImages/frontNeckDepth.jpg'
import backNeckDepth from '../../assets/femaleBodyMeasurementImages/backNeckDepth.jpg'
import shoulder from '../../assets/femaleBodyMeasurementImages/shoulder.jpg'
import halfShoulder from '../../assets/femaleBodyMeasurementImages/halfShoulder.jpg'
import frontShoulder from '../../assets/femaleBodyMeasurementImages/frontShoulder.jpg'
import backShoulder from '../../assets/femaleBodyMeasurementImages/backShoulder.jpg'
import shoulderToApex from '../../assets/femaleBodyMeasurementImages/shoulderToApex.jpg'
import apexToApex from '../../assets/femaleBodyMeasurementImages/apexToApex.jpg'
import upperChest from '../../assets/femaleBodyMeasurementImages/upperChest.jpg'
import bust from '../../assets/femaleBodyMeasurementImages/bust.jpg'
import chest from '../../assets/femaleBodyMeasurementImages/chest.jpg'
import blouseChest from '../../assets/femaleBodyMeasurementImages/blouseChest.jpg'
import blouseBelowBust from '../../assets/femaleBodyMeasurementImages/blouseBelowBust.jpg'
import armHole from '../../assets/femaleBodyMeasurementImages/armHole.jpg'
import biceps from '../../assets/femaleBodyMeasurementImages/biceps.jpg'
import armLength from '../../assets/femaleBodyMeasurementImages/armLength.jpg'
import fullSleeveLength from '../../assets/femaleBodyMeasurementImages/fullSleeveLength.jpg'
import fullSleeveLengthCircumference from '../../assets/femaleBodyMeasurementImages/fullSleeveLengthCircumference.jpg'
import armLengthHalf from '../../assets/femaleBodyMeasurementImages/armLengthHalf.jpg'
import threeQuarterSleeveLength from '../../assets/femaleBodyMeasurementImages/threeQuarterSleeveLength.jpg'
import threeQuarterSleeveLengthCircumference from '../../assets/femaleBodyMeasurementImages/threeQuarterSleeveLengthCircumference.jpg'
import elbowSleeveLength from '../../assets/femaleBodyMeasurementImages/elbowSleeveLength.jpg'
import elbowSleeveLengthCircumference from '../../assets/femaleBodyMeasurementImages/elbowSleeveLengthCircumference.jpg'
import shortSleeveLength from "../../assets/femaleBodyMeasurementImages/shortSleeveLength.jpg"
import shortSleeveLengthCircumference from "../../assets/femaleBodyMeasurementImages/shortSleeveLengthCircumference.jpg"
import capSleeve from '../../assets/femaleBodyMeasurementImages/capSleeve.jpg'
import capSleeveCircumference from '../../assets/femaleBodyMeasurementImages/capSleeveCircumference.jpg'
import wrist from '../../assets/femaleBodyMeasurementImages/wrist.jpg'
import stomach from '../../assets/femaleBodyMeasurementImages/stomach.jpg'
import waist from '../../assets/femaleBodyMeasurementImages/waist.jpg'
import blouseLength from '../../assets/femaleBodyMeasurementImages/blouseLength.jpg'
import shirtLength from '../../assets/femaleBodyMeasurementImages/shirtLength.jpg'
import shoulderToStomachLength from '../../assets/femaleBodyMeasurementImages/shoulderToStomachLength.jpg'
import shoulderToWaistLength from '../../assets/femaleBodyMeasurementImages/shoulderToWaistLength.jpg'
import hip from '../../assets/femaleBodyMeasurementImages/hip.jpg'
import shoulderToHipLength from '../../assets/femaleBodyMeasurementImages/shoulderToHipLength.jpg'
import crotch from '../../assets/femaleBodyMeasurementImages/crotch.jpg'
import thigh from '../../assets/femaleBodyMeasurementImages/thigh.jpg'
import thighLength from '../../assets/femaleBodyMeasurementImages/thighLength.jpg'
import kneeLength from '../../assets/femaleBodyMeasurementImages/kneeLength.jpg'
import calf from '../../assets/femaleBodyMeasurementImages/calf.jpg'
import calfToAnkle from '../../assets/femaleBodyMeasurementImages/calfToAnkle.jpg'
import ankle from '../../assets/femaleBodyMeasurementImages/ankle.jpg'
import wristToAnkle from '../../assets/femaleBodyMeasurementImages/wristToAnkle.jpg'
import fullHeight from '../../assets/femaleBodyMeasurementImages/fullHeight.jpg'
import kurthiHeight from '../../assets/femaleBodyMeasurementImages/kurthiHeight.jpg'


export const FEMALE_BODY_MEASUREMENT_SECTIONS = {
  'Upper Body': [
    'Neck', 'Front Neck Depth', 'Back Neck Depth',
    'Shoulder', 'Half Shoulder', 'Front Shoulder', 'Back Shoulder',
    'Shoulder To Apex', 'Apex To Apex',
    'Upper Chest', 'Bust', 'Chest', 'Blouse Chest', 'Blouse Below Bust',
    'Arm Hole', 'Biceps', 'Arm Length', 'Full Sleeve Length',
    'Full Sleeve Length Circumference', 'Arm Length Half',
    'Three Quarter Sleeve Length', 'Three Quarter Sleeve Length Circumference',
    'Elbow Sleeve Length', 'Elbow Sleeve Length Circumference',
    'Short Sleeve Length', 'Short Sleeve Length Circumference',
    'Cap Sleeve', 'Cap Sleeve Circumference',
    'Wrist',
  ],
  'Mid Section': [
    'Blouse Length', 'Shirt Length', 'Shoulder To Waist Length',
    'Shoulder To Stomach Length', 'Shoulder To Hip Length',
    'Waist', 'Stomach', 'Hip',
  ],
  'Lower Body': [
    'Crotch',
    'Thigh', 'Thigh Length', 'Knee Length',
    'Calf', 'Calf To Ankle', 'Ankle',
    'Wrist To Ankle', 'Full Height', 'Kurthi Height',
  ],
}

export const FEMALE_BODY_MEASUREMENTS = [
  ...FEMALE_BODY_MEASUREMENT_SECTIONS['Upper Body'],
  ...FEMALE_BODY_MEASUREMENT_SECTIONS['Mid Section'],
  ...FEMALE_BODY_MEASUREMENT_SECTIONS['Lower Body'],
]

export const FEMALE_BODY_MEASUREMENT_IMAGES = {
  'Neck': neck,
  'Front Neck Depth': frontNeckDepth,
  'Back Neck Depth': backNeckDepth,
  'Shoulder': shoulder,
  'Half Shoulder': halfShoulder,
  'Front Shoulder': frontShoulder,
  'Back Shoulder': backShoulder,
  'Shoulder To Apex': shoulderToApex,
  'Apex To Apex': apexToApex,
  'Upper Chest': upperChest,
  'Bust': bust,
  'Chest': chest,
  'Blouse Chest': blouseChest,
  'Blouse Below Bust': blouseBelowBust,
  'Arm Hole': armHole,
  'Biceps': biceps,
  'Arm Length': armLength,
  'Full Sleeve Length': fullSleeveLength,
  'Full Sleeve Length Circumference': fullSleeveLengthCircumference,
  'Arm Length Half': armLengthHalf,
  'Three Quarter Sleeve Length': threeQuarterSleeveLength,
  'Three Quarter Sleeve Length Circumference': threeQuarterSleeveLengthCircumference,
  'Elbow Sleeve Length': elbowSleeveLength,
  'Elbow Sleeve Length Circumference': elbowSleeveLengthCircumference,
  'Short Sleeve Length': shortSleeveLength,
  'Short Sleeve Length Circumference': shortSleeveLengthCircumference,
  'Cap Sleeve': capSleeve,
  'Cap Sleeve Circumference': capSleeveCircumference,
  'Wrist': wrist,
  'Blouse Length': blouseLength,
  'Shirt Length': shirtLength,
  'Shoulder To Waist Length': shoulderToWaistLength,
  'Shoulder To Stomach Length': shoulderToStomachLength,
  'Shoulder To Hip Length': shoulderToHipLength,
  'Waist': waist,
  'Stomach': stomach,
  'Hip': hip,
  'Crotch': crotch,
  'Thigh': thigh,
  'Thigh Length': thighLength,
  'Knee Length': kneeLength,
  'Calf': calf,
  'Calf To Ankle': calfToAnkle,
  'Ankle': ankle,
  'Wrist To Ankle': wristToAnkle,
  'Full Height': fullHeight,
  'Kurthi Height': kurthiHeight,
}

import { createContext, useContext } from 'react'
import { MALE_BODY_MEASUREMENTS, MALE_BODY_MEASUREMENT_IMAGES, MALE_BODY_MEASUREMENT_SECTIONS } from './datas/maleBodyMeasurementDatas'
import { FEMALE_BODY_MEASUREMENTS, FEMALE_BODY_MEASUREMENT_IMAGES, FEMALE_BODY_MEASUREMENT_SECTIONS } from './datas/femaleBodyMeasurementDatas'

export function getBodyMeasurementConfig(sex) {
  if (sex === 'Female') {
    return {
      fields:   FEMALE_BODY_MEASUREMENTS,
      imgMap:   FEMALE_BODY_MEASUREMENT_IMAGES,
      sections: FEMALE_BODY_MEASUREMENT_SECTIONS,
    }
  }
  return {
    fields:   MALE_BODY_MEASUREMENTS,
    imgMap:   MALE_BODY_MEASUREMENT_IMAGES,
    sections: MALE_BODY_MEASUREMENT_SECTIONS,
  }
}

const BodyMeasurementImagesContext = createContext(null)

export function BodyMeasurementImagesProvider({ children }) {
  const value = {
    MALE_BODY_MEASUREMENTS,
    FEMALE_BODY_MEASUREMENTS,
    MALE_BODY_MEASUREMENT_IMAGES,
    FEMALE_BODY_MEASUREMENT_IMAGES,
    MALE_BODY_MEASUREMENT_SECTIONS,
    FEMALE_BODY_MEASUREMENT_SECTIONS,
    getBodyMeasurementConfig,
  }

  return (
    <BodyMeasurementImagesContext.Provider value={value}>
      {children}
    </BodyMeasurementImagesContext.Provider>
  )
}

export function useBodyMeasurementImages() {
  return useContext(BodyMeasurementImagesContext)
}

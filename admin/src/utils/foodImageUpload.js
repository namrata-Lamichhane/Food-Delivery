import axios from 'axios'
import { url } from '../assets/assets.js'

const maxImageBytes = 5 * 1024 * 1024
const allowedImageTypes = new Map([
  ['image/jpeg', new Set(['jpg', 'jpeg'])],
  ['image/png', new Set(['png'])],
  ['image/webp', new Set(['webp'])],
])

export const validateFoodImage = (file) => {
  const extension = file?.name?.split('.').pop()?.toLowerCase()
  const allowedExtensions = allowedImageTypes.get(file?.type)

  if (!allowedExtensions || !allowedExtensions.has(extension)) {
    return 'Only JPEG, PNG, and WebP images are allowed.'
  }
  if (file.size > maxImageBytes) {
    return 'Image size must be 5 MB or less.'
  }
  return ''
}

export const createFoodUploadRequestData = async (fields, file, token) => {
  if (file) {
    const validationError = validateFoodImage(file)
    if (validationError) {
      throw new Error(validationError)
    }
  }

  if (!import.meta.env.PROD) {
    const formData = new FormData()
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value))
    if (file) {
      formData.append('image', file)
    }
    return formData
  }

  if (!file) {
    return fields
  }

  const authorizationHeader = { Authorization: `Bearer ${token}` }
  const { data: signatureResponse } = await axios.post(
    `${url}/api/food/upload-signature`,
    {},
    { headers: authorizationHeader }
  )

  if (!signatureResponse.success || !signatureResponse.data) {
    throw new Error(signatureResponse.message || 'Could not authorize the image upload.')
  }

  const authorization = signatureResponse.data
  const cloudinaryForm = new FormData()
  cloudinaryForm.append('file', file)
  cloudinaryForm.append('api_key', authorization.api_key)
  cloudinaryForm.append('signature', authorization.signature)
  Object.entries(authorization.params).forEach(([key, value]) => {
    cloudinaryForm.append(key, String(value))
  })

  const { data: result } = await axios.post(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(authorization.cloud_name)}/image/upload`,
    cloudinaryForm
  )

  return {
    ...fields,
    imageUpload: {
      authorization,
      result: {
        public_id: result.public_id,
        version: result.version,
        signature: result.signature,
        secure_url: result.secure_url,
      },
    },
  }
}

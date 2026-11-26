import { randomUUID, timingSafeEqual } from 'node:crypto'
import { v2 as cloudinary } from 'cloudinary'

const imageFolder = 'food-delivery/foods'
const allowedImageFormats = new Set(['jpg', 'jpeg', 'png', 'webp'])
const maxImageBytes = 5 * 1024 * 1024
const signatureMaxAgeSeconds = 60 * 60

const getCloudinary = () => {
    const config = {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    }
    const missing = Object.entries(config)
        .filter(([key, value]) => key !== 'secure' && !value)
        .map(([key]) => key)

    if (missing.length > 0) {
        throw new Error(`Missing Cloudinary configuration: ${missing.join(', ')}`)
    }

    cloudinary.config(config)
    return cloudinary
}

const getUploadSignatureParams = (timestamp, publicId) => ({
    asset_folder: imageFolder,
    folder: imageFolder,
    overwrite: false,
    public_id: publicId,
    timestamp,
})

const signaturesMatch = (provided, expected) => {
    if (typeof provided !== 'string' || provided.length !== expected.length) {
        return false
    }

    return timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}

const createUploadError = (message, statusCode = 400) => {
    const error = new Error(message)
    error.statusCode = statusCode
    return error
}

const deleteRejectedUpload = async (publicId, message) => {
    let cleanupWarning
    try {
        await deleteCloudinaryImage(publicId)
    } catch (error) {
        console.error('Cloudinary cleanup failed after upload verification:', error.message)
        cleanupWarning = 'The uploaded image could not be cleaned up. Check backend logs.'
    }

    const error = createUploadError(message)
    if (cleanupWarning) {
        error.cleanupWarning = cleanupWarning
    }
    throw error
}

const getImageDetails = (result) => {
    if (!result?.secure_url || !result.public_id) {
        throw new Error('Cloudinary did not return the required image metadata.')
    }

    return {
        secureUrl: result.secure_url,
        publicId: result.public_id,
    }
}

export const createFoodImageUploadAuthorization = () => {
    const configuredCloudinary = getCloudinary()
    const timestamp = Math.floor(Date.now() / 1000)
    const publicId = randomUUID()
    const params = getUploadSignatureParams(timestamp, publicId)

    return {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        params,
        signature: configuredCloudinary.utils.api_sign_request(
            params,
            process.env.CLOUDINARY_API_SECRET
        ),
    }
}

export const verifyFoodImageUpload = async (upload) => {
    const configuredCloudinary = getCloudinary()
    const authorization = upload?.authorization
    const result = upload?.result
    const params = authorization?.params
    const timestamp = Number(params?.timestamp)
    const now = Math.floor(Date.now() / 1000)
    const publicId = params?.public_id

    if (
        authorization?.cloud_name !== process.env.CLOUDINARY_CLOUD_NAME ||
        authorization?.api_key !== process.env.CLOUDINARY_API_KEY ||
        !Number.isInteger(timestamp) ||
        timestamp > now + 60 ||
        now - timestamp > signatureMaxAgeSeconds ||
        typeof publicId !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(publicId) ||
        params.folder !== imageFolder ||
        params.asset_folder !== imageFolder ||
        params.overwrite !== false
    ) {
        throw createUploadError('Cloudinary upload authorization is invalid or expired.')
    }

    const expectedUploadSignature = configuredCloudinary.utils.api_sign_request(
        getUploadSignatureParams(timestamp, publicId),
        process.env.CLOUDINARY_API_SECRET
    )
    if (!signaturesMatch(authorization.signature, expectedUploadSignature)) {
        throw createUploadError('Cloudinary upload authorization could not be verified.')
    }

    const resultPublicId = result?.public_id
    const expectedPublicIds = new Set([
        publicId,
        `${imageFolder}/${publicId}`,
    ])
    const version = Number(result?.version)
    if (
        typeof resultPublicId !== 'string' ||
        !expectedPublicIds.has(resultPublicId) ||
        !Number.isInteger(version) ||
        version <= 0 ||
        typeof result.signature !== 'string' ||
        !configuredCloudinary.utils.verify_api_response_signature(
            resultPublicId,
            version,
            result.signature
        )
    ) {
        throw createUploadError('Cloudinary upload result could not be verified.')
    }

    let resource
    try {
        resource = await configuredCloudinary.api.resource(resultPublicId, {
            resource_type: 'image',
            type: 'upload',
        })
    } catch (error) {
        console.error('Cloudinary uploaded image verification failed:', error.message)
        await deleteRejectedUpload(
            resultPublicId,
            'Cloudinary could not verify the uploaded image. Please try again.'
        )
    }

    const assetFolderIsValid =
        resource.asset_folder === imageFolder ||
        (!resource.asset_folder && resultPublicId === `${imageFolder}/${publicId}`)
    let secureUrlIsValid = false
    try {
        const secureUrl = new URL(resource.secure_url)
        secureUrlIsValid =
            secureUrl.protocol === 'https:' &&
            secureUrl.hostname === 'res.cloudinary.com' &&
            secureUrl.pathname.startsWith(
                `/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`
            )
    } catch {
        secureUrlIsValid = false
    }

    if (
        resource.public_id !== resultPublicId ||
        resource.resource_type !== 'image' ||
        resource.type !== 'upload' ||
        !assetFolderIsValid ||
        !secureUrlIsValid ||
        resource.secure_url !== result.secure_url
    ) {
        await deleteRejectedUpload(
            resultPublicId,
            'Uploaded image does not match the authorized Cloudinary location.'
        )
    }

    if (
        !allowedImageFormats.has(String(resource.format).toLowerCase()) ||
        !Number.isInteger(resource.bytes) ||
        resource.bytes < 1 ||
        resource.bytes > maxImageBytes
    ) {
        await deleteRejectedUpload(
            resultPublicId,
            'Only JPEG, PNG, and WebP images up to 5 MB are allowed.'
        )
    }

    return getImageDetails(resource)
}

export const assertCloudinaryConfigured = () => {
    getCloudinary()
}

export const uploadImageBuffer = (buffer) =>
    new Promise((resolve, reject) => {
        const uploadStream = getCloudinary().uploader.upload_stream(
            { folder: imageFolder, resource_type: 'image' },
            (error, result) => {
                if (error) {
                    reject(error)
                    return
                }

                try {
                    resolve(getImageDetails(result))
                } catch (metadataError) {
                    reject(metadataError)
                }
            }
        )

        uploadStream.end(buffer)
    })

export const uploadLocalImage = async (filePath, publicId) => {
    const result = await getCloudinary().uploader.upload(filePath, {
        folder: imageFolder,
        public_id: publicId,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
    })

    return getImageDetails(result)
}

export const deleteCloudinaryImage = async (publicId) => {
    if (!publicId) {
        throw new Error('A Cloudinary public ID is required to delete an image.')
    }

    const result = await getCloudinary().uploader.destroy(publicId, {
        invalidate: true,
        resource_type: 'image',
        type: 'upload',
    })

    if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error(`Cloudinary image deletion failed: ${result.result || 'unknown result'}`)
    }
}

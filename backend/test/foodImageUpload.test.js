import assert from 'node:assert/strict'
import { test } from 'node:test'
import { v2 as cloudinary } from 'cloudinary'

process.env.CLOUDINARY_CLOUD_NAME = 'food-image-test'
process.env.CLOUDINARY_API_KEY = 'test-api-key'
process.env.CLOUDINARY_API_SECRET = 'test-api-secret'

const {
    createFoodImageUploadAuthorization,
    verifyFoodImageUpload,
} = await import('../config/cloudinary.js')

test('creates an upload authorization without exposing the API secret', () => {
    const authorization = createFoodImageUploadAuthorization()
    const params = authorization.params

    assert.equal(authorization.cloud_name, process.env.CLOUDINARY_CLOUD_NAME)
    assert.equal(authorization.api_key, process.env.CLOUDINARY_API_KEY)
    assert.equal(Object.prototype.hasOwnProperty.call(authorization, 'api_secret'), false)
    assert.equal(
        authorization.signature,
        cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET)
    )
    assert.equal(params.folder, 'food-delivery/foods')
    assert.equal(params.asset_folder, 'food-delivery/foods')
    assert.equal(params.overwrite, false)
})

test('rejects upload results not matching the signed public ID', async () => {
    const authorization = createFoodImageUploadAuthorization()

    await assert.rejects(
        verifyFoodImageUpload({
            authorization,
            result: {
                public_id: 'food-delivery/foods/not-the-authorized-id',
                version: 1,
                signature: 'invalid',
                secure_url: 'https://res.cloudinary.com/food-image-test/image/upload/v1/test.png',
            },
        }),
        { message: 'Cloudinary upload result could not be verified.' }
    )
})

test('rejects an altered upload authorization before checking Cloudinary', async () => {
    const authorization = createFoodImageUploadAuthorization()
    authorization.params.folder = 'other-folder'

    await assert.rejects(
        verifyFoodImageUpload({
            authorization,
            result: {},
        }),
        { message: 'Cloudinary upload authorization is invalid or expired.' }
    )
})

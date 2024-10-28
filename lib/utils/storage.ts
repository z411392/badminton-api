import { getStorage } from "firebase-admin/storage"
import { createHash } from "crypto"
import { fromBuffer } from "file-type"
import { onDevelopment } from "@/utils/development"

export const mimeFor = async (buffer: Buffer) => {
    const { mime } = (await fromBuffer(buffer))!
    return mime
}

export const extensionFor = async (buffer: Buffer) => {
    const { ext: extension } = (await fromBuffer(buffer))!
    return extension
}

export const filePathFor = async (buffer: Buffer, bufferSize: number = 4096) => {
    const hash = createHash("md5")
    for (let index = 0; index < buffer.length; index += bufferSize)
        hash.update(buffer.subarray(index, index + bufferSize))
    const md5 = hash.digest("hex")
    const extension = await extensionFor(buffer)
    const filePath = `${extension}/${md5}`
    return filePath
}

const prefix = () => {
    if (onDevelopment()) return "badminton/development"
    return "badminton/production"
}

export const existObject = async (filePath: string) => {
    const storage = getStorage()
    const bucket = storage.bucket()
    const file = bucket.file(`${prefix()}/${filePath}`)
    const [exists] = await file.exists()
    return exists
}

export const putObject = async (buffer: Buffer, metadata?: any) => {
    const storage = getStorage()
    const bucket = storage.bucket()
    const filePath = await filePathFor(buffer)
    const file = bucket.file(`${prefix()}/${filePath}`)
    const contentType = await mimeFor(buffer)
    await file.save(buffer, { metadata: { contentType } })
    if (metadata) await file.setMetadata(metadata)
    return filePath
}

export const getObjectURL = async (filePath: string, expiry: number = 3600) => {
    const storage = getStorage()
    const bucket = storage.bucket()
    const file = bucket.file(`${prefix()}/${filePath}`)
    const [URL] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + expiry * 1000,
    })
    return URL
}

export const deleteObjectURL = async (filePath: string) => {
    const storage = getStorage()
    const bucket = storage.bucket()
    const file = bucket.file(`${prefix()}/${filePath}`)
    await file.delete()
}

export const uploadFromString = async (filePath: string, text: string, metadata?: any) => {
    const storage = getStorage()
    const bucket = storage.bucket()
    const file = bucket.file(`${prefix()}/${filePath}`)
    await file.save(text)
    if (metadata) await file.setMetadata(metadata)
    return filePath
}

export const downloadAsString = async (filePath: string) => {
    const storage = getStorage()
    const bucket = storage.bucket()
    const file = bucket.file(`${prefix()}/${filePath}`)
    const [content] = await file.download()
    return content.toString()
}

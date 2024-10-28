import { getStorage } from "firebase-admin/storage"
import { readFile } from "fs/promises"
import { filePathFor, existObject, putObject, getObjectURL, deleteObjectURL } from "@/utils/storage"

describe.skip(`跟 cloud storage 相關的整合測試`, () => {
    test.skip(`要能夠管理 buckets`, async () => {
        const storage = getStorage()
        const bucketName = "test"
        const bucket = storage.bucket(bucketName)
        const [existsBeforeCreation] = await bucket.exists()
        expect(existsBeforeCreation).toBe(false)
        await expect(bucket.create()).resolves.not.toThrow()
        const [existsAfterCreation] = await bucket.exists()
        expect(existsAfterCreation).toBe(true)
        await expect(bucket.delete()).resolves.not.toThrow()
        const [existsAfterDeletion] = await bucket.exists()
        expect(existsAfterDeletion).toBe(false)
    })
    test(`要能夠上傳/刪除檔案`, async () => {
        const storage = getStorage()
        const bucket = storage.bucket()
        const [bucketExists] = await bucket.exists()
        expect(bucketExists).toBe(true)
        const buffer = await readFile("test.jpeg")
        const filePath = await filePathFor(buffer)
        const existsBeforeCreation = await existObject(filePath)
        expect(existsBeforeCreation).toBe(false)
        await putObject(buffer)
        const existsAfterCreation = await existObject(filePath)
        expect(existsAfterCreation).toBe(true)
        const URL = await getObjectURL(filePath)
        expect(URL).toBeTruthy()
        await deleteObjectURL(filePath)
        const existsAfterDeletion = await existObject(filePath)
        expect(existsAfterDeletion).toBe(false)
    })
})

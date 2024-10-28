import { searchClient } from "@algolia/client-search"

describe(`跟 algolia 相關的整合測試`, () => {
    const indexName = "test"
    const createSearchClient = () => searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_APP_KEY!)
    test.skip(`要能夠寫入 algolia`, async () => {
        const client = createSearchClient()
        const now = Date.now()
        const { taskID } = await client.saveObject({
            indexName: indexName,
            body: {
                objectID: "a79c89e5-4eb7-542b-bf3c-37f1fbab6196",
                name: "臺北體育館",
                address: "臺北市松山區南京東路四段 10 號 7 樓",
                _geoloc: {
                    lat: 25.05138023,
                    lng: 121.55206087,
                },
                createdAt: now,
                updatedAt: now,
            },
        })
        const { status } = await client.waitForTask({ indexName, taskID })
        expect(status).toBe("published")
    })

    test.skip(`要能夠計算搜尋結果的數量`, async () => {
        const client = createSearchClient()
        const { nbHits: nbHits1 } = await client.searchSingleIndex({
            indexName,
            searchParams: {
                query: "體育館",
                attributesToRetrieve: [],
                attributesToHighlight: [],
                hitsPerPage: 0,
                analytics: false,
            },
        })
        expect(nbHits1).toBe(1)
        const { nbHits: nbHits2 } = await client.searchSingleIndex({
            indexName,
            searchParams: {
                query: "紅館",
                attributesToRetrieve: [],
                attributesToHighlight: [],
                hitsPerPage: 0,
                analytics: false,
            },
        })
        expect(nbHits2).toBe(0)
        const ip = "223.137.127.190"
        const { nbHits: nbHits3 } = await client.searchSingleIndex(
            {
                indexName,
                searchParams: {
                    attributesToRetrieve: [],
                    attributesToHighlight: [],
                    hitsPerPage: 0,
                    analytics: false,
                    aroundLatLngViaIP: true,
                },
            },
            {
                headers: {
                    "X-Forwarded-For": ip,
                },
            },
        )
        expect(nbHits3).toBe(1)
    })

    test.skip(`要能夠取得搜尋結果`, async () => {
        const client = createSearchClient()
        const page = 1
        const query = ""
        const { hits } = await client.searchSingleIndex({
            indexName,
            searchParams: {
                attributesToHighlight: [],
                attributesToRetrieve: ["objectID"],
                hitsPerPage: 20,
                analytics: false,
                page: page - 1,
                query,
            },
        })
        const venueIds = hits.map(({ objectID }) => objectID)
        expect(venueIds.length).toBe(1)
    })
})

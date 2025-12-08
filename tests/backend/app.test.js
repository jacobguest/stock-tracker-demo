const request = require("supertest");
const { createApp } = require("../../backend/src/app");

const pool = { query: jest.fn() };
const app = createApp(pool);

beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
});

describe("Prices API", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    describe("POST /prices/:symbol/sync/latest", () => {
        it("returns 201 when a new record is inserted", async () => {
            fetch.mockResolvedValue({
                status: 200,
                json: async () => ({
                "Time Series (Daily)": {
                    "2025-01-01": {
                    "1. open": "100.00",
                    "2. high": "110.00",
                    "3. low": "90.00",
                    "4. close": "105.00",
                    "5. volume": "5000",
                    },
                },
                }),
            });
            
            pool.query.mockResolvedValue({
                rows: [{ id: 1 }],
            });

            const res = await request(app).post("/prices/AAPL/sync/latest");

            expect(res.status).toBe(201);
            expect(pool.query).toHaveBeenCalledTimes(1);
        });

        it("returns 200 when record already exists", async () => {
            fetch.mockResolvedValue({
                status: 200,
                json: async () => ({
                "Time Series (Daily)": {
                    "2025-01-01": {
                    "1. open": "100.00",
                    "2. high": "110.00",
                    "3. low": "90.00",
                    "4. close": "105.00",
                    "5. volume": "5000",
                    },
                },
                }),
            });

            pool.query.mockResolvedValue({ rows: [] });

            const res = await request(app).post("/prices/AAPL/sync/latest");

            expect(res.status).toBe(200);
            expect(pool.query).toHaveBeenCalledTimes(1);
        });

        it("returns 404 when no market data found", async () => {
            fetch.mockResolvedValue({
                status: 200,
                json: async () => ({}),
            });

            const res = await request(app).post("/prices/AAPL/sync/latest");

            expect(res.status).toBe(404);
        });

        it("returns 500 when AlphaVantage fails", async () => {
            fetch.mockResolvedValue({ status: 500 });

            const res = await request(app).post("/prices/AAPL/sync/latest");

            expect(res.status).toBe(500);
        });
    });


    describe("GET /prices/:symbol", () => {
        it("returns price history", async () => {
            const expectedPrices = [
            {
                symbol: "AAPL",
                close: 100,
                open: 105,
                low: 20,
                high: 200,
                volume: 10000,
                trading_date: "2024-08-08"
            },
            {
                symbol: "AAPL",
                close: 56,
                open: 52,
                low: 50,
                high: 60,
                volume: 5500,
                trading_date: "2025-02-03"
            }   
            ];  

            pool.query.mockResolvedValue({
                rows: expectedPrices
            });

            const res = await request(app).get("/prices/AAPL");

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body).toEqual(expectedPrices);
        });

        it("returns 500 on DB failure", async () => {
            pool.query.mockRejectedValue(new Error("DB down"));

            const res = await request(app).get("/prices/AAPL");

            expect(res.status).toBe(500);
        });
    });
});

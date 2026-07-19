import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../server.js";

describe("POST /api/generate", () => {
  it("should return 400 if review text is missing", async () => {
    const response = await request(app)
      .post("/api/generate")
      .send({ tone: "Professional", language: "English" });
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should return mocked response data", async () => {
    const response = await request(app)
      .post("/api/generate")
      .send({ review: "Great app!", tone: "Professional", language: "English" });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("generated_response");
    expect(response.body).toHaveProperty("sentiment_score");
    expect(response.body).toHaveProperty("key_insights");
    expect(response.body.sentiment_score).toBe("Positive");
  });
});

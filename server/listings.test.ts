import { describe, expect, it } from "vitest";
import { decodeUpload } from "./listings";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

describe("listing upload validation", () => {
  it("accepts a supported non-empty image envelope", () => {
    expect(decodeUpload({ fileName: "front.jpg", contentType: "image/jpeg", base64: Buffer.from("image").toString("base64") }, imageTypes).toString()).toBe("image");
  });

  it("rejects unsupported and empty upload envelopes", () => {
    expect(() => decodeUpload({ fileName: "archive.exe", contentType: "application/octet-stream", base64: "YQ==" }, imageTypes)).toThrow("Unsupported file format.");
    expect(() => decodeUpload({ fileName: "empty.jpg", contentType: "image/jpeg", base64: "" }, imageTypes)).toThrow("Each upload must be between 1 byte and 10 MB.");
  });
});

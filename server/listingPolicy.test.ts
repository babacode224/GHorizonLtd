import { describe, expect, it } from "vitest";
import { canManageListings, extractYouTubeVideoId, isPubliclyVisible, statusForCreation, toSlug } from "./listingPolicy";

describe("listing workflow policy", () => {
  it("forces public submissions into the review queue", () => {
    expect(statusForCreation(false)).toBe("pending");
    expect(isPubliclyVisible(statusForCreation(false))).toBe(false);
  });

  it("allows an administrator-created listing to be published directly", () => {
    expect(statusForCreation(true)).toBe("approved");
    expect(isPubliclyVisible(statusForCreation(true))).toBe(true);
  });

  it("allows management actions only for administrator roles", () => {
    expect(canManageListings("admin")).toBe(true);
    expect(canManageListings("user")).toBe(false);
    expect(canManageListings(null)).toBe(false);
  });

  it("normalizes source titles and recognized YouTube URLs", () => {
    expect(toSlug("The Maple Residence — Lagos")).toBe("the-maple-residence-lagos");
    expect(extractYouTubeVideoId("https://youtu.be/aqz-KE-bpKQ")).toBe("aqz-KE-bpKQ");
  });
});

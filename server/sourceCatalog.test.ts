import { describe, expect, it } from "vitest";
import { filterSourceProperties } from "./sourceCatalog";

describe("source property catalogue filtering", () => {
  it("filters the approved source catalogue by property type, location, and price", () => {
    const results = filterSourceProperties({ propertyType: "land", city: "Lagos", maxPrice: 100_000_000 });
    expect(results.map((listing) => listing.slug)).toEqual(["horizon-gardens"]);
  });

  it("supports source-title and location search", () => {
    expect(filterSourceProperties({ query: "Victoria Island" }).map((listing) => listing.slug)).toEqual(["vantage-retail"]);
  });
});

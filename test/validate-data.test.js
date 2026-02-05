/**
 * Minimal tests for First 100 landing site data and scripts.
 *
 * Run with: npm test
 * Uses Node.js built-in test runner (no extra dependencies).
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const REQUIRED_LANGUAGE_KEYS = [
  "slug",
  "name",
  "status",
  "wordCount",
  "featured",
];
const VALID_STATUSES = ["available", "coming-soon"];

describe("languages.json", () => {
  let data;
  it("loads and parses without error", () => {
    const raw = readFileSync(join(ROOT, "src/data/languages.json"), "utf8");
    data = JSON.parse(raw);
    assert.ok(data, "data should be truthy");
    assert.ok(Array.isArray(data.languages), "languages should be an array");
  });

  it("has at least one language", () => {
    assert.ok(
      data.languages.length >= 1,
      `expected at least 1 language, got ${data.languages.length}`
    );
  });

  it("each language has required keys and valid status", () => {
    const slugs = new Set();
    for (const lang of data.languages) {
      for (const key of REQUIRED_LANGUAGE_KEYS) {
        assert.ok(
          key in lang,
          `language "${lang.name || lang.slug}" missing key: ${key}`
        );
      }
      assert.ok(
        VALID_STATUSES.includes(lang.status),
        `language "${lang.slug}" has invalid status: ${lang.status}`
      );
      assert.ok(
        !slugs.has(lang.slug),
        `duplicate slug: ${lang.slug}`
      );
      slugs.add(lang.slug);
    }
  });

  it("available languages have store URLs", () => {
    for (const lang of data.languages) {
      if (lang.status === "available") {
        assert.ok(
          lang.appStore || lang.playStore,
          `available language "${lang.slug}" should have at least one store URL`
        );
      }
    }
  });

  it("slugs are URL-safe (lowercase, no spaces)", () => {
    const slugRe = /^[a-z0-9-]+$/;
    for (const lang of data.languages) {
      assert.ok(
        slugRe.test(lang.slug),
        `slug "${lang.slug}" should be lowercase alphanumeric and hyphens only`
      );
    }
  });
});

describe("illustration-prompts.js", () => {
  let mod;
  it("loads without error", async () => {
    mod = await import(join(ROOT, "scripts/illustration-prompts.js"));
    assert.ok(mod, "module should load");
  });

  it("exports OBJECTS array with required shape", () => {
    assert.ok(Array.isArray(mod.OBJECTS), "OBJECTS should be an array");
    assert.ok(mod.OBJECTS.length >= 1, "OBJECTS should not be empty");
    const ids = new Set();
    for (const obj of mod.OBJECTS) {
      assert.ok(obj.id, "each object should have id");
      assert.ok(typeof obj.prompt === "string", "each object should have prompt string");
      assert.ok(obj.category, "each object should have category");
      assert.ok(!ids.has(obj.id), `duplicate object id: ${obj.id}`);
      ids.add(obj.id);
    }
  });

  it("buildPrompt returns a non-empty string", () => {
    const first = mod.OBJECTS[0];
    const prompt = mod.buildPrompt(first);
    assert.ok(typeof prompt === "string", "buildPrompt should return string");
    assert.ok(prompt.length > 0, "buildPrompt should not return empty string");
    assert.ok(prompt.includes(first.prompt), "buildPrompt should include object prompt");
  });

  it("estimateCost returns expected shape", () => {
    const result = mod.estimateCost(10);
    assert.strictEqual(result.count, 10);
    assert.ok(typeof result.estimated === "number");
    assert.ok(typeof result.min === "number");
    assert.ok(typeof result.max === "number");
  });

  it("getObjectById returns object or undefined", () => {
    const firstId = mod.OBJECTS[0].id;
    assert.deepStrictEqual(mod.getObjectById(firstId), mod.OBJECTS[0]);
    assert.strictEqual(mod.getObjectById("nonexistent-id"), undefined);
  });
});

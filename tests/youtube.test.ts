import { describe, expect, it } from "vitest";
import { youtubeVideoId } from "@/lib/youtube";

describe("youtubeVideoId", () => {
  it("URL watch estándar", () => {
    expect(youtubeVideoId("https://www.youtube.com/watch?v=DHjqpvDnNGE")).toBe("DHjqpvDnNGE");
  });
  it("URL corta youtu.be", () => {
    expect(youtubeVideoId("https://youtu.be/DHjqpvDnNGE")).toBe("DHjqpvDnNGE");
  });
  it("URL embed", () => {
    expect(youtubeVideoId("https://www.youtube.com/embed/DHjqpvDnNGE")).toBe("DHjqpvDnNGE");
  });
  it("URL shorts", () => {
    expect(youtubeVideoId("https://www.youtube.com/shorts/DHjqpvDnNGE")).toBe("DHjqpvDnNGE");
  });
  it("rechaza dominios ajenos", () => {
    expect(youtubeVideoId("https://vimeo.com/12345")).toBeNull();
    expect(youtubeVideoId("https://evil.com/watch?v=x")).toBeNull();
  });
  it("rechaza URLs inválidas", () => {
    expect(youtubeVideoId("no-es-una-url")).toBeNull();
  });
  it("enlaces normales no se embeben", () => {
    expect(youtubeVideoId("https://developer.mozilla.org/es/")).toBeNull();
  });
});

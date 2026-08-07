import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

const { axiosInstance } = await import("@/lib/axios/axios-instance");
const {
  downloadMaterialVersion,
  getMaterialUploadConstraints,
  uploadProjectMaterial,
} = await import("./materials.service");

const get = axiosInstance.get as unknown as ReturnType<typeof vi.fn>;
const post = axiosInstance.post as unknown as ReturnType<typeof vi.fn>;

describe("downloadMaterialVersion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mints a token and then redeems it, in that order", async () => {
    // Two calls, matching the server: the authorization decision and the byte
    // transfer are separate events, and the decision is made again on redemption.
    const order: string[] = [];
    post.mockImplementation(async () => {
      order.push("mint");
      return { data: { token: "body.signature", version: 2, expiresAt: "2026-08-07T12:05:00.000Z" } };
    });
    get.mockImplementation(async () => {
      order.push("redeem");
      return { data: new Blob(["x"]), headers: {} };
    });

    await downloadMaterialVersion("material-1", 2);

    expect(order).toEqual(["mint", "redeem"]);
    expect(post).toHaveBeenCalledWith(
      "/materials/material-1/versions/2/download-token",
    );
    expect(get).toHaveBeenCalledWith("/material-downloads", {
      params: { token: "body.signature" },
      responseType: "blob",
    });
  });

  it("decodes a percent-encoded filename", async () => {
    // The server percent-encodes it, so an Arabic name would otherwise be
    // saved literally as %D8%A7…
    post.mockResolvedValue({
      data: { token: "t.s", version: 1, expiresAt: "2026-08-07T12:05:00.000Z" },
    });
    get.mockResolvedValue({
      data: new Blob(["x"]),
      headers: {
        "content-disposition": `attachment; filename="${encodeURIComponent("كراسة.pdf")}"`,
      },
    });

    const { filename } = await downloadMaterialVersion("material-1", 1);

    expect(filename).toBe("كراسة.pdf");
  });

  it("falls back to a usable name when the header is missing", async () => {
    post.mockResolvedValue({
      data: { token: "t.s", version: 1, expiresAt: "2026-08-07T12:05:00.000Z" },
    });
    get.mockResolvedValue({ data: new Blob(["x"]), headers: {} });

    const { filename } = await downloadMaterialVersion("material-1", 1);

    expect(filename).toBe("material");
  });

  it("does not fetch bytes when the token cannot be minted", async () => {
    post.mockRejectedValue(new Error("not downloadable"));

    await expect(downloadMaterialVersion("material-1", 1)).rejects.toThrow();
    expect(get).not.toHaveBeenCalled();
  });
});

describe("uploadProjectMaterial", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends multipart without forcing a Content-Type", async () => {
    post.mockResolvedValue({
      data: {
        id: "m1",
        projectId: "p1",
        contributionRequestId: null,
        ownerId: "o1",
        title: "brief",
        visibility: "PUBLIC",
        currentVersion: 1,
        versions: [],
        deletedAt: null,
        createdAt: "2026-08-07T09:00:00.000Z",
        updatedAt: "2026-08-07T09:00:00.000Z",
      },
    });

    await uploadProjectMaterial("p1", {
      file: new File(["x"], "brief.pdf", { type: "application/pdf" }),
      title: "brief",
      visibility: "PUBLIC",
      idempotencyKey: "66666666-6666-4666-8666-666666666666",
    });

    // The browser must add its own boundary parameter; the instance's JSON
    // default would override it and make the body unparseable.
    const [, body, config] = post.mock.calls[0];
    expect(body).toBeInstanceOf(FormData);
    expect(config.headers["Content-Type"]).toBeUndefined();
  });
});

describe("getMaterialUploadConstraints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a malformed response rather than presenting no limit", async () => {
    // A silently-NaN maxBytes would mean the form advertises and enforces
    // nothing at all.
    get.mockResolvedValue({ data: { maxBytes: "lots", allowedMimeTypes: [] } });

    await expect(getMaterialUploadConstraints()).rejects.toThrow();
  });
});

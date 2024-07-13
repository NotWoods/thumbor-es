import { assertEquals } from "jsr:@std/assert";
import { brightness, buildThumborUrl, contrast } from "./mod.ts";

/**
 * @see https://thumbor.readthedocs.io/en/latest/libraries.html#library-tests-generating-hmac-of-the-urls
 */
async function signInThumbor(key: string, str: string) {
  // bash command to call thumbor's decrypt method
  const command = new Deno.Command("python3", {
    args: [
      "-c",
      `'from libthumbor.url_signers.base64_hmac_sha1 import UrlSigner; signer = UrlSigner("${key}"); print(signer.signature("${str}").decode("utf-8"))'`,
    ],
  });

  const { code, stdout, stderr } = await command.output();
  assertEquals(
    code,
    0,
    `Failed to execute command: ${new TextDecoder().decode(stderr)}`
  );
  return new TextDecoder().decode(stdout);
}

const securityKey = "my-security-key";
const imageUrl = "my.server.com/some/path/to/image.jpg";

Deno.test("Scenario 1 - Signing of a known url results", async () => {
  const width = 300;
  const height = 200;

  const url = await buildThumborUrl({
    image: imageUrl,
    key: securityKey,
    resize: { width, height },
  });
  assertEquals(
    url,
    "/8ammJH8D-7tXy6kU3lTvoXlhu4o=/300x200/my.server.com/some/path/to/image.jpg"
  );
});

Deno.test(
  "Scenario 2 - Thumbor matching of signature with my library signature",
  async () => {
    const width = 300;
    const height = 200;

    const url = await buildThumborUrl({
      image: imageUrl,
      key: securityKey,
      resize: { width, height },
    });
    assertEquals(
      url,
      "/8ammJH8D-7tXy6kU3lTvoXlhu4o=/300x200/my.server.com/some/path/to/image.jpg"
    );
  }
);

Deno.test(
  "Scenario 3 - Thumbor matching of signature with my library signature with meta",
  async () => {
    const url = await buildThumborUrl({
      image: imageUrl,
      key: securityKey,
      endpoint: "metadata",
    });
    assertEquals(
      url,
      "/Ps3ORJDqxlSQ8y00T29GdNAh2CY=/meta/my.server.com/some/path/to/image.jpg"
    );
  }
);

Deno.test(
  "Scenario 4 - Thumbor matching of signature with my library signature with smart",
  async () => {
    const url = await buildThumborUrl({
      image: imageUrl,
      key: securityKey,
      smart: true,
    });
    assertEquals(
      url,
      "/-2NHpejRK2CyPAm61FigfQgJBxw=/smart/my.server.com/some/path/to/image.jpg"
    );
  }
);

Deno.test(
  "Scenario 5 - Thumbor matching of signature with my library signature with fit-in",
  async () => {
    const url = await buildThumborUrl({
      image: imageUrl,
      key: securityKey,
      fitIn: true,
    });
    assertEquals(
      url,
      "/uvLnA6TJlF-Cc-L8z9pEtfasO3s=/fit-in/my.server.com/some/path/to/image.jpg"
    );
  }
);

Deno.test(
  "Scenario 6 - Thumbor matching of signature with my library signature with filters",
  async () => {
    const url = await buildThumborUrl({
      image: imageUrl,
      key: securityKey,
      filters: [brightness(10), contrast(20)],
    });
    assertEquals(
      url,
      "/ZZtPCw-BLYN1g42Kh8xTcRs0Qls=/filters:brightness(10):contrast(20)/my.server.com/some/path/to/image.jpg"
    );
  }
);

import crypto from "crypto";

const INDEXING_SCOPE = "https://www.googleapis.com/auth/indexing";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const INDEXING_API_URL =
  "https://indexing.googleapis.com/v3/urlNotifications:publish";

async function getAccessToken(): Promise<string> {
  const clientEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing GOOGLE_INDEXING_CLIENT_EMAIL or GOOGLE_INDEXING_PRIVATE_KEY"
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT" })
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      scope: INDEXING_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  ).toString("base64url");

  const signingInput = `${header}.${payload}`;
  const sign = crypto.createSign("RSA-SHA256");
  sign.write(signingInput);
  sign.end();
  const signature = sign.sign(privateKey, "base64url");
  const jwt = `${signingInput}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth2:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error(
      data.error_description ?? data.error ?? "Failed to obtain access token"
    );
  }
  return data.access_token as string;
}

export type IndexingResult = {
  url: string;
  type: "URL_UPDATED" | "URL_DELETED";
  status: "success" | "error";
  httpStatus: number | null;
  response: object | null;
  errorMessage: string | null;
};

export async function notifyUrlUpdated(
  url: string
): Promise<IndexingResult> {
  const accessToken = await getAccessToken();

  const res = await fetch(INDEXING_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ url, type: "URL_UPDATED" }),
  });

  const httpStatus = res.status;

  if (res.ok) {
    const response = await res.json();
    return { url, type: "URL_UPDATED", status: "success", httpStatus, response, errorMessage: null };
  } else {
    let errorMessage: string;
    try {
      const errBody = await res.json();
      errorMessage = errBody.error?.message ?? JSON.stringify(errBody);
    } catch {
      errorMessage = await res.text();
    }
    return { url, type: "URL_UPDATED", status: "error", httpStatus, response: null, errorMessage };
  }
}

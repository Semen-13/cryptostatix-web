import fs from "node:fs/promises";
import path from "node:path";

const headlinersFilePath = path.join(process.cwd(), "data", "weekly_headliners.txt");

function parseTranslations(content) {
  const translations = {};
  const sections = content.split(/^\[(en|ru|ua)\]\s*$/gim);

  for (let index = 1; index < sections.length; index += 2) {
    const language = sections[index].toLowerCase();
    translations[language] = sections[index + 1]?.trim() || "";
  }

  return translations;
}

export default async function handler(request) {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ success: false, error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json; charset=utf-8", Allow: "GET" },
    });
  }

  try {
    const fileContent = await fs.readFile(headlinersFilePath, "utf8");
    const translations = parseTranslations(fileContent);
    if (!Object.values(translations).some((content) => content)) {
      return new Response(JSON.stringify({ success: false, error: "Weekly headliners are empty" }), {
        status: 404,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    return new Response(JSON.stringify({ success: true, translations }), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return new Response(JSON.stringify({ success: false, error: "Weekly headliners file not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    console.error("Weekly headliners read error:", error);
    return new Response(JSON.stringify({ success: false, error: "Unable to read weekly headliners" }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
}

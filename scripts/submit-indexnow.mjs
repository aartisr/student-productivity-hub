const siteUrl = "https://sph.ai-aarti.com";
const key = "3450b713-fc17-4791-b160-f2c11b46f896";
const keyLocation = `${siteUrl}/${key}.txt`;
const urlList = [
  siteUrl,
  `${siteUrl}/about.html`,
  `${siteUrl}/resources.html`,
  `${siteUrl}/community.html`,
  `${siteUrl}/story.html`,
];
const shouldSubmit = process.argv.includes("--submit");

const payload = {
  host: new URL(siteUrl).host,
  key,
  keyLocation,
  urlList,
};

if (!shouldSubmit) {
  console.log("IndexNow dry run. No URLs were submitted.");
  console.log(JSON.stringify(payload, null, 2));
  console.log("Run `npm run indexnow:submit -- --submit` to submit this batch.");
  process.exit(0);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  const responseText = await response.text();
  throw new Error(`IndexNow returned ${response.status}: ${responseText || response.statusText}`);
}

console.log(`IndexNow accepted ${urlList.length} URL(s): ${response.status} ${response.statusText}`);
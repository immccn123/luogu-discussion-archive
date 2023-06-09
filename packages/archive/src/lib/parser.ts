import { JSDOM } from "jsdom";

const delay = (ms?: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export async function parseApp(url: string, retries = 1): Promise<HTMLElement> {
  const response = await fetch(url, {
    headers: { cookie: process.env.COOKIE as string },
    cache: "no-cache",
  });
  if (response.status > 500) {
    if (retries) {
      await delay(1000);
      return parseApp(url, retries - 1);
    }
    throw Error("Reached maximum retry limit");
  }
  if (!response.ok) throw Error(response.statusText);
  const { document } = new JSDOM(await response.text()).window;
  const app = document.getElementById("app-old");
  if (!app)
    throw Error(
      document.querySelector("div")?.textContent?.trim() ?? undefined
    );
  return app;
}

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function parseUser(element: Element) {
  const a = element.querySelector('a[href^="/user/"]')!;
  return {
    id: parseInt(a.getAttribute("href")!.slice("/user/".length), 10),
    username: a.textContent!,
    color: a.getAttribute("class")!.split(" ", 1)[0].slice("lg-fg-".length),
    checkmark: element.querySelector("a > svg")?.getAttribute("fill") ?? null,
    badge: element.querySelector("span.am-badge")?.innerHTML ?? null,
  };
}

export const parseComment = (element: Element) => ({
  time: new Date(
    `${
      Array.from(element.querySelector(".am-comment-meta")!.childNodes)
        .filter((node) => node.nodeType === node.TEXT_NODE)
        .map((node) =>
          /^\d{4}(-\d{2}){2} \d{2}(:\d{2}){1,2}$/.exec(node.textContent!.trim())
        )
        .filter((node) => node)[0]![0]
    }+8`
  ),
  content: element.querySelector(".am-comment-bd")!.innerHTML.trim(),
});
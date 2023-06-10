"use client";

import "katex/dist/katex.css";
import { useEffect, useRef } from "react";
import renderMathInElement from "katex/contrib/auto-render";
import { computePosition } from "@floating-ui/dom";
import type { User } from "@prisma/client";
import UserInfo from "@/components/UserInfo";

export default function Content({
  content,
  discussionAuthor,
  usersMetioned,
  userId,
  setUserId,
}: {
  content: string;
  discussionAuthor: number;
  usersMetioned: User[];
  userId: number | null;
  setUserId: (userId: number | null) => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const userRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    renderMathInElement(contentRef.current as HTMLDivElement, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
    });

    contentRef.current?.querySelectorAll("a[data-uid]").forEach((element) => {
      const uid = parseInt(element.getAttribute("data-uid") as string, 10);
      const tooltip = userRefs.current[uid] as HTMLDivElement;

      function update() {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        computePosition(element as HTMLElement, tooltip, {
          placement: "top",
        }).then(({ x, y }) =>
          Object.assign(tooltip.style, { left: `${x}px`, top: `${y}px` })
        );
      }
      function showTooltip() {
        update();
        tooltip.style.display = "block";
      }
      function hideTooltip() {
        tooltip.style.display = "none";
      }

      (
        [
          ["mouseenter", showTooltip],
          ["mouseleave", hideTooltip],
          ["focus", showTooltip],
          ["blur", hideTooltip],
          [
            "click",
            () => {
              hideTooltip();
              if (userId !== uid) setUserId(uid);
              else setUserId(null);
            },
          ],
        ] as [string, () => void][]
      ).forEach(([event, listener]) =>
        element.addEventListener(event, listener)
      );
    });
  });

  return (
    <>
      <div
        className="markdown text-break overflow-x-auto overflow-y-hidden"
        ref={contentRef}
        /* eslint-disable-next-line react/no-danger */
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {usersMetioned.map((user) => (
        <div
          ref={(el) => {
            userRefs.current[user.id] = el;
          }}
          key={user.id}
          className="position-absolute"
          style={{ display: "none" }}
        >
          <div className="bg-body rounded-4 shadow-sm px-3 py-2x mb-2">
            <UserInfo user={user} />
            {user.id === discussionAuthor ? " 楼主" : ""}
          </div>
        </div>
      ))}
    </>
  );
}

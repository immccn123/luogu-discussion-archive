"use client";

import "katex/dist/katex.css";
import { useEffect, useRef } from "react";
import Image from "next/image";
import renderMathInElement from "katex/contrib/auto-render";
import hljs from "highlight.js";
import { User } from "@/types/mongodb";
import UserInfo from "./UserInfo";

export default function Reply({
  reply,
}: {
  reply: {
    time: string;
    author: User;
    content: string;
  };
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    hljs.configure({ languages: ["cpp"] });
    contentRef.current
      ?.querySelectorAll("code")
      .forEach((element) => hljs.highlightElement(element));
    renderMathInElement(contentRef.current as HTMLDivElement, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
    });
  }, [reply.content]);

  return (
    <div className="reply list-group-item position-relative">
      <a
        href={`https://www.luogu.com.cn/user/${reply.author._id}`}
        className="reply-avatar"
      >
        <Image
          src={`https://cdn.luogu.com.cn/upload/usericon/${reply.author._id}.png`}
          className="rounded-circle shadow"
          fill
          alt={reply.author._id.toString()}
        />
      </a>
      <div className="reply-card bg-white rounded-4 shadow mb-4s">
        <div className="reply-meta bg-light rounded-top-4 pe-4 py-2">
          {/* <span className="font-monospace align-top text-body-tertiary me-1">@</span> */}
          <UserInfo user={reply.author} />
          <span className="float-end text-body-tertiary d-none d-md-inline">
            {reply.time}
          </span>
        </div>
        <div className="reply-content pe-4 py-2">
          <div
            className="markdown"
            ref={contentRef}
            /* eslint-disable-next-line react/no-danger */
            dangerouslySetInnerHTML={{ __html: reply.content }}
          />
          <span
            className="text-end text-body-tertiary d-block d-md-none"
            style={{ fontSize: ".8rem" }}
          >
            {reply.time}
          </span>
        </div>
      </div>
    </div>
  );
}
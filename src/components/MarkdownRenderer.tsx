import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { youtubeVideoId } from "@/lib/youtube";

function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  return (
    <span className="my-4 block aspect-video w-full overflow-hidden rounded-xl">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </span>
  );
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose-custom">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const videoId = href ? youtubeVideoId(href) : null;
            if (videoId) {
              return <YouTubeEmbed videoId={videoId} title={String(children)} />;
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

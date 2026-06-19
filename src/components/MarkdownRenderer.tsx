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

function GoogleDocsEmbed({ docId, title }: { docId: string; title: string }) {
  return (
    <div className="my-4 space-y-2">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <iframe
        src={`https://docs.google.com/document/d/${docId}/preview`}
        title={title}
        className="w-full border border-slate-300 rounded-lg"
        style={{ minHeight: "600px" }}
        allow="fullscreen"
      />
    </div>
  );
}

function GoogleSheetsEmbed({ sheetId, title }: { sheetId: string; title: string }) {
  return (
    <div className="my-4 space-y-2">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <iframe
        src={`https://docs.google.com/spreadsheets/d/${sheetId}/preview`}
        title={title}
        className="w-full border border-slate-300 rounded-lg"
        style={{ minHeight: "500px" }}
        allow="fullscreen"
      />
    </div>
  );
}

function GoogleSlidesEmbed({ presentationId, title }: { presentationId: string; title: string }) {
  return (
    <div className="my-4 space-y-2">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <iframe
        src={`https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`}
        title={title}
        className="w-full border border-slate-300 rounded-lg"
        style={{ minHeight: "400px" }}
        allowFullScreen
      />
    </div>
  );
}

function PdfEmbed({ url, title }: { url: string; title: string }) {
  return (
    <div className="my-4 space-y-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-indigo-600 hover:underline"
      >
        <span>📕</span>
        {title}
        <span className="text-xs">(descargar)</span>
      </a>
      <embed
        src={url}
        type="application/pdf"
        className="w-full border border-slate-300 rounded-lg"
        style={{ minHeight: "600px" }}
      />
    </div>
  );
}

function extractGoogleId(url: string): string | null {
  const patterns = [
    /\/document\/d\/([\w-]+)/,
    /\/spreadsheets\/d\/([\w-]+)/,
    /\/presentation\/d\/([\w-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose-custom">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            if (!href) return <a>{children}</a>;

            const videoId = youtubeVideoId(href);
            if (videoId) {
              return <YouTubeEmbed videoId={videoId} title={String(children)} />;
            }

            // Google Docs
            if (href.includes("docs.google.com/document")) {
              const docId = extractGoogleId(href);
              if (docId) {
                return <GoogleDocsEmbed docId={docId} title={String(children)} />;
              }
            }

            // Google Sheets
            if (href.includes("docs.google.com/spreadsheets")) {
              const sheetId = extractGoogleId(href);
              if (sheetId) {
                return <GoogleSheetsEmbed sheetId={sheetId} title={String(children)} />;
              }
            }

            // Google Slides
            if (href.includes("docs.google.com/presentation")) {
              const presentationId = extractGoogleId(href);
              if (presentationId) {
                return (
                  <GoogleSlidesEmbed presentationId={presentationId} title={String(children)} />
                );
              }
            }

            // PDF
            if (href.toLowerCase().endsWith(".pdf")) {
              return <PdfEmbed url={href} title={String(children)} />;
            }

            // Default link
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

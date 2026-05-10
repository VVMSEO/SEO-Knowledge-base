import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MarkdownRender({ content }: { content: string }) {
  return (
    <div className="prose prose-slate prose-sm max-w-none text-slate-800">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-8 mb-4 text-slate-900 border-b pb-2" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-semibold mt-6 mb-3 text-slate-800" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-base font-medium mt-4 mb-2 text-slate-800" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5 my-4 space-y-2 text-slate-700 marker:text-indigo-400" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-4 space-y-2 text-slate-700 marker:text-indigo-400" {...props} />,
          li: ({node, ...props}) => <li className="pl-1" {...props} />,
          table: ({node, ...props}) => (
            <div className="overflow-x-auto my-6 border border-slate-200 rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-slate-200" {...props} />
            </div>
          ),
          th: ({node, ...props}) => <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200" {...props} />,
          td: ({node, ...props}) => <td className="px-4 py-3 text-sm text-slate-700 border-b border-slate-100" {...props} />,
          p: ({node, ...props}) => <p className="mb-4 text-slate-800 leading-relaxed" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-300 pl-4 py-1 pb-4 mb-4 italic text-slate-600 bg-indigo-50/50 relative rounded-r-lg" {...props} />,
          code: ({node, ...props}) => <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-[13px] border border-slate-200" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';

export default function PageView() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);

  useEffect(() => {
    api.get(`/pages/slug/${slug}`).then((res) => setPage(res.data));
  }, [slug]);

  if (!page) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <>
      <PageHeader title={page.title} breadcrumbs={[{ label: page.title }]} />
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 md:p-10 shadow-sm">
          <div
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>
    </>
  );
}

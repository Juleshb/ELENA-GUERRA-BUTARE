import { useOutletContext } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import { Target, Telescope } from 'lucide-react';
import { FeatureCard } from '../components/ui/Card';

export default function About() {
  const { settings } = useOutletContext();

  return (
    <>
      <PageHeader
        title={`About ${settings?.schoolName || 'Our School'}`}
        subtitle="Our story, values, and commitment to education in Huye"
        breadcrumbs={[{ label: 'About' }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 md:p-10 shadow-sm">
          {settings?.about ? (
            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: settings.about }}
            />
          ) : (
            <p className="text-slate-600">
              About content will appear here once configured in the admin panel.
            </p>
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-6 mt-10">
          {settings?.mission && (
            <FeatureCard icon={Target} title="Mission" description={settings.mission} />
          )}
          {settings?.vision && (
            <FeatureCard icon={Telescope} title="Vision" description={settings.vision} />
          )}
        </div>
      </div>
    </>
  );
}

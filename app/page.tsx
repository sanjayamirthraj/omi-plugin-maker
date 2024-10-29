import PluginWizard from '@/components/ui/plugin-form';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-black relative">
      <div className="absolute top-8 left-8">
        <Image
          src="/omi-white.webp"
          alt="Omi Logo"
          width={100}
          height={44}
          priority
          className="w-auto h-auto"
          quality={100}
        />
      </div>
      <div className="flex items-center justify-center p-4 min-h-screen">
        <PluginWizard />
      </div>
    </div>
  );
}

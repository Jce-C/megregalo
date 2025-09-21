import Starfield from '@/components/starfield';
import CascadeScene from '@/components/cascade-scene';
import UploadZone from '@/components/upload-zone';

export default function Home() {
  return (
    <div className="relative w-full h-screen overflow-hidden" data-testid="home-page">
      <Starfield />
      <CascadeScene />
      <UploadZone />
    </div>
  );
}

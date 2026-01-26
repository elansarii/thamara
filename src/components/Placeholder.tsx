import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

interface PlaceholderProps {
  title: string;
}

export default function Placeholder({ title }: PlaceholderProps) {
  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <h1 
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--thamara-text)' }}
        >
          {title}
        </h1>
        <p 
          className="text-base mb-6"
          style={{ color: 'var(--thamara-text-muted)' }}
        >
          Unimplemented yet
        </p>
        <Link
          href={ROUTES.HOME}
          className="inline-block px-6 py-3 rounded-lg font-medium text-white"
          style={{ background: 'var(--thamara-primary-500)' }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

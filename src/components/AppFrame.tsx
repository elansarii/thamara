// Enforces mobile proportions on any device
export default function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-0 md:p-4">
      <div className="w-full max-w-[440px] h-screen md:h-[calc(100vh-2rem)] md:rounded-2xl shadow-2xl overflow-hidden relative flex flex-col">
        {children}
      </div>
    </div>
  );
}

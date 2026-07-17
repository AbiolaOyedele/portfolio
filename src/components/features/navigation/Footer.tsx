export interface FooterProps {
  className?: string;
}

export default function Footer({
  className,
}: FooterProps = {}): React.JSX.Element {
  return (
    <footer className={`py-8 mt-auto${className ? ` ${className}` : ""}`}>
      <div className="max-w-6xl mx-auto px-6 flex justify-center sm:justify-end">
        <p
          className="text-[13px] text-text-muted text-center sm:text-right"
          style={{ fontWeight: 300 }}
        >
          &copy; 2026 Abiola Oyedele. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

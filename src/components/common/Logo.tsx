type LogoProps = {
  readonly size?: number;
  readonly borderRadius?: string;
};

export function Logo({size = 36, borderRadius = '8px'}: LogoProps) {
  return (
    <img
      src="/logo.svg"
      alt="Credo Logo"
      style={{
        width: size,
        height: size,
        borderRadius,
      }}
    />
  );
}

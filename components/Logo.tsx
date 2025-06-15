import Image from 'next/image';

interface LogoProps {
  size?: number;
}

export default function Logo({ size = 32 }: LogoProps) {
  return (
    <Image
      src="/ghostlogo.png"
      alt="GHOSTDROP"
      width={size}
      height={size}
      className="rounded-full"
    />
  );
} 
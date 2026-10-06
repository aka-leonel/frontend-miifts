import byte34 from "../assets/byte-3-4.svg";
import byteLeyendo from "../assets/byte-leyendo.png";
import byteCalculadora from "../assets/byte-calculadora.png";

type ByteVariant = "tres-cuartos" | "leyendo" | "calculadora";

type ByteMascotProps = {
  size?: number;
  variant?: ByteVariant;
  className?: string;
};

const IMAGENES: Record<ByteVariant, { src: string; ratio: number }> = {
  "tres-cuartos": { src: byte34, ratio: 1.125 },
  leyendo: { src: byteLeyendo, ratio: 1.125 },
  calculadora: { src: byteCalculadora, ratio: 1190 / 1024 },
};

export default function ByteMascot({ size = 160, variant = "tres-cuartos", className }: ByteMascotProps) {
  const { src, ratio } = IMAGENES[variant];
  return (
    <img
      src={src}
      width={size}
      height={Math.round(size * ratio)}
      alt="Byte, la mascota de miIFTS"
      className={className}
    />
  );
}

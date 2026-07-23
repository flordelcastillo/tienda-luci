import Link from "next/link";
import Image from "next/image";
import { formatARS } from "@/lib/money";
import { Badge } from "@/components/ui";

type Props = {
  slug: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  featured?: boolean;
};

export function ProductCard({ slug, name, price, image, category, featured }: Props) {
  return (
    <Link href={`/producto/${slug}`} className="group block">
      <div className="bg-sand relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)]">
        {image && (
          <Image
            src={image}
            alt={name}
            fill
            unoptimized
            sizes="(max-width:640px) 50vw, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {featured && (
          <div className="absolute top-3 left-3">
            <Badge tone="gold">Destacado</Badge>
          </div>
        )}
      </div>
      <div className="pt-3">
        {category && <p className="text-muted text-xs">{category}</p>}
        <p className="text-ink group-hover:text-sage transition-colors">{name}</p>
        <p className="font-display text-sage mt-0.5 text-lg">{formatARS(price)}</p>
      </div>
    </Link>
  );
}

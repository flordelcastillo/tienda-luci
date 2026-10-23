import Link from "next/link";
import Image from "next/image";
import { formatARS } from "@/lib/money";
import { Badge } from "@/components/ui";
import { QuickAddButton, type QuickAdd } from "@/components/QuickAddButton";

type Props = {
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  image?: string;
  category?: string;
  featured?: boolean;
  quickAdd?: QuickAdd;
};

export function ProductCard({
  slug,
  name,
  price,
  compareAtPrice,
  image,
  category,
  featured,
  quickAdd,
}: Props) {
  const hasDiscount = !!compareAtPrice && compareAtPrice > price;
  const discountPct = hasDiscount ? Math.round((1 - price / compareAtPrice!) * 100) : 0;

  return (
    <Link href={`/producto/${slug}`} className="group block text-center">
      <div className="bg-sand relative aspect-square overflow-hidden rounded-xl">
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
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {featured && (
            <Badge tone="gold" className="bg-white/90">
              Destacado
            </Badge>
          )}
          {hasDiscount && (
            <Badge tone="rose" className="text-gold-dark bg-white/90">
              -{discountPct}%
            </Badge>
          )}
        </div>
      </div>
      <div className="pt-3">
        {category && <p className="text-muted text-xs">{category}</p>}
        <p className="text-ink group-hover:text-gold-dark text-sm tracking-wide uppercase transition-colors">
          {name}
        </p>
        <div className="mt-1 flex items-baseline justify-center gap-2">
          <p className="text-ink text-sm">{formatARS(price)}</p>
          {hasDiscount && (
            <span className="text-muted text-xs line-through">
              {formatARS(compareAtPrice!)}
            </span>
          )}
        </div>
        {quickAdd && (
          <div className="mt-2.5 flex justify-center">
            <QuickAddButton item={quickAdd} />
          </div>
        )}
      </div>
    </Link>
  );
}

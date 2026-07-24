import Link from "next/link";
import Image from "next/image";
import { Droplets } from "lucide-react";
import { formatARS } from "@/lib/money";
import { Badge } from "@/components/ui";
import { QuickAddButton, type QuickAdd } from "@/components/QuickAddButton";

type Props = {
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  waterproof?: boolean;
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
  waterproof,
  image,
  category,
  featured,
  quickAdd,
}: Props) {
  const hasDiscount = !!compareAtPrice && compareAtPrice > price;
  const discountPct = hasDiscount ? Math.round((1 - price / compareAtPrice!) * 100) : 0;

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
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {featured && <Badge tone="gold">Destacado</Badge>}
          {hasDiscount && <Badge tone="rose">-{discountPct}%</Badge>}
        </div>
        {waterproof && (
          <span
            className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[11px] text-sky-700 backdrop-blur"
            title="Apto agua · no se oxida"
          >
            <Droplets className="size-3" />
            Agua
          </span>
        )}
        {quickAdd && <QuickAddButton item={quickAdd} />}
      </div>
      <div className="pt-3">
        {category && <p className="text-muted text-xs">{category}</p>}
        <p className="text-ink group-hover:text-sage transition-colors">{name}</p>
        <div className="mt-0.5 flex items-baseline gap-2">
          <p className="font-display text-sage text-lg">{formatARS(price)}</p>
          {hasDiscount && (
            <span className="text-muted text-sm line-through">
              {formatARS(compareAtPrice!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

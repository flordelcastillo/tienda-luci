"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Field, Input, Textarea, Select } from "@/components/ui";
import { addReview, setReviewApproved, deleteReview } from "./actions";

type Product = { id: string; name: string };
type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  approved: boolean;
  createdAt: string;
  productName: string;
};

export function ReviewsAdmin({
  products,
  reviews,
}: {
  products: Product[];
  reviews: Review[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  // Alta de reseña
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  function run(fn: () => Promise<{ error?: string; ok?: boolean }>, okMsg: string) {
    start(async () => {
      const res = await fn();
      if (res?.error) toast.error(res.error);
      else {
        toast.success(okMsg);
        router.refresh();
      }
    });
  }

  function submitNew() {
    run(() => addReview({ productId, author, rating, text }), "Reseña agregada");
    // Limpiamos para cargar la siguiente.
    setText("");
    setAuthor("");
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-6">
        <h2 className="font-display text-ink text-lg">Agregar reseña</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Producto">
            <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Autora / cliente">
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Ej: Meli G." />
          </Field>
        </div>
        <Field label="Puntaje">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} estrellas`}>
                <Star
                  className={`size-6 ${n <= rating ? "fill-gold text-gold" : "text-line"}`}
                />
              </button>
            ))}
          </div>
        </Field>
        <Field label="Texto">
          <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
        <div className="flex justify-end">
          <Button disabled={pending || !author || !text} onClick={submitNew}>
            Agregar reseña
          </Button>
        </div>
      </Card>

      <Card className="p-0">
        <div className="border-line border-b px-6 py-4">
          <h2 className="font-display text-ink text-lg">Reseñas ({reviews.length})</h2>
        </div>
        {reviews.length === 0 ? (
          <p className="text-muted px-6 py-10 text-center text-sm">Todavía no hay reseñas.</p>
        ) : (
          <ul className="divide-line divide-y">
            {reviews.map((r) => (
              <li key={r.id} className="flex items-start gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`size-3.5 ${n <= r.rating ? "fill-gold text-gold" : "text-line"}`}
                        />
                      ))}
                    </div>
                    <span className="text-ink text-sm font-medium">{r.author}</span>
                    {!r.approved && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                        Oculta
                      </span>
                    )}
                  </div>
                  <p className="text-ink mt-1 text-sm">{r.text}</p>
                  <p className="text-muted mt-1 text-xs">{r.productName}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() =>
                      run(
                        () => setReviewApproved(r.id, !r.approved),
                        r.approved ? "Reseña ocultada" : "Reseña visible",
                      )
                    }
                    disabled={pending}
                    className="text-muted hover:text-sage rounded-lg p-2"
                    title={r.approved ? "Ocultar" : "Mostrar"}
                  >
                    {r.approved ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("¿Borrar esta reseña?"))
                        run(() => deleteReview(r.id), "Reseña borrada");
                    }}
                    disabled={pending}
                    className="text-muted rounded-lg p-2 hover:text-red-600"
                    title="Borrar"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

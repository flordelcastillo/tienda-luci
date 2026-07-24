"use client";

import { useState, useTransition } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Field, Input, Textarea } from "@/components/ui";
import { submitReview } from "./review-actions";

// Formulario público para dejar una reseña. Al enviarse queda pendiente de
// aprobación, así que mostramos un agradecimiento en vez de la reseña al toque.
export function ReviewForm({ slug }: { slug: string }) {
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  function submit() {
    start(async () => {
      const res = await submitReview({ slug, author, rating, text });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <Card className="flex items-center gap-3 p-5">
        <CheckCircle2 className="text-sage size-6 shrink-0" />
        <p className="text-ink text-sm">
          ¡Gracias por tu reseña! La revisamos y la publicamos en breve.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4 p-6">
      <h3 className="font-display text-ink text-lg">Dejá tu reseña</h3>
      <Field label="Puntaje">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
            >
              <Star
                className={`size-7 transition-colors ${
                  n <= rating ? "fill-gold text-gold" : "text-line hover:text-gold/50"
                }`}
              />
            </button>
          ))}
        </div>
      </Field>
      <Field label="Tu nombre">
        <Input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Ej: Meli G."
          maxLength={60}
        />
      </Field>
      <Field label="Tu reseña">
        <Textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="¿Qué te pareció la pieza?"
          maxLength={600}
        />
      </Field>
      <div className="flex justify-end">
        <Button disabled={pending || !author.trim() || text.trim().length < 3} onClick={submit}>
          {pending ? "Enviando…" : "Enviar reseña"}
        </Button>
      </div>
    </Card>
  );
}

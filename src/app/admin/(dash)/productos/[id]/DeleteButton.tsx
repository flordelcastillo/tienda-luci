"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui";
import { deleteProduct } from "../actions";

export function DeleteProductButton({ id }: { id: string }) {
  const [pending, start] = useTransition();

  function onDelete() {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
    start(() => {
      deleteProduct(id);
    });
  }

  return (
    <Button variant="danger" type="button" onClick={onDelete} disabled={pending}>
      {pending ? "Eliminando…" : "Eliminar"}
    </Button>
  );
}

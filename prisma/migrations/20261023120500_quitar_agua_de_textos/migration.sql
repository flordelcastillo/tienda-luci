-- Se dejó de mencionar "apto agua" en la tienda: limpia los dos textos guardados
-- que la nombraban (barra de anuncio y una reseña). Sólo toca esas frases exactas.
UPDATE "SiteSetting"
SET "announcement" = replace("announcement", ', aptas para agua', '')
WHERE "announcement" LIKE '%, aptas para agua%';

UPDATE "Review"
SET "text" = replace("text", ' ni con el agua', '')
WHERE "text" LIKE '%ni con el agua%';

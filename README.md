# Slide de Marcas — Feiras e Eventos

Slide de telão para feiras e eventos do segmento de açaí, polpas, sorvetes e
alimentos regionais. Exibe, em loop infinito, os logos das marcas parceiras do
evento. Veja `PRODUCT.md` e `DESIGN.md` para contexto de produto e design, e
`CLAUDE.md` para detalhes técnicos.

## Rodar localmente

```bash
npm install
npm run dev   # http://localhost:3000
```

## Adicionar uma marca

1. Coloque o arquivo de imagem do logo em `public/brand-logos/`
   (png, jpg, jpeg, webp, avif, gif ou svg).
2. O logo já aparece no carrossel — o nome é derivado do nome do arquivo
   (`acai-do-nelson.png` → "Acai Do Nelson").
3. Opcional: para corrigir acentuação/capitalização ou adicionar termos de
   busca, acrescente uma entrada em `data/clients.json`:

   ```json
   {
     "name": "Açaí do Nelson",
     "logo": "acai-do-nelson.png",
     "aliases": ["nelson açaí"]
   }
   ```

   O campo `logo` deve ser o nome de arquivo exato dentro de
   `public/brand-logos/`.

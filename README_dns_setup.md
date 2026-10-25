Cloudflare ilə misterio.az DNS qurulumu (addım-addım):

1. cloudflare.com → "Add a Site" → misterio.az yaz
2. Plan: Free seç
3. Cloudflare iki NS verəcək (ns1.cloudflare.com, ns2.cloudflare.com)
4. Bu NS-ləri online.az-a yaz (evət, NS server formasına — amma Cloudflare-nin verdiyi ns1/ns2)
5. Mənə Cloudflare API Token verərsən
6. Mən Resend DNS qeydlərini Cloudflare-a avtomatik yazıram (TXT SPF, TXT DKIM, TXT DMARC)
7. Resend "Verified" edəcək

VƏ YA (əgər Cloudflare istəmirsən):
- online.az support-a yaz: "Misterio.az üçün TXT/CNAME DNS qeydi əlavə etmək istəyirəm, harada?"
- Onlar NS server formasından fərqli yer göstərəcəklər

# Isometric Darıca

Darıca, Kocaeli için mobil uyumlu, PWA destekli izometrik harita prototipi.

## Çalıştırma
Bu proje statik web uygulamasıdır. Dosyayı `file://` üzerinden açmayın; yerel sunucu veya HTTPS hosting kullanın.

```bash
python -m http.server 8000
```
Ardından `http://localhost:8000` adresini açın.

## GitHub Pages
1. ZIP içeriğini bir GitHub deposuna yükleyin.
2. Settings → Pages → Deploy from a branch seçin.
3. `main` ve `/ (root)` seçip kaydedin.
4. Birkaç dakika sonra verilen HTTPS adresini açın.

## Veri ve sınırlar
- Harita stili ve vektör harita verileri OpenFreeMap üzerinden yüklenir.
- Coğrafi veri OpenStreetMap kaynaklı olabilir; ekrandaki atıf bağlantılarını koruyun.
- Bina 3D ekstrüzyonu, veri kaynağında bina kat/yükseklik niteliği varsa bunları kullanır; yoksa yaklaşık yükseklik gösterir.
- Arama Nominatim servisini kullanır. Yoğun/otomatik sorgu göndermeyin.
- Bu ilk sürüm gerçekçi fotogrametrik bina modelleri değildir. Gerçek bina cepheleri/çatı detayları için ayrıca lisanslı veya açık 3D veri gerekir.
- Harita katmanları internet bağlantısı gerektirir; PWA kabuğu önbelleğe alınır, tüm harita çevrimdışı çalışmaz.

## Teknolojiler
MapLibre GL JS, OpenFreeMap, OpenStreetMap, Nominatim, Service Worker.

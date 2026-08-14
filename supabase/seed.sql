-- Referans veri: 81 il, örnek ilçeler, kategoriler, ilk satıcı kampanyası.
-- Admin için üye olduktan sonra promote-admin.sql çalıştır.

-- 81 il (plaka kodu UUID son segmentinde)
insert into public.locations (id, name, slug, type) values
  ('30000000-0000-4000-a000-000000000001', 'Adana', 'adana', 'city'),
  ('30000000-0000-4000-a000-000000000002', 'Adıyaman', 'adiyaman', 'city'),
  ('30000000-0000-4000-a000-000000000003', 'Afyonkarahisar', 'afyonkarahisar', 'city'),
  ('30000000-0000-4000-a000-000000000004', 'Ağrı', 'agri', 'city'),
  ('30000000-0000-4000-a000-000000000005', 'Amasya', 'amasya', 'city'),
  ('30000000-0000-4000-a000-000000000006', 'Ankara', 'ankara', 'city'),
  ('30000000-0000-4000-a000-000000000007', 'Antalya', 'antalya', 'city'),
  ('30000000-0000-4000-a000-000000000008', 'Artvin', 'artvin', 'city'),
  ('30000000-0000-4000-a000-000000000009', 'Aydın', 'aydin', 'city'),
  ('30000000-0000-4000-a000-000000000010', 'Balıkesir', 'balikesir', 'city'),
  ('30000000-0000-4000-a000-000000000011', 'Bilecik', 'bilecik', 'city'),
  ('30000000-0000-4000-a000-000000000012', 'Bingöl', 'bingol', 'city'),
  ('30000000-0000-4000-a000-000000000013', 'Bitlis', 'bitlis', 'city'),
  ('30000000-0000-4000-a000-000000000014', 'Bolu', 'bolu', 'city'),
  ('30000000-0000-4000-a000-000000000015', 'Burdur', 'burdur', 'city'),
  ('30000000-0000-4000-a000-000000000016', 'Bursa', 'bursa', 'city'),
  ('30000000-0000-4000-a000-000000000017', 'Çanakkale', 'canakkale', 'city'),
  ('30000000-0000-4000-a000-000000000018', 'Çankırı', 'cankiri', 'city'),
  ('30000000-0000-4000-a000-000000000019', 'Çorum', 'corum', 'city'),
  ('30000000-0000-4000-a000-000000000020', 'Denizli', 'denizli', 'city'),
  ('30000000-0000-4000-a000-000000000021', 'Diyarbakır', 'diyarbakir', 'city'),
  ('30000000-0000-4000-a000-000000000022', 'Edirne', 'edirne', 'city'),
  ('30000000-0000-4000-a000-000000000023', 'Elazığ', 'elazig', 'city'),
  ('30000000-0000-4000-a000-000000000024', 'Erzincan', 'erzincan', 'city'),
  ('30000000-0000-4000-a000-000000000025', 'Erzurum', 'erzurum', 'city'),
  ('30000000-0000-4000-a000-000000000026', 'Eskişehir', 'eskisehir', 'city'),
  ('30000000-0000-4000-a000-000000000027', 'Gaziantep', 'gaziantep', 'city'),
  ('30000000-0000-4000-a000-000000000028', 'Giresun', 'giresun', 'city'),
  ('30000000-0000-4000-a000-000000000029', 'Gümüşhane', 'gumushane', 'city'),
  ('30000000-0000-4000-a000-000000000030', 'Hakkari', 'hakkari', 'city'),
  ('30000000-0000-4000-a000-000000000031', 'Hatay', 'hatay', 'city'),
  ('30000000-0000-4000-a000-000000000032', 'Isparta', 'isparta', 'city'),
  ('30000000-0000-4000-a000-000000000033', 'Mersin', 'mersin', 'city'),
  ('30000000-0000-4000-a000-000000000034', 'İstanbul', 'istanbul', 'city'),
  ('30000000-0000-4000-a000-000000000035', 'İzmir', 'izmir', 'city'),
  ('30000000-0000-4000-a000-000000000036', 'Kars', 'kars', 'city'),
  ('30000000-0000-4000-a000-000000000037', 'Kastamonu', 'kastamonu', 'city'),
  ('30000000-0000-4000-a000-000000000038', 'Kayseri', 'kayseri', 'city'),
  ('30000000-0000-4000-a000-000000000039', 'Kırklareli', 'kirklareli', 'city'),
  ('30000000-0000-4000-a000-000000000040', 'Kırşehir', 'kirsehir', 'city'),
  ('30000000-0000-4000-a000-000000000041', 'Kocaeli', 'kocaeli', 'city'),
  ('30000000-0000-4000-a000-000000000042', 'Konya', 'konya', 'city'),
  ('30000000-0000-4000-a000-000000000043', 'Kütahya', 'kutahya', 'city'),
  ('30000000-0000-4000-a000-000000000044', 'Malatya', 'malatya', 'city'),
  ('30000000-0000-4000-a000-000000000045', 'Manisa', 'manisa', 'city'),
  ('30000000-0000-4000-a000-000000000046', 'Kahramanmaraş', 'kahramanmaras', 'city'),
  ('30000000-0000-4000-a000-000000000047', 'Mardin', 'mardin', 'city'),
  ('30000000-0000-4000-a000-000000000048', 'Muğla', 'mugla', 'city'),
  ('30000000-0000-4000-a000-000000000049', 'Muş', 'mus', 'city'),
  ('30000000-0000-4000-a000-000000000050', 'Nevşehir', 'nevsehir', 'city'),
  ('30000000-0000-4000-a000-000000000051', 'Niğde', 'nigde', 'city'),
  ('30000000-0000-4000-a000-000000000052', 'Ordu', 'ordu', 'city'),
  ('30000000-0000-4000-a000-000000000053', 'Rize', 'rize', 'city'),
  ('30000000-0000-4000-a000-000000000054', 'Sakarya', 'sakarya', 'city'),
  ('30000000-0000-4000-a000-000000000055', 'Samsun', 'samsun', 'city'),
  ('30000000-0000-4000-a000-000000000056', 'Siirt', 'siirt', 'city'),
  ('30000000-0000-4000-a000-000000000057', 'Sinop', 'sinop', 'city'),
  ('30000000-0000-4000-a000-000000000058', 'Sivas', 'sivas', 'city'),
  ('30000000-0000-4000-a000-000000000059', 'Tekirdağ', 'tekirdag', 'city'),
  ('30000000-0000-4000-a000-000000000060', 'Tokat', 'tokat', 'city'),
  ('30000000-0000-4000-a000-000000000061', 'Trabzon', 'trabzon', 'city'),
  ('30000000-0000-4000-a000-000000000062', 'Tunceli', 'tunceli', 'city'),
  ('30000000-0000-4000-a000-000000000063', 'Şanlıurfa', 'sanliurfa', 'city'),
  ('30000000-0000-4000-a000-000000000064', 'Uşak', 'usak', 'city'),
  ('30000000-0000-4000-a000-000000000065', 'Van', 'van', 'city'),
  ('30000000-0000-4000-a000-000000000066', 'Yozgat', 'yozgat', 'city'),
  ('30000000-0000-4000-a000-000000000067', 'Zonguldak', 'zonguldak', 'city'),
  ('30000000-0000-4000-a000-000000000068', 'Aksaray', 'aksaray', 'city'),
  ('30000000-0000-4000-a000-000000000069', 'Bayburt', 'bayburt', 'city'),
  ('30000000-0000-4000-a000-000000000070', 'Karaman', 'karaman', 'city'),
  ('30000000-0000-4000-a000-000000000071', 'Kırıkkale', 'kirikkale', 'city'),
  ('30000000-0000-4000-a000-000000000072', 'Batman', 'batman', 'city'),
  ('30000000-0000-4000-a000-000000000073', 'Şırnak', 'sirnak', 'city'),
  ('30000000-0000-4000-a000-000000000074', 'Bartın', 'bartin', 'city'),
  ('30000000-0000-4000-a000-000000000075', 'Ardahan', 'ardahan', 'city'),
  ('30000000-0000-4000-a000-000000000076', 'Iğdır', 'igdir', 'city'),
  ('30000000-0000-4000-a000-000000000077', 'Yalova', 'yalova', 'city'),
  ('30000000-0000-4000-a000-000000000078', 'Karabük', 'karabuk', 'city'),
  ('30000000-0000-4000-a000-000000000079', 'Kilis', 'kilis', 'city'),
  ('30000000-0000-4000-a000-000000000080', 'Osmaniye', 'osmaniye', 'city'),
  ('30000000-0000-4000-a000-000000000081', 'Düzce', 'duzce', 'city')
on conflict do nothing;

insert into public.locations (id, parent_id, name, slug, type) values
  ('31000000-0000-4000-a000-000000000001', '30000000-0000-4000-a000-000000000034', 'Kadıköy', 'kadikoy', 'district'),
  ('31000000-0000-4000-a000-000000000002', '30000000-0000-4000-a000-000000000034', 'Beşiktaş', 'besiktas', 'district'),
  ('31000000-0000-4000-a000-000000000003', '30000000-0000-4000-a000-000000000034', 'Şişli', 'sisli', 'district'),
  ('31000000-0000-4000-a000-000000000004', '30000000-0000-4000-a000-000000000034', 'Üsküdar', 'uskudar', 'district'),
  ('31000000-0000-4000-a000-000000000005', '30000000-0000-4000-a000-000000000034', 'Bakırköy', 'bakirkoy', 'district'),
  ('31000000-0000-4000-a000-000000000006', '30000000-0000-4000-a000-000000000034', 'Ümraniye', 'umraniye', 'district'),
  ('31000000-0000-4000-a000-000000000007', '30000000-0000-4000-a000-000000000006', 'Çankaya', 'cankaya', 'district'),
  ('31000000-0000-4000-a000-000000000008', '30000000-0000-4000-a000-000000000006', 'Keçiören', 'kecioren', 'district'),
  ('31000000-0000-4000-a000-000000000009', '30000000-0000-4000-a000-000000000006', 'Yenimahalle', 'yenimahalle', 'district'),
  ('31000000-0000-4000-a000-000000000010', '30000000-0000-4000-a000-000000000035', 'Konak', 'konak', 'district'),
  ('31000000-0000-4000-a000-000000000011', '30000000-0000-4000-a000-000000000035', 'Bornova', 'bornova', 'district'),
  ('31000000-0000-4000-a000-000000000012', '30000000-0000-4000-a000-000000000035', 'Karşıyaka', 'karsiyaka', 'district')
on conflict do nothing;

insert into public.categories (
  id, kind, name, slug, h1, meta_title, meta_description, content, faq, is_featured, sort_order
) values
(
  '10000000-0000-4000-a000-000000000001', 'service', 'Ev Temizliği', 'ev-temizligi',
  'Ev temizliği hizmeti alın, ustalar teklif versin',
  'Ev Temizliği | iLazım ile Teklif Toplayın',
  'Ev temizliği ilanı açın. Onaylı temizlikçiler sabit teklif ücretiyle size fiyat versin. Puanları karşılaştırın, işi bitirin.',
  'iLazım üzerinden ev temizliği talebi oluşturduğunuzda bölgenizdeki onaylı hizmet verenler size teklif gönderir. Saatlik, günlük veya inşaat sonrası temizlik fark etmez; ilanınız açık kaldığı sürece teklifler gelir. Kazananı siz seçersiniz, iş tamamlanınca hizmet vereni puanlarsınız.',
  '[{"q":"Ev temizliği ilanı nasıl açılır?","a":"Kategori seçin, evinizin konumunu ve ihtiyacınızı yazın. Temizlikçiler size teklif iletir."},{"q":"Teklif ücreti nedir?","a":"Alıcı için ücretsizdir. Hizmet verenler her teklifte sabit bir platform ücreti öder."}]'::jsonb,
  true, 1
),
(
  '10000000-0000-4000-a000-000000000002', 'service', 'Tadilat', 'tadilat',
  'Tadilat ustası bulun, karşılaştırmalı teklif alın',
  'Tadilat Ustası | Boya, Mutfak, Banyo | iLazım',
  'Boya badana, mutfak ve banyo tadilatı için ilan açın. Onaylı ustalar teklif versin, puanlarına bakarak seçin.',
  'Tadilat işlerinde fiyat şeffaflığı iLazım ile başlar. İlanınıza gelen tekliflerde ustanın geçmiş iş puanını görür, mesajlaşır ve işi tamamladığınızda yorum bırakırsınız.',
  '[{"q":"Tadilat için keşif gerekir mi?","a":"Usta teklifinde keşif notu bırakabilir. Detayı sohbetten netleştirirsiniz."},{"q":"Malzeme kime ait?","a":"İlan açıklamasında belirtin; teklifler buna göre gelir."}]'::jsonb,
  true, 2
),
(
  '10000000-0000-4000-a000-000000000003', 'service', 'Nakliyat', 'nakliyat',
  'Evden eve nakliyat teklifi alın',
  'Nakliyat ve Taşıma Teklifi | iLazım',
  'Şehir içi veya şehirler arası nakliyat ilanı açın. Taşımacılar sabit ücretle teklif versin, puanlarına göre seçin.',
  'Eşya hacmi, kat, asansör ve mesafe bilgilerini ilana yazın. Nakliyeciler size net teklif iletir. Kabul ettiğiniz taşıyıcıyı iş bitince puanlarsınız.',
  '[{"q":"Şehirler arası taşıma var mı?","a":"Evet. Kalkış ve varış şehirlerini ilanda belirtin."},{"q":"Ambalaj dahil mi?","a":"Teklif mesajında paketleme dahil/hariç yazılır."}]'::jsonb,
  true, 3
),
(
  '10000000-0000-4000-a000-000000000004', 'service', 'Özel Ders', 'ozel-ders',
  'Özel ders öğretmeni bulun',
  'Özel Ders İlanı | Matematik, Dil, Sınav | iLazım',
  'Özel ders ilanı açın. Öğretmenler size teklif versin. Puanlı profilleri karşılaştırın.',
  'Ders konusu, seviye ve haftalık sıklığı yazın. Öğretmenler saatlik ücret teklifi gönderir. İlk üyeler için satıcı tarafında indirimli teklif kredisi tanımlanabilir.',
  '[{"q":"Online ders olur mu?","a":"İlanda online veya yüz yüze tercihini belirtin."},{"q":"Deneme dersi?","a":"Teklif mesajında deneme koşulları konuşulur."}]'::jsonb,
  true, 4
),
(
  '10000000-0000-4000-a000-000000000005', 'service', 'Tamirat', 'tamirat',
  'Kombi, elektrik, tesisat tamiri için usta çağırın',
  'Tamirat Ustası | Kombi Elektrik Tesisat | iLazım',
  'Arızayı tarif eden bir ilan açın. Onaylı tamirciler teklif versin, yıldızlı puanlarını görün.',
  'Acil arızalarda net fotoğraf ve marka bilgisi teklif kalitesini artırır. Usta seçimi size aittir; iLazım yalnızca sabit teklif ücreti alır.',
  '[{"q":"Acil servis var mı?","a":"İlan başlığına acil yazın; uygun ustalar hızlı teklifler."},{"q":"Yedek parça?","a":"Parça bedeli teklifte ayrı kalem olarak belirtilmelidir."}]'::jsonb,
  true, 5
),
(
  '10000000-0000-4000-a000-000000000006', 'service', 'Organizasyon', 'organizasyon',
  'Düğün, nişan ve etkinlik organizasyonu',
  'Organizasyon Hizmeti | Düğün Nişan | iLazım',
  'Etkinlik tarihi ve konseptini yazın. Organizatörler teklif versin, geçmiş puanlarına bakın.',
  'Misafir sayısı, mekan ve tarih netleştikçe teklifler daha isabetli olur. İş bitiminde organizatörü puanlarsınız.',
  '[{"q":"Mekan dahil mi?","a":"İlanda belirtin; bazı organizatörler mekan önerir."}]'::jsonb,
  false, 6
),
(
  '10000000-0000-4000-a000-000000000007', 'service', 'Güzellik', 'guzellik',
  'Kuaför, cilt bakımı ve güzellik hizmeti',
  'Güzellik Hizmeti Teklifi | iLazım',
  'İhtiyacınızı yazın, güzellik uzmanları teklif göndersin. Yalnızca hizmet verenler puanlanır.',
  'Saç, cilt, kalıcı makyaj gibi işlerde referans fotoğraf teklifi netleştirir. Randevu sohbetten kilitlenir.',
  '[{"q":"Evde hizmet olur mu?","a":"İlanda evde/salonda tercihini yazın."}]'::jsonb,
  false, 7
),
(
  '10000000-0000-4000-a000-000000000008', 'service', 'Evcil Hayvan', 'evcil-hayvan',
  'Pet bakımı, kuaför ve gezdirme',
  'Evcil Hayvan Bakımı | iLazım',
  'Pet bakımı ilanı açın. Bakıcılar teklif versin, puanlı profilleri görün.',
  'Hayvan türü, süre ve evde/pansiyon tercihi ilanda yer almalı. Tamamlanan iş sonrası bakıcı puanlanır.',
  '[{"q":"Geçici barınma?","a":"Tarih aralığını yazın, pansiyon teklifleri gelir."}]'::jsonb,
  false, 8
),
(
  '20000000-0000-4000-a000-000000000001', 'product', 'Bisiklet', 'bisiklet',
  'Bisiklet arıyorum ilanı açın, satıcılar teklif versin',
  'Bisiklet İlanı | İkinci El ve Sıfır Teklif | iLazım',
  'Aradığınız bisikleti tarif edin. Elinde olan satıcılar size fiyat ve fotoğrafla teklif versin.',
  'Aradığınız bisikleti tarif edin. Elinde olan satıcılar size fiyat ve fotoğrafla teklif versin. Alıcılar satıcının yıldızlarını görür; satıcılar her teklifte sabit bir platform ücreti öder.',
  '[{"q":"Neden ilan açıyorum, klasik ilan sitesi değil mi?","a":"Siz talep yayınlarsınız; ürünü olan size gelir. Tersine pazar yeri."},{"q":"Kargo kimde?","a":"Teklif mesajında teslimat yöntemi belirtilir."}]'::jsonb,
  true, 1
),
(
  '20000000-0000-4000-a000-000000000002', 'product', 'Elektronik', 'elektronik',
  'Telefon, laptop ve elektronik ürün talebi',
  'Elektronik Ürün Arıyorum | iLazım Teklif',
  'Aradığınız cihazı yazın. Satıcılar teklif ve fotoğraf göndersin. Puanlı satıcıları seçin.',
  'Model, bellek, kutu/fatura durumunu belirtin. Satıcılar elindeki ürünle teklif verir; kabul sonrası sohbetten teslimat netleşir.',
  '[{"q":"Sıfır ürün olur mu?","a":"Evet. İlanda sıfır/ikinci el tercihinizi yazın."}]'::jsonb,
  true, 2
),
(
  '20000000-0000-4000-a000-000000000003', 'product', 'Mobilya', 'mobilya',
  'Mobilya arıyorum, satıcılar teklif etsin',
  'Mobilya Talebi | Koltuk Masa Dolap | iLazım',
  'Ölçü ve tarzı yazın. Mobilya satıcıları size teklif göndersin.',
  'Nakliye dahil olup olmadığını teklifte sorun. İş tamamlanınca satıcıyı puanlarsınız.',
  '[{"q":"Montaj dahil mi?","a":"Teklif açıklamasında montaj kalemi ayrı yazılabilir."}]'::jsonb,
  true, 3
),
(
  '20000000-0000-4000-a000-000000000004', 'product', 'Bebek Ürünleri', 'bebek-urunleri',
  'Bebek arabası, park yatak ve bebek ürünü talebi',
  'Bebek Ürünleri Arıyorum | iLazım',
  'İhtiyacınız olan bebek ürününü tarif edin. Satıcılar teklif versin.',
  'Güvenlik ve hijyen notlarını ilanda isteyin. Satıcı puanları seçiminizi kolaylaştırır.',
  '[{"q":"Kullanılmış ürün?","a":"Durumunu (az kullanılmış, kutulu) ilanda belirtin."}]'::jsonb,
  false, 4
),
(
  '20000000-0000-4000-a000-000000000005', 'product', 'Spor', 'spor',
  'Spor aleti ve ekipman talebi',
  'Spor Ekipmanı Arıyorum | iLazım',
  'Koşu bandı, ağırlık, bisiklet dışı spor ürünleri için ilan açın; satıcılar teklif etsin.',
  'Marka ve ölçü netliği teklif kalitesini artırır.',
  '[{"q":"Teslimat?","a":"Elden veya kargo seçenekleri teklifte yazılır."}]'::jsonb,
  true, 5
),
(
  '20000000-0000-4000-a000-000000000006', 'product', 'Motosiklet', 'motosiklet',
  'Motosiklet arıyorum ilanı',
  'Motosiklet Talebi | iLazım',
  'CC, vites tipi ve bütçeyi yazın. Satıcılar size teklif ve fotoğraf göndersin.',
  'Ruhsat ve ekspertiz notunu teklifte isteyin. Satıcı iş bitiminde puanlanır.',
  '[{"q":"Tramer?","a":"Teklif sürecinde belgeler sohbetten paylaşılır."}]'::jsonb,
  false, 6
),
(
  '20000000-0000-4000-a000-000000000007', 'product', 'Ev Eşyası', 'ev-esyasi',
  'Beyaz eşya ve ev ürünü talebi',
  'Ev Eşyası Arıyorum | iLazım',
  'Buzdolabı, çamaşır makinesi ve küçük ev aletleri için talep açın.',
  'Enerji sınıfı ve ölçü bilgisi teklifleri netleştirir.',
  '[{"q":"Kurulum?","a":"Teklifte kurulum dahil/hariç belirtilir."}]'::jsonb,
  false, 7
),
(
  '20000000-0000-4000-a000-000000000008', 'product', 'Bahçe', 'bahce',
  'Bahçe aleti ve dış mekan ürün talebi',
  'Bahçe Ürünleri Arıyorum | iLazım',
  'Çim biçme, sulama ve bahçe mobilyası talepleriniz için satıcılardan teklif alın.',
  'Sezonluk ürünlerde teslim tarihi teklifte yazılmalıdır.',
  '[{"q":"İkinci el?","a":"İlanda belirtin, satıcılar durum fotoğrafı ekler."}]'::jsonb,
  false, 8
)
on conflict do nothing;

insert into public.promo_campaigns (
  id, name, credit_amount, bid_fee_discount_percent, discounted_offer_count,
  max_redemptions, apply_on, is_active
) values (
  '40000000-0000-4000-a000-000000000001',
  'İlk 100 satıcı',
  50,
  50,
  10,
  100,
  'seller_approval',
  true
) on conflict do nothing;

# App Solution Limited — ওয়েবসাইট সেটআপ গাইড

এই ফোল্ডারে পুরো ওয়েবসাইট আছে: ক্লায়েন্টদের জন্য সাইট + `admin/` ফোল্ডারে অ্যাডমিন প্যানেল।
সব ডেটা আপনার Firebase project **app-solution-limited**-এ থাকবে। কোনো সার্ভার বা পেইড প্ল্যান লাগবে না।

---

## ধাপ ১ — Firestore Database চালু করুন

1. https://console.firebase.google.com → **app-solution-limited** project খুলুন
2. বাঁদিকে **Build → Firestore Database → Create database**
3. **Production mode** বাছুন, লোকেশন **asia-south1 (Mumbai)** বা কাছের কোনোটা → **Enable**

## ধাপ ২ — Security Rules বসান

1. Firestore Database → উপরে **Rules** ট্যাব
2. সেখানে যা লেখা আছে সব মুছে দিন
3. এই ফোল্ডারের **`firestore.rules`** ফাইল খুলে পুরোটা কপি করে পেস্ট করুন
4. **Publish** চাপুন

## ধাপ ৩ — Authentication চালু করুন

1. **Build → Authentication → Get started**
2. **Sign-in method** ট্যাবে দুটো চালু করুন:
   - **Anonymous** → Enable → Save (ক্লায়েন্টরা অ্যাকাউন্ট ছাড়াই অর্ডার করতে পারবে)
   - **Email/Password** → Enable → Save (শুধু আপনার অ্যাডমিন লগইনের জন্য)
3. **Users** ট্যাব → **Add user** → আপনার ইমেইল ও একটা শক্ত পাসওয়ার্ড দিন। এটাই আপনার অ্যাডমিন লগইন।

## ধাপ ৪ — GitHub-এ আপলোড

1. GitHub-এ নতুন **public** repository বানান (যেমন `app-solution`)
2. **Add file → Upload files** → এই ফোল্ডারের **ভেতরের সব ফাইল ও ফোল্ডার** টেনে আনুন
   (`index.html` যেন repository-র একদম প্রথম লেভেলে থাকে, কোনো সাব-ফোল্ডারে নয়)
3. **Commit changes**
4. Repository → **Settings → Pages** → Source: **Deploy from a branch** → Branch: **main**, ফোল্ডার **/ (root)** → **Save**
5. ১–২ মিনিট পর লিংক পাবেন: `https://আপনার-ইউজারনেম.github.io/app-solution/`

## ধাপ ৫ — GitHub ডোমেইন Firebase-এ যোগ করুন

Firebase → **Authentication → Settings → Authorized domains → Add domain** →
`আপনার-ইউজারনেম.github.io` লিখে Add করুন।

## ধাপ ৬ — নিজেকে অ্যাডমিন বানান

1. ব্রাউজারে খুলুন: `https://আপনার-ইউজারনেম.github.io/app-solution/admin/`
2. ধাপ ৩-এর ইমেইল-পাসওয়ার্ড দিয়ে লগইন করুন
3. স্ক্রিনে লেখা আসবে **"This account is not an admin yet"** আর একটা লম্বা **UID** — **Copy** চাপুন
4. Firebase → **Firestore Database → Data → Start collection**
   - Collection ID: `admins` → Next
   - Document ID: কপি করা **UID** পেস্ট করুন
   - Field: `email`, Type: string, Value: আপনার ইমেইল → **Save**
5. অ্যাডমিন পেজে ফিরে **Reload** চাপুন — ড্যাশবোর্ড খুলে যাবে

## ধাপ ৭ — কনটেন্ট ভরুন

1. ড্যাশবোর্ডে **Load starter content** চাপুন — App types, Features, Packages, FAQ আর ৬টি পেমেন্ট মেথড তৈরি হবে
2. **Payment methods** → প্রতিটায় ক্লিক করে:
   - **Wallet address**-এ আপনার আসল ঠিকানা পেস্ট করুন (দুবার মিলিয়ে নিন!)
   - **Show on website** টিক দিন → Save
   - যেটা ব্যবহার করবেন না সেটা বন্ধ রাখুন বা Delete করুন
3. **Settings & profile** → আপনার নাম, শহর, অভিজ্ঞতা, ইমেইল, WhatsApp, Facebook, Play Store লিংক → **Save settings**
4. **Portfolio** → আপনার Play Store-এর অ্যাপগুলো যোগ করুন (স্ক্রিনশটের জন্য Play Store-এর ছবির লিংক ব্যবহার করতে পারেন)
5. **Reviews** → শুধু ক্লায়েন্টদের আসল রিভিউ দিন

## ধাপ ৮ — Play Console-এ লিংক দিন

Play Console → Developer profile → **Developer website** → আপনার GitHub Pages লিংক → Save।
Facebook প্রোফাইল/পেজের Website ঘরেও একই লিংক দিন।

---

## অর্ডার কীভাবে চলবে

1. ক্লায়েন্ট অর্ডার করে → স্ট্যাটাস **Awaiting payment**
2. ক্রিপ্টো/PayPal-এ পাঠিয়ে TxID দেয় → **Payment submitted** (অ্যাডমিন মেনুতে কমলা সংখ্যা দেখাবে)
3. আপনি অর্ডার খুলে **Check on blockchain explorer** চাপুন → পরিমাণ, ঠিকানা, নেটওয়ার্ক মিলিয়ে দেখুন
4. ঠিক থাকলে **✓ Verify payment** → ক্লায়েন্টের পেজ সবুজ হয়ে যায়
5. না মিললে Status **Payment not found** করে কারণ লিখুন → ক্লায়েন্ট আবার জমা দিতে পারবে
6. কাজ এগোলে Status বদলান: In design → In development → Testing → Delivered
   - Design preview, Test APK, Google Play লিংক বসালে ক্লায়েন্টের ট্র্যাকিং পেজে বাটন হয়ে দেখাবে

## জরুরি নিরাপত্তা তথ্য

- **API key জাভাস্ক্রিপ্টে দেখা যাবে — এটা স্বাভাবিক।** Firebase এভাবেই কাজ করে। আসল সুরক্ষা আসে Security Rules থেকে।
- **দাম ক্লায়েন্টের ব্রাউজারে হিসাব হয়।** কেউ চাইলে দাম কারসাজি করে কম দেখাতে পারে — তাই Verify করার আগে সবসময় অর্ডারের ফিচার ও মোট দাম আপনার দামের সাথে মিলিয়ে নিন।
- **ট্র্যাকিং লিংক গোপন চাবির মতো।** লিংক যার কাছে আছে সে ঐ অর্ডার দেখতে পারবে। ক্লায়েন্টকে প্রকাশ্যে শেয়ার না করতে বলুন।
- **ফাইল আপলোড নেই** — ফ্রি Spark প্ল্যানে Cloud Storage আর নেই, তাই লোগো/স্ক্রিনশট লিংক হিসেবে নেওয়া হয়।
- অ্যাডমিন হতে পারবে শুধু তারাই যাদের UID `admins` কালেকশনে আছে। অন্য কেউ সাইন-আপ করলেও কিছু বদলাতে পারবে না।

## ফাইলগুলো কী

| ফাইল | কাজ |
|---|---|
| `index.html` | হোম পেজ (3D অ্যানিমেশন) |
| `about.html` | আপনার পরিচয় ও অভিজ্ঞতা |
| `portfolio.html`, `case.html` | অ্যাপের তালিকা ও প্রতিটার বিস্তারিত |
| `pricing.html` | প্যাকেজ ও দাম |
| `order.html` | ৪ ধাপের অর্ডার ফর্ম |
| `pay.html` | Advance পেমেন্ট (ক্রিপ্টো + লিংক) |
| `track.html` | অর্ডার ট্র্যাকিং |
| `contact.html` | যোগাযোগ ফর্ম ও FAQ |
| `privacy.html`, `terms.html` | নীতিমালা |
| `admin/` | অ্যাডমিন প্যানেল |
| `firestore.rules` | Firebase-এ পেস্ট করার Security Rules |
| `assets/js/firebase.js` | Firebase config (আপনারটা বসানো আছে) |

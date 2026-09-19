import { RiderCard, BikeCard, EventCard, HazardCard, ActionCard } from '../types';

// ==========================================
// 1. KARTU RIDER (3 Jenis: CLIMBER, SPRINTER, HANDLER)
// ==========================================
export const RIDERS_POOL: RiderCard[] = [
  // --- CLIMBER (Spesialis Tanjakan) ---
  {
    id: 'R-01',
    type: 'RIDER',
    name: 'Dimas "Tanjakan" Prasetyo',
    nickname: 'Puncak King of Mountain',
    specialty: 'CLIMBER',
    basePower: 2,
    favoredTerrain: ['TANJAKAN'],
    terrainBonus: 3,
    abilityName: 'High Cadence Mash',
    abilityDescription: '+3 Point pada Event bertipe TANJAKAN.',
    quote: 'Gravitasi cuma sekadar saran di atas aspal menanjak.',
    avatarIcon: 'Mountain',
    colorTheme: 'from-emerald-500 to-teal-700'
  },
  {
    id: 'R-02',
    type: 'RIDER',
    name: 'Fikri "Eagle Goat" Setiawan',
    nickname: 'The Lightweight Puncheur',
    specialty: 'CLIMBER',
    basePower: 2,
    favoredTerrain: ['TANJAKAN'],
    terrainBonus: 3,
    abilityName: 'Gradient Attack Surge',
    abilityDescription: '+3 Point di TANJAKAN & Base Power 2.',
    quote: 'Semakin curam tanjakan, semakin kencang tarikan pedal.',
    avatarIcon: 'Mountain',
    colorTheme: 'from-green-600 to-emerald-800'
  },
  {
    id: 'R-03',
    type: 'RIDER',
    name: 'Kenji "Kamikaze" Sato',
    nickname: 'Redline Climber',
    specialty: 'CLIMBER',
    basePower: 3,
    favoredTerrain: ['TANJAKAN'],
    terrainBonus: 2,
    abilityName: 'All-Out Elevation',
    abilityDescription: '+2 Point di TANJAKAN dengan Base Power tinggi (3).',
    quote: 'Otot paha terbakar adalah tanda kemenangan sudah dekat.',
    avatarIcon: 'Mountain',
    colorTheme: 'from-teal-600 to-cyan-900'
  },

  // --- SPRINTER (Spesialis Datar) ---
  {
    id: 'R-04',
    type: 'RIDER',
    name: 'Budi "Rocket" Santoso',
    nickname: 'The Velodrome Bullet',
    specialty: 'SPRINTER',
    basePower: 2,
    favoredTerrain: ['DATAR'],
    terrainBonus: 3,
    abilityName: 'Burst Acceleration',
    abilityDescription: '+3 Point pada Event bertipe DATAR.',
    quote: 'Gak ada rem, gak ada ragu saat gigi berat sudah berputar!',
    avatarIcon: 'Zap',
    colorTheme: 'from-amber-500 to-red-600'
  },
  {
    id: 'R-05',
    type: 'RIDER',
    name: 'Sarah "Iron Lung" Wijaya',
    nickname: 'The Solo Breakaway',
    specialty: 'SPRINTER',
    basePower: 3,
    favoredTerrain: ['DATAR'],
    terrainBonus: 2,
    abilityName: 'Endless Wattage',
    abilityDescription: '+2 Point di DATAR & Base Power 3.',
    quote: 'Jalan lurus adalah panggung untuk memecah batas kecepatan.',
    avatarIcon: 'Zap',
    colorTheme: 'from-orange-500 to-red-700'
  },
  {
    id: 'R-06',
    type: 'RIDER',
    name: 'Aldo "Watt Cannon" Pratama',
    nickname: '53T Heavy Masher',
    specialty: 'SPRINTER',
    basePower: 2,
    favoredTerrain: ['DATAR'],
    terrainBonus: 3,
    abilityName: 'Top Speed Lock',
    abilityDescription: '+3 Point di DATAR ketika melaju dengan rasio gigi berat.',
    quote: 'Kecepatan 50 km/jam cuma titik awal sprint.',
    avatarIcon: 'Zap',
    colorTheme: 'from-yellow-500 to-amber-700'
  },

  // --- HANDLER (Spesialis Tikungan) ---
  {
    id: 'R-07',
    type: 'RIDER',
    name: 'Reza "Skid King" Pratama',
    nickname: 'Apex Drift Maestro',
    specialty: 'HANDLER',
    basePower: 2,
    favoredTerrain: ['TIKUNGAN'],
    terrainBonus: 3,
    abilityName: 'Long Skid Mastery',
    abilityDescription: '+3 Point pada Event bertipe TIKUNGAN & S-Bend.',
    quote: 'Ban botak dan skid panjang itu tanda seni belok murni.',
    avatarIcon: 'Compass',
    colorTheme: 'from-blue-500 to-indigo-700'
  },
  {
    id: 'R-08',
    type: 'RIDER',
    name: 'Aris "Kurir Kilat" Ginting',
    nickname: 'The Alleycat Ghost',
    specialty: 'HANDLER',
    basePower: 2,
    favoredTerrain: ['TIKUNGAN'],
    terrainBonus: 3,
    abilityName: 'Chicane Weave',
    abilityDescription: '+3 Point di TIKUNGAN & reflek tajam melewati rintangan.',
    quote: 'Labirin gang kota adalah sirkuit tercepat bagiku.',
    avatarIcon: 'Compass',
    colorTheme: 'from-cyan-500 to-blue-800'
  },
  {
    id: 'R-09',
    type: 'RIDER',
    name: 'Nadia "Crit Queen" Putri',
    nickname: 'Red Hook Champion',
    specialty: 'HANDLER',
    basePower: 3,
    favoredTerrain: ['TIKUNGAN'],
    terrainBonus: 2,
    abilityName: 'Hairpin Precision',
    abilityDescription: '+2 Point di TIKUNGAN dengan Base Power 3.',
    quote: 'Potong sudut apex sedekat mungkin dengan trotoar!',
    avatarIcon: 'Compass',
    colorTheme: 'from-purple-500 to-indigo-900'
  }
];

// ==========================================
// 2. KARTU BIKE (3 Info: Komponen, 4 Performance, Ability)
// ==========================================
export const BIKES_POOL: BikeCard[] = [
  {
    id: 'B-01',
    type: 'BUILD_BIKE',
    name: 'Aero Pursuit Machine',
    components: {
      frameset: 'Aero Carbon Monocoque 7005',
      gearRatio: '49T × 14T (3.50 Heavy)',
      wheelset: 'Deep Dish Carbon 88mm',
      handlebar: 'Deda Pista Carbon Dropbar'
    },
    performance: {
      tanjakan: 2,
      datar: 5,
      tikungan: 3,
      turunan: 4
    },
    abilityName: 'Sprint Boost Ability',
    abilityDescription: 'Bonus +1 Point jika pemain mengaktifkan Kartu Skill / Aksi Sprint.',
    abilityEffect: {
      skillPointBonus: 1
    },
    riderSynergy: 'SPRINTER',
    colorTheme: 'from-slate-800 to-cyan-900'
  },
  {
    id: 'B-02',
    type: 'BUILD_BIKE',
    name: 'Featherweight Hill Masher',
    components: {
      frameset: 'Ultra-Lightweight Titanium Tubing',
      gearRatio: '47T × 17T (2.76 Spin)',
      wheelset: 'Mavic Open Pro Alloy 24H',
      handlebar: 'Nitto B201 Compact Riser'
    },
    performance: {
      tanjakan: 5,
      datar: 3,
      tikungan: 3,
      turunan: 2
    },
    abilityName: 'Climber Synergy Surge',
    abilityDescription: 'Bonus +2 Point jika Rider adalah CLIMBER pada Event TANJAKAN.',
    abilityEffect: {
      riderSynergyBonus: 2
    },
    riderSynergy: 'CLIMBER',
    colorTheme: 'from-emerald-900 to-teal-950'
  },
  {
    id: 'B-03',
    type: 'BUILD_BIKE',
    name: 'Crit Geometry Ripper',
    components: {
      frameset: 'Columbus Airplane Triple-Butted Alloy',
      gearRatio: '48T × 15T (3.20 Agile)',
      wheelset: 'H Plus Son Archetype 32H',
      handlebar: 'Cinelli Mash Wide Riser 700mm'
    },
    performance: {
      tanjakan: 2,
      datar: 3,
      tikungan: 5,
      turunan: 3
    },
    abilityName: 'Apex Skid Whip',
    abilityDescription: 'Bonus +1 Point saat skill Skid diaktifkan & abaikan rintangan tikungan.',
    abilityEffect: {
      skillPointBonus: 1,
      ignoreRoadHazard: true
    },
    riderSynergy: 'HANDLER',
    colorTheme: 'from-indigo-900 to-purple-900'
  },
  {
    id: 'B-04',
    type: 'BUILD_BIKE',
    name: 'Downhill Gravity Bomber',
    components: {
      frameset: 'Double-Butted 4130 CroMoly Steel',
      gearRatio: '50T × 14T (3.57 Super-Speed)',
      wheelset: 'Mavic Ellipse Track Aero Alloy',
      handlebar: 'Cinelli Bullhorn Aerobar'
    },
    performance: {
      tanjakan: 1,
      datar: 4,
      tikungan: 3,
      turunan: 5
    },
    abilityName: 'Gravity Descent Boost',
    abilityDescription: 'Bonus +2 Point jika Event bertipe TURUNAN.',
    abilityEffect: {
      turunanBonus: 2
    },
    riderSynergy: 'SPRINTER',
    colorTheme: 'from-stone-800 to-amber-950'
  },
  {
    id: 'B-05',
    type: 'BUILD_BIKE',
    name: 'Steel Alleycat Workhorse',
    components: {
      frameset: 'Double-Butted Kaisei CroMoly Tubing',
      gearRatio: '48T × 16T (3.00 Golden Ratio)',
      wheelset: 'Velocity Deep V Track 36H',
      handlebar: 'Nitto For Shred Riser 680mm'
    },
    performance: {
      tanjakan: 3,
      datar: 4,
      tikungan: 4,
      turunan: 3
    },
    abilityName: 'Pothole & Hazard Shield',
    abilityDescription: 'Kebal terhadap penalti Extra Event (Jalan Rusak / Pohon Tumbang).',
    abilityEffect: {
      ignoreRoadHazard: true
    },
    riderSynergy: 'HANDLER',
    colorTheme: 'from-zinc-800 to-neutral-950'
  },
  {
    id: 'B-06',
    type: 'BUILD_BIKE',
    name: 'Velodrome Keirin Classic',
    components: {
      frameset: 'NJS Steel Lugged Hand-Crafted Frame',
      gearRatio: '51T × 15T (3.40 Pure Sprint)',
      wheelset: 'Araya Gold NJS Tubular 36H',
      handlebar: 'Nitto B123 CrMo Track Drop'
    },
    performance: {
      tanjakan: 3,
      datar: 5,
      tikungan: 3,
      turunan: 4
    },
    abilityName: 'Energy Item Discount',
    abilityDescription: 'Diskon 1 Energy ⚡ saat pemain mengaktifkan Kartu Item.',
    abilityEffect: {
      itemEnergyDiscount: 1
    },
    riderSynergy: 'SPRINTER',
    colorTheme: 'from-amber-900 to-red-950'
  }
];

// ==========================================
// 3. KARTU EVENT (4 Jenis: TANJAKAN, DATAR, TIKUNGAN, TURUNAN) - 33 Kartu
// ==========================================
export const EVENTS_33_DECK: EventCard[] = [
  // --- 1-9 DATAR (Flat / Straight Roads) ---
  {
    id: 'EV-01',
    code: 'E-001',
    type: 'EVENT',
    title: 'Jalan Lurus Sudirman',
    location: 'Central Avenue Jakarta',
    category: 'DATAR',
    description: 'Aspal mulus 4 jalur tanpa hambatan, menguji kecepatan konstan dan cadence tinggi.',
    flavor: 'Gigi berat mulai bekerja memecah hembusan angin kota.'
  },
  {
    id: 'EV-02',
    code: 'E-002',
    type: 'EVENT',
    title: 'Waterfront Boulevard',
    location: 'Pesisir Pantai Ancol',
    category: 'DATAR',
    description: 'Track datar tepi laut dengan pemandangan terbuka dan aspal rata sempurna.',
    flavor: 'Kombinasi kecepatan dan ritme kayuhan tanpa jeda.'
  },
  {
    id: 'EV-03',
    code: 'E-003',
    type: 'EVENT',
    title: 'Highway Fastway Strip',
    location: 'Toll Road Bypass',
    category: 'DATAR',
    description: 'Trek lurus ekstra panjang, surga bagi pembalap fixed gear bergigi berat.',
    flavor: 'Kecepatan tembus 50 km/jam dalam hitungan detik.'
  },
  {
    id: 'EV-04',
    code: 'E-004',
    type: 'EVENT',
    title: 'Monas Loop Speedway',
    location: 'Monas Outer Ring',
    category: 'DATAR',
    description: 'Lintasan lurus pusat perkotaan dengan aspal hotmix tebal berkualitas tinggi.',
    flavor: 'Roda belakang berdengung kencang di tengah hiruk pikuk kota.'
  },
  {
    id: 'EV-05',
    code: 'E-005',
    type: 'EVENT',
    title: 'Velodrome Rawamangun Straight',
    location: 'Rawamangun Indoor Track',
    category: 'DATAR',
    description: 'Lantai kayu mulus berpresisi tinggi di lintasan lurus velodrome.',
    flavor: 'Hambatan gesek mendekati nol, pure rolling speed tanpa rem.'
  },
  {
    id: 'EV-06',
    code: 'E-006',
    type: 'EVENT',
    title: 'Airport Runway Stretch',
    location: 'Kemayoran Old Airstrip',
    category: 'DATAR',
    description: 'Area landasan pacu yang super lebar dan rata sempurna.',
    flavor: 'Tempat uji nyali top speed fixed gear tanpa batas.'
  },
  {
    id: 'EV-07',
    code: 'E-007',
    type: 'EVENT',
    title: 'Boulevard Drag Strip',
    location: 'Gading Utama Boulevard',
    category: 'DATAR',
    description: 'Jalur lurus beraspal halus dengan pencahayaan lampu kota yang terang.',
    flavor: 'Setiap kayuhan pedal mendorong akselerasi langsung.'
  },
  {
    id: 'EV-08',
    code: 'E-008',
    type: 'EVENT',
    title: 'Jembatan Suramadu Straight',
    location: 'Suramadu Coastal Passage',
    category: 'DATAR',
    description: 'Lintasan lurus melintasi selat laut dengan angin semilir.',
    flavor: 'Fokus posisi aerodinamis menunduk rapat di atas setang.'
  },
  {
    id: 'EV-09',
    code: 'E-009',
    type: 'EVENT',
    title: 'Industrial Park Expressway',
    location: 'Cikarang Industrial Strip',
    category: 'DATAR',
    description: 'Jalan lurus kawasan pabrik yang sepi dan beraspal mulus.',
    flavor: 'Sprint habis-habisan tanpa gangguan lampu merah.'
  },

  // --- 10-17 TANJAKAN (Climbs / Hills) ---
  {
    id: 'EV-10',
    code: 'E-010',
    type: 'EVENT',
    title: 'Tanjakan Curam Bukit Bintang 14%',
    location: 'Bukit Bintang Ridge',
    category: 'TANJAKAN',
    description: 'Kemiringan ekstrem yang menuntut tenaga kaki raksasa dan rasio gigi tepat.',
    flavor: 'Hanya yang kuat berdiri di atas pedal yang bisa lolos ke puncak.'
  },
  {
    id: 'EV-11',
    code: 'E-011',
    type: 'EVENT',
    title: 'King of Mountain Pass',
    location: 'Jalur Puncak Pass',
    category: 'TANJAKAN',
    description: 'Tanjakan panjang berkelok dengan udara tipis berembun.',
    flavor: 'Detak jantung di batas redline, rantai ditarik maksimal.'
  },
  {
    id: 'EV-12',
    code: 'E-012',
    type: 'EVENT',
    title: 'San Francisco Steep Incline',
    location: 'Lombard Street Ridge',
    category: 'TANJAKAN',
    description: 'Tanjakan aspal perkotaan curam bertingkat-tingkat.',
    flavor: 'Cadence tinggi mengalahkan rasio gear yang kaku.'
  },
  {
    id: 'EV-13',
    code: 'E-013',
    type: 'EVENT',
    title: 'Bukit Pelangi Spiral Rise',
    location: 'Sentul Mountain Loop',
    category: 'TANJAKAN',
    description: 'Tanjakan melingkar menguras tenaga yang seakan tidak berujung.',
    flavor: 'Otot paha terbakar di setiap putaran engkol pedal.'
  },
  {
    id: 'EV-14',
    code: 'E-014',
    type: 'EVENT',
    title: 'Flyover Ramp Elevation',
    location: 'Kelapa Gading Overpass',
    category: 'TANJAKAN',
    description: 'Ramp jembatan layang yang menanjak tajam secara tiba-tiba.',
    flavor: 'Sentakan spontan memisahkan pemimpin dan rombongan peloton.'
  },
  {
    id: 'EV-15',
    code: 'E-015',
    type: 'EVENT',
    title: 'Gunung Salak Foothill Climb',
    location: 'Jalur Kaki Gunung Salak',
    category: 'TANJAKAN',
    description: 'Elevasi menaik terus-menerus diapit pepohonan pinus rindang.',
    flavor: 'Konsistensi watt menentukan siapa yang bertahan di depan.'
  },
  {
    id: 'EV-16',
    code: 'E-016',
    type: 'EVENT',
    title: 'Jalur Tebing Karang Ascent',
    location: 'Pesisir Tebing Selatan',
    category: 'TANJAKAN',
    description: 'Tanjakan terjal di pinggir tebing pantai dengan angin laut.',
    flavor: 'Tenaga murni melawan tarikan gravitasi bumi.'
  },
  {
    id: 'EV-17',
    code: 'E-017',
    type: 'EVENT',
    title: 'Ramp Parkir Gedung Spiral',
    location: 'Alleycat Spiral Garage',
    category: 'TANJAKAN',
    description: 'Tanjakan semen berputar di gedung bertingkat khas balap Alleycat.',
    flavor: 'Manuver menanjak tajam sambil menjaga momentum putaran roda.'
  },

  // --- 18-25 TIKUNGAN (Corners / Chicanes) ---
  {
    id: 'EV-18',
    code: 'E-018',
    type: 'EVENT',
    title: 'Tikungan Patah S-Bend Chicane',
    location: 'Chicane Boulevard',
    category: 'TIKUNGAN',
    description: 'Kombinasi tikungan kiri-kanan patah yang mematikan bagi rem fixie.',
    flavor: 'Skid pendek dan leaning tubuh ke sudut paling tajam.'
  },
  {
    id: 'EV-19',
    code: 'E-019',
    type: 'EVENT',
    title: 'Hairpin 180° Alley Corner',
    location: 'Kota Tua Historic Corner',
    category: 'TIKUNGAN',
    description: 'Tikungan tusuk konde 180 derajat yang sangat sempit dan licin.',
    flavor: 'Rem kaki backpedal dan drifting roda belakang sempurna.'
  },
  {
    id: 'EV-20',
    code: 'E-020',
    type: 'EVENT',
    title: 'Roundabout Whirlwind Apex',
    location: 'Bundaran HI Apex',
    category: 'TIKUNGAN',
    description: 'Memutari bundaran besar dengan kecepatan tinggi tanpa melepas pedal.',
    flavor: 'Gaya sentrifugal menarik sepeda, pedal strike clearance diuji.'
  },
  {
    id: 'EV-21',
    code: 'E-021',
    type: 'EVENT',
    title: '90° Concrete Alley Turn',
    location: 'Gang Sempit Perumahan',
    category: 'TIKUNGAN',
    description: 'Tikungan 90 derajat diapit dinding beton padat dan trotoar tinggi.',
    flavor: 'Tak ada ruang kesalahan, potong racing line sedekat mungkin.'
  },
  {
    id: 'EV-22',
    code: 'E-022',
    type: 'EVENT',
    title: 'Red Hook Crit Double Hairpin',
    location: 'Brooklyn Pier Circuit',
    category: 'TIKUNGAN',
    description: 'Dua tikungan cepat beruntun khas balap kriterium malam.',
    flavor: 'Bahu saling bersentuhan, reflek stang menentukan segalanya.'
  },
  {
    id: 'EV-23',
    code: 'E-023',
    type: 'EVENT',
    title: 'Pasar Malam Tight Corner',
    location: 'Pasar Santa Chicanes',
    category: 'TIKUNGAN',
    description: 'Jalur berliku sempit di antara tenda dan rintangan jalan.',
    flavor: 'Kecepatan reaksi dan kelincahan frame pendek sangat dominan.'
  },
  {
    id: 'EV-24',
    code: 'E-024',
    type: 'EVENT',
    title: 'Underpass Sharp Apex',
    location: 'Kuningan Underpass Entry',
    category: 'TIKUNGAN',
    description: 'Tikungan masuk terowongan yang menurun miring ke dalam.',
    flavor: 'Leaning tajam menempel garis putih aspal.'
  },
  {
    id: 'EV-25',
    code: 'E-025',
    type: 'EVENT',
    title: 'Alleycat Final Maze Turn',
    location: 'Secret Alley Waypoint',
    category: 'TIKUNGAN',
    description: 'Keluar dari labirin gang sempit dengan belokan tajam tak terduga.',
    flavor: 'Insting kurir jalanan mengalahkan pembalap velodrome.'
  },

  // --- 26-33 TURUNAN (Descents / Downhill Gravity) ---
  {
    id: 'EV-26',
    code: 'E-026',
    type: 'EVENT',
    title: 'Turunan Curam Jalur Nagreg',
    location: 'Nagreg Highway Descent',
    category: 'TURUNAN',
    description: 'Turunan panjang berkecepatan tinggi yang menguji kontrol skid dan keberanian.',
    flavor: 'Kaki menahan putaran engkol yang berputar gila-gilaan.'
  },
  {
    id: 'EV-27',
    code: 'E-027',
    type: 'EVENT',
    title: 'Underpass High-Speed Plunge',
    location: 'Terowongan Sudirman',
    category: 'TURUNAN',
    description: 'Turunan tajam meluncur ke dasar terowongan kota.',
    flavor: 'Kecepatan gravitasi melonjak drastis dalam hitungan detik.'
  },
  {
    id: 'EV-28',
    code: 'E-028',
    type: 'EVENT',
    title: 'Mountain S-Descent Gravity',
    location: 'Puncak Pass Downward Loop',
    category: 'TURUNAN',
    description: 'Rangkaian turunan curam bersambung di lereng perbukitan.',
    flavor: 'Aero tuck menunduk rapat membiarkan gravitasi mengambil alih.'
  },
  {
    id: 'EV-29',
    code: 'E-029',
    type: 'EVENT',
    title: 'Flyover Downward Drop',
    location: 'Flyover Casablanca Down-Ramp',
    category: 'TURUNAN',
    description: 'Meluncur turun dari jembatan layang dengan momentum penuh.',
    flavor: 'Melayang cepat mendahului angin malam.'
  },
  {
    id: 'EV-30',
    code: 'E-030',
    type: 'EVENT',
    title: 'Bukit Golf Downhill Rush',
    location: 'Sentul Highlands Downhill',
    category: 'TURUNAN',
    description: 'Turunan aspal luas dengan sudut elevasi -12%.',
    flavor: 'Cadence RPM tembus batas maksimal roda fixie.'
  },
  {
    id: 'EV-31',
    code: 'E-031',
    type: 'EVENT',
    title: 'Coastal Hill Plummet',
    location: 'Bukit Pantai Baron',
    category: 'TURUNAN',
    description: 'Turunan lurus dari puncak bukit menuju garis pantai.',
    flavor: 'Dorongan gravitasi murni tanpa hambatan pedal.'
  },
  {
    id: 'EV-32',
    code: 'E-032',
    type: 'EVENT',
    title: 'Alleycat Downhill Rooftop Escape',
    location: 'Multi-Storey Ramp Exit',
    category: 'TURUNAN',
    description: 'Meluncur keluar dari turunan gedung parkir menuju jalan raya!',
    flavor: 'Sensasi meluncur bebas tanpa rem mekanik.'
  },
  {
    id: 'EV-33',
    code: 'E-033',
    type: 'EVENT',
    title: 'Grand Finale Bell Lap Descent',
    location: 'Championship Circuit Finish',
    category: 'TURUNAN',
    description: 'Turunan terakhir menuju garis finis kejuaraan utama!',
    flavor: 'Semua sisa tenaga dan gravitasi dikerahkan untuk kemenangan.'
  }
];

// ==========================================
// 3B. EXTRA EXPERT ENDURANCE EVENT DECK (EV-34 s/d EV-50)
// ==========================================
export const EXPERT_ENDURANCE_EXTRA_EVENTS: EventCard[] = [
  // --- TANJAKAN EKSTRIM ---
  {
    id: 'EV-34',
    code: 'E-034',
    type: 'EVENT',
    title: 'Alpe d\'Huez Beast Grade (+18%)',
    location: 'Alpine Ridge Summit',
    category: 'TANJAKAN',
    description: 'Tanjakan terjal ekstrem dengan kemiringan buas yang menguras seluruh glikogen kaki.',
    flavor: 'Hanya rasio gigi teringan dan stamina baja yang mampu bertahan hingga puncak.'
  },
  {
    id: 'EV-35',
    code: 'E-035',
    type: 'EVENT',
    title: 'Midnight Mt. Salak Fog Climb',
    location: 'Lereng Gunung Salak Kabut',
    category: 'TANJAKAN',
    description: 'Pendakian malam buta diselimuti kabut basah dengan jarak pandang sangat terbatas.',
    flavor: 'Nafas terengah-engah melawan dinginnya pegunungan malam.'
  },
  {
    id: 'EV-36',
    code: 'E-036',
    type: 'EVENT',
    title: 'Kelok 44 Switchback Ramp',
    location: 'Kelok 44 Sumatera Barat',
    category: 'TANJAKAN',
    description: 'Tanjakan berantai dengan sudut patah tajam di setiap tikungan hairpin.',
    flavor: 'Menggoyang dropbar kiri-kanan menjaga momentum sepeda tidak berhenti.'
  },
  {
    id: 'EV-37',
    code: 'E-037',
    type: 'EVENT',
    title: 'Bromo Volcanic Sand Ascent',
    location: 'Lautan Pasir Kaldera Bromo',
    category: 'TANJAKAN',
    description: 'Tanjakan berpasir vulkanik yang membuat ban fixie amblas jika putaran pedal melemah.',
    flavor: 'Torsi raksasa dibutuhkan untuk menembus debu vulkanik kaldera.'
  },

  // --- DATAR KECEPATAN TINGGI ---
  {
    id: 'EV-38',
    code: 'E-038',
    type: 'EVENT',
    title: 'Pantai Indah Kapuk Gale (Headwind 45km/h)',
    location: 'PIK Coastal Highway',
    category: 'DATAR',
    description: 'Jalanan datar tepi laut dengan terpaan angin haluan kencang pemecah formasi peloton.',
    flavor: 'Duduk membungkuk rapat membelah dinding angin laut tanpa ampun.'
  },
  {
    id: 'EV-39',
    code: 'E-039',
    type: 'EVENT',
    title: 'World Velodrome 1km Time Trial',
    location: 'Rawamangun International Velodrome',
    category: 'DATAR',
    description: 'Lintasan papan kayu pinus Siberia berkecepatan 70+ km/jam tanpa hambatan aspal.',
    flavor: 'Garis hitam velodrome menjadi saksi rekor dunia sprint murni.'
  },
  {
    id: 'EV-40',
    code: 'E-040',
    type: 'EVENT',
    title: 'Midnight Abandoned Runway Drag',
    location: 'Kemayoran Old Runway',
    category: 'DATAR',
    description: 'Adu cepat drag 2 kilometer di atas aspal landasan pacu pesawat beraspal kasar.',
    flavor: 'Dua rider saling tatap sebelum meledakkan sprint maksimal.'
  },
  {
    id: 'EV-41',
    code: 'E-041',
    type: 'EVENT',
    title: 'Sudirman Avenue Midnight Crit Flat',
    location: 'Jalan Jenderal Sudirman',
    category: 'DATAR',
    description: 'Garis lurus 4 lajur aspal mulus di tengah gedung pencakar langit ibu kota.',
    flavor: 'Cahaya lampu kota berkilap di velg karbon saat kecepatan tembus batas.'
  },
  {
    id: 'EV-42',
    code: 'E-042',
    type: 'EVENT',
    title: 'Tanjung Priok Container Freightway',
    location: 'Pelabuhan Petikemas',
    category: 'DATAR',
    description: 'Lintasan lurus panjang diapit tumpukan ribuan kontainer besi raksasa.',
    flavor: 'Gemuruh mesin derek mengiringi putaran rantai fixie kecepatan penuh.'
  },

  // --- TIKUNGAN MAUT & CHICANES ---
  {
    id: 'EV-43',
    code: 'E-043',
    type: 'EVENT',
    title: 'Red Hook Night Double Chicane',
    location: 'Red Hook Brooklyn Circuit',
    category: 'TIKUNGAN',
    description: 'Dua chicane sempit mematikan di aspal dingin dermaga malam hari.',
    flavor: 'Pedal clearance hanya 2 milimeter dari aspal saat rebah ke dalam.'
  },
  {
    id: 'EV-44',
    code: 'E-044',
    type: 'EVENT',
    title: 'Kota Tua Wet Cobblestone Hairpin',
    location: 'Alun-Alun Fatahillah Cobblestone',
    category: 'TIKUNGAN',
    description: 'Tikungan hairpin di atas bebatuan tua basah yang licin bagai es.',
    flavor: 'Skid counter-steering presisi mutlak agar tidak terhempas ke trotoar.'
  },
  {
    id: 'EV-45',
    code: 'E-045',
    type: 'EVENT',
    title: 'Multi-Storey 360° Spiral Ramp',
    location: 'Mall Spiral Parking Ramp',
    category: 'TIKUNGAN',
    description: 'Tikungan melingkar 360 derajat tiada henti dengan sudut miring curam.',
    flavor: 'Kepala pusing dan tangan kebas menahan g-force lingkaran sempit.'
  },
  {
    id: 'EV-46',
    code: 'E-046',
    type: 'EVENT',
    title: 'Monas Grand Square Apex Sweep',
    location: 'Silang Monas Cawan',
    category: 'TIKUNGAN',
    description: 'Sapuan tikungan cepat mengitari tugu nasional dengan kecepatan tinggi.',
    flavor: 'Garis balap terluas tempat rider bernyali besar menyalip dari sisi luar.'
  },

  // --- TURUNAN GRAVITASI EKSTRIM ---
  {
    id: 'EV-47',
    code: 'E-047',
    type: 'EVENT',
    title: 'Sentul Canyon Plummet (-15%)',
    location: 'Sentul Highlands Canyon',
    category: 'TURUNAN',
    description: 'Nukikan turunan jurang -15% yang memaksa putaran kaki melewati 160 RPM!',
    flavor: 'Dada menempel stang, hembusan angin kencang merobek jaket windbreaker.'
  },
  {
    id: 'EV-48',
    code: 'E-048',
    type: 'EVENT',
    title: 'Casablanca Overpass Double Drop',
    location: 'Flyover Non-Tol Casablanca',
    category: 'TURUNAN',
    description: 'Dua turunan flyover bertingkat dengan angin samping jalan layang kencang.',
    flavor: 'Melayang bebas menuruni jalan layang sebelum melesat ke jalan arteri.'
  },
  {
    id: 'EV-49',
    code: 'E-049',
    type: 'EVENT',
    title: 'Puncak Pass Devil\'s Plunge',
    location: 'Puncak Pass Menurun Terjal',
    category: 'TURUNAN',
    description: 'Turunan panjang berkelok meluncur dari puncak teh menuju lembah.',
    flavor: 'Menahan putaran engkol fixie dengan leg resistance maksimal.'
  },
  {
    id: 'EV-50',
    code: 'E-050',
    type: 'EVENT',
    title: 'World Grand Tour Championship Finale',
    location: 'Monaco Harbor Circuit Downhill',
    category: 'TURUNAN',
    description: 'Turunan terakhir penentuan gelar juara dunia fixed gear internasional!',
    flavor: 'Garis finis di depan mata, gravitasi dan keberanian mengukir sejarah.'
  }
];

// Combined 50-Card Deck for Expert Endurance Mode
export const EXPERT_50_DECK: EventCard[] = [
  ...EVENTS_33_DECK,
  ...EXPERT_ENDURANCE_EXTRA_EVENTS
];

// ==========================================
// 4. EXTRA EVENT (Hazard / Kondisi Rintangan)
// ==========================================
export const HAZARDS_POOL: HazardCard[] = [
  {
    id: 'H-01',
    code: 'H-01',
    type: 'EXTRA_EVENT',
    title: 'Jalan Rusak / Pothole Gauntlet',
    hazardType: 'JALAN_RUSAK',
    description: 'Aspal berlubang tajam dan kerikil berserakan! Mengurangi performa seimbang.',
    effect: {
      pointDelta: -1,
      description: '-1 Point untuk semua pemain (kecuali yang memiliki Skill Bunny Hop / Sepeda Anti-Hazard).'
    }
  },
  {
    id: 'H-02',
    code: 'H-02',
    type: 'EXTRA_EVENT',
    title: 'Penutupan Jalan / Roadblock Konstruksi',
    hazardType: 'PENUTUPAN_JALAN',
    description: 'Jalur utama ditutup barrier proyek! Pembalap dipaksa memotong jalur sempit.',
    effect: {
      pointDelta: -1,
      description: '-1 Point jika tidak ada kartu manuver Skill.'
    }
  },
  {
    id: 'H-03',
    code: 'H-03',
    type: 'EXTRA_EVENT',
    title: 'Pohon Tumbang Menghalangi Jalur',
    hazardType: 'POHON_TUMBANG',
    description: 'Batang pohon melintang di tengah aspal! Bahaya crash mendadak.',
    effect: {
      pointDelta: -2,
      description: '-2 Point penalti rintangan berat jika tidak melakukan Skid/Lompat.'
    }
  },
  {
    id: 'H-04',
    code: 'H-04',
    type: 'EXTRA_EVENT',
    title: 'Tumpahan Oli di Tikungan',
    hazardType: 'TUMPAHAN_OLI',
    description: 'Ceceran minyak licin di titik apex tikungan!',
    effect: {
      affectedTerrain: 'TIKUNGAN',
      pointDelta: -2,
      description: '-2 Point pada Event TIKUNGAN jika tidak memakai Skid.'
    }
  },
  {
    id: 'H-05',
    code: 'H-05',
    type: 'EXTRA_EVENT',
    title: 'Hujan Deras / Wet Asphalt',
    hazardType: 'HUJAN_LICIN',
    description: 'Hujan lebat membuat aspal licin dan pengereman fixie tergelincir.',
    effect: {
      affectedSpecialty: 'SPRINTER',
      pointDelta: -1,
      description: '-1 Point untuk Sprinter karena ban selip.'
    }
  },
  {
    id: 'H-06',
    code: 'H-06',
    type: 'EXTRA_EVENT',
    title: 'Sorak Penonton / Crowd Boost',
    hazardType: 'CROWD',
    description: 'Gemuruh penonton di pinggir lintasan membakar semangat kedua pembalap!',
    effect: {
      pointDelta: 1,
      description: '+1 Point semangat tambahan untuk semua pemain!'
    }
  }
];

// ==========================================
// KARTU AKSI (Item, Skill, Ultimate)
// ==========================================
export const ACTION_CARDS_POOL: ActionCard[] = [
  // ------------------------------------------
  // 5. ITEM (Kartu Aksi 5 - Suplemen, Komponen, Aksesoris)
  // ------------------------------------------
  {
    id: 'IT-01',
    type: 'ITEM',
    subType: 'ITEM',
    name: 'Energy Gel Espresso',
    cost: 0,
    isUltimate: false,
    effectDescription: 'Suplemen instan: Pulihkan +2 ⚡ Energy sekarang juga.',
    applyEffect: {
      energyDelta: 2
    },
    flavor: '100mg kafein langsung menyengat aliran darah dan fokus balap.',
    colorTheme: 'from-yellow-600 to-amber-700'
  },
  {
    id: 'IT-02',
    type: 'ITEM',
    subType: 'ITEM',
    name: 'Clipless Carbon Shoes',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Sepatu cleat kaku: +1 Point di SEMUA kondisi medan ronde ini.',
    applyEffect: {
      pointBonus: 1
    },
    flavor: 'Kaki menyatu erat dengan pedal, transfer tenaga 360 derajat.',
    colorTheme: 'from-slate-600 to-zinc-800'
  },
  {
    id: 'IT-03',
    type: 'ITEM',
    subType: 'ITEM',
    name: 'Isotonic Electrolyte Drink',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Rehidrasi elektrolit: Ambil 2 Kartu Aksi baru + 1 ⚡ Energy.',
    applyEffect: {
      drawCards: 2,
      energyDelta: 1
    },
    flavor: 'Mencegah kram otot mendadak di lap-lap penentuan.',
    colorTheme: 'from-sky-500 to-blue-700'
  },
  {
    id: 'IT-04',
    type: 'ITEM',
    subType: 'ITEM',
    name: 'Fast Chain Lube Spray',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Pelumas rantai keramik: +2 Point pada Event DATAR atau TURUNAN.',
    applyEffect: {
      terrainBonusMap: {
        DATAR: 2,
        TURUNAN: 2
      }
    },
    flavor: 'Mengurangi gesekan rantai mendekati nol watt yang hilang.',
    colorTheme: 'from-teal-600 to-cyan-800'
  },
  {
    id: 'IT-05',
    type: 'ITEM',
    subType: 'ITEM',
    name: 'Mini CO2 Inflator',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Tekanan ban 120 PSI: +2 Point pada TANJAKAN atau TIKUNGAN.',
    applyEffect: {
      terrainBonusMap: {
        TANJAKAN: 2,
        TIKUNGAN: 2
      }
    },
    flavor: 'Ban padat menggigit aspal dengan grip maksimal.',
    colorTheme: 'from-purple-600 to-indigo-800'
  },
  {
    id: 'IT-06',
    type: 'ITEM',
    subType: 'ITEM',
    name: 'Banana Boost (Pisang Balap)',
    cost: 0,
    isUltimate: false,
    effectDescription: 'Nutrisi alami: Pulihkan +1 ⚡ Energy & +1 Point pada Event TANJAKAN.',
    applyEffect: {
      energyDelta: 1,
      terrainBonusMap: {
        TANJAKAN: 1
      }
    },
    flavor: 'Glikogen murni dan kalium tinggi anti-kram di tanjakan terjal.',
    colorTheme: 'from-amber-400 to-yellow-600'
  },
  {
    id: 'IT-07',
    type: 'ITEM',
    subType: 'ITEM',
    name: 'Aero Helmet TT Visor',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Visor aerodinamis pemecah angin: +2 Point pada DATAR atau TURUNAN.',
    applyEffect: {
      terrainBonusMap: {
        DATAR: 2,
        TURUNAN: 2
      }
    },
    flavor: 'Bentuk teardrop membelah resistensi udara kecepatan tinggi.',
    colorTheme: 'from-cyan-600 to-blue-800'
  },
  {
    id: 'IT-08',
    type: 'ITEM',
    subType: 'ITEM',
    name: 'Sticky Gum Grip Gloves',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Sarung tangan grip silikon: +2 Point di TIKUNGAN & pulihkan +1 ⚡ Energy.',
    applyEffect: {
      terrainBonusMap: {
        TIKUNGAN: 2
      },
      energyDelta: 1
    },
    flavor: 'Genggaman erat di dropbar tanpa licin saat keringat bercucuran.',
    colorTheme: 'from-emerald-600 to-green-800'
  },
  {
    id: 'IT-09',
    type: 'ITEM',
    subType: 'ITEM',
    name: 'High-Torque Double Straps',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Tali pedal ganda super kokoh: +2 Point pada TANJAKAN (+1 Point di DATAR).',
    applyEffect: {
      pointBonus: 1,
      terrainBonusMap: {
        TANJAKAN: 2
      }
    },
    flavor: 'Kuncian kaki tanpa kompromi saat menarik pedal di sudut kemiringan.',
    colorTheme: 'from-orange-600 to-amber-800'
  },
  {
    id: 'IT-10',
    type: 'ITEM',
    subType: 'ITEM',
    name: 'Nitto Bullhorn Handlebar Tape',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Grip ergonomis tanjakan: +3 Point khusus pada Event bertipe TANJAKAN.',
    applyEffect: {
      terrainBonusMap: {
        TANJAKAN: 3
      }
    },
    flavor: 'Posisi tanduk memberi sudut leverage maksimal untuk memanjat bukit.',
    colorTheme: 'from-lime-600 to-emerald-800'
  },
  {
    id: 'IT-11',
    type: 'ITEM',
    subType: 'ITEM',
    name: 'CeramicSpeed Bottom Bracket',
    cost: 2,
    isUltimate: false,
    effectDescription: 'Bearing keramik ultra-licin: +2 Point di SEMUA medan & pulihkan +1 ⚡ Energy.',
    applyEffect: {
      pointBonus: 2,
      energyDelta: 1
    },
    flavor: 'Putaran crankset berputar bebas tanpa friksi mekanis.',
    colorTheme: 'from-violet-600 to-purple-800'
  },
  {
    id: 'IT-12',
    type: 'ITEM',
    subType: 'ITEM',
    name: 'Tubular Track Slick Tyre',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Ban balap velodrome 23c: +2 Point pada Event DATAR dan TIKUNGAN.',
    applyEffect: {
      terrainBonusMap: {
        DATAR: 2,
        TIKUNGAN: 2
      }
    },
    flavor: 'Karet kompon balap menempel presisi di garis aspal terhalus.',
    colorTheme: 'from-rose-600 to-pink-800'
  },
  {
    id: 'IT-13',
    type: 'ITEM',
    subType: 'ITEM',
    name: 'Caffeine Chews Booster',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Permen kafein konsentrasi tinggi: Pulihkan +3 ⚡ Energy instan.',
    applyEffect: {
      energyDelta: 3
    },
    flavor: 'Dorongan adrenalin instan untuk mempersiapkan serangan kombo aksi.',
    colorTheme: 'from-amber-500 to-orange-700'
  },
  {
    id: 'IT-14',
    type: 'ITEM',
    subType: 'ITEM',
    name: 'Windproof Aero Shoe Covers',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Cover sepatu aerodinamis: +1 Point di SEMUA medan & abaikan Hazard Hujan.',
    applyEffect: {
      pointBonus: 1,
      ignoreHazard: true
    },
    flavor: 'Membungkus sepatu rapat dari terpaan angin dan cipratan genangan air.',
    colorTheme: 'from-blue-600 to-cyan-800'
  },
  {
    id: 'IT-15',
    type: 'ITEM',
    subType: 'ITEM',
    name: 'Titanium Track Cog 15T',
    cost: 2,
    isUltimate: false,
    effectDescription: 'Gir belakang titanium ringan: +3 Point pada Event DATAR atau TURUNAN.',
    applyEffect: {
      terrainBonusMap: {
        DATAR: 3,
        TURUNAN: 3
      }
    },
    flavor: 'Rasio gigi kencang yang menyalurkan seluruh tenaga ke roda belakang.',
    colorTheme: 'from-zinc-600 to-stone-800'
  },

  // ------------------------------------------
  // 6. SKILL (Kartu Aksi 6: Manuver, Taktik, Teknik)
  // ------------------------------------------
  {
    id: 'SK-01',
    type: 'SKILL',
    subType: 'SKILL',
    name: 'Skid (Kunci Roda)',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Manuver skid tajam: +2 Point pada TIKUNGAN & abaikan Hazard.',
    applyEffect: {
      terrainBonusMap: {
        TIKUNGAN: 2
      },
      ignoreHazard: true
    },
    flavor: 'Kaki mengunci pedal belakang membentuk sudut drifting aspal.',
    colorTheme: 'from-blue-600 to-indigo-800'
  },
  {
    id: 'SK-02',
    type: 'SKILL',
    subType: 'SKILL',
    name: 'Lompat (Bunny Hop)',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Lompati rintangan: +2 Point & kebal penalti Extra Event (Pohon/Jalan Rusak).',
    applyEffect: {
      pointBonus: 2,
      ignoreHazard: true
    },
    flavor: 'Mengangkat kedua roda melompati lubang jalan tanpa mengurangi kecepatan.',
    colorTheme: 'from-emerald-600 to-teal-800'
  },
  {
    id: 'SK-03',
    type: 'SKILL',
    subType: 'SKILL',
    name: 'Overtake (Salip Garis Dalam)',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Salip lawan di tikungan: +2 Point jika poinmu seimbang/kalah dari lawan.',
    applyEffect: {
      pointBonus: 1,
      conditionalBehindBonus: 1
    },
    flavor: 'Menusuk celah sempit di sisi dalam apex untuk merebut pimpinan.',
    colorTheme: 'from-rose-600 to-red-800'
  },
  {
    id: 'SK-04',
    type: 'SKILL',
    subType: 'SKILL',
    name: 'Drafting / Slipstream',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Curi angin: Jika poinmu lebih rendah dari lawan, dapatkan +2 Point!',
    applyEffect: {
      pointBonus: 0,
      conditionalBehindBonus: 2
    },
    flavor: 'Berlindung di belakang roda lawan sebelum melesat keluar.',
    colorTheme: 'from-cyan-600 to-teal-800'
  },
  {
    id: 'SK-05',
    type: 'SKILL',
    subType: 'SKILL',
    name: 'Aero Tuck Position',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Posisi aerodinamis: +2 Point pada Event DATAR atau TURUNAN.',
    applyEffect: {
      terrainBonusMap: {
        DATAR: 2,
        TURUNAN: 2
      }
    },
    flavor: 'Membungkuk serendah mungkin di atas top tube membelah angin.',
    colorTheme: 'from-amber-600 to-orange-700'
  },
  {
    id: 'SK-06',
    type: 'SKILL',
    subType: 'SKILL',
    name: 'Sprint Burst',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Sentakan tenaga: +2 Point di DATAR (+1 Point di medan lain).',
    applyEffect: {
      pointBonus: 1,
      terrainBonusMap: {
        DATAR: 2
      }
    },
    flavor: 'Mendorong putaran pedal hingga batas RPM tertinggi.',
    colorTheme: 'from-red-600 to-rose-800'
  },
  {
    id: 'SK-07',
    type: 'SKILL',
    subType: 'SKILL',
    name: 'Tactical Line Block',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Tutup racing line lawan: Kurangi -1 Point pada total skor lawan.',
    applyEffect: {
      opponentPointReduction: 1
    },
    flavor: 'Menutup celah jalan sehingga lawan kehilangan momentum.',
    colorTheme: 'from-zinc-700 to-stone-900'
  },
  {
    id: 'SK-08',
    type: 'SKILL',
    subType: 'SKILL',
    name: 'Whip Skid (Kibasan Roda Belakang)',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Kibaskan roda memotong apex: +2 Point di TIKUNGAN & kurangi -1 Point lawan!',
    applyEffect: {
      terrainBonusMap: {
        TIKUNGAN: 2
      },
      opponentPointReduction: 1
    },
    flavor: 'Gaya skid agresif yang memaksa lawan mengerem dan melebar ke luar.',
    colorTheme: 'from-fuchsia-600 to-purple-800'
  },
  {
    id: 'SK-09',
    type: 'SKILL',
    subType: 'SKILL',
    name: 'Cadence Overdrive (140+ RPM)',
    cost: 2,
    isUltimate: false,
    effectDescription: 'Putaran kaki сверх-cepat: +3 Point di DATAR & +2 Point di TURUNAN.',
    applyEffect: {
      terrainBonusMap: {
        DATAR: 3,
        TURUNAN: 2
      }
    },
    flavor: 'Kaki berputar seperti baling-baling turbin tanpa henti.',
    colorTheme: 'from-amber-500 to-red-700'
  },
  {
    id: 'SK-10',
    type: 'SKILL',
    subType: 'SKILL',
    name: 'Out-of-Saddle Mash (Goyang Tanjakan)',
    cost: 2,
    isUltimate: false,
    effectDescription: 'Berdiri memompa tanjakan: +3 Point di TANJAKAN (+1 Point di medan lain).',
    applyEffect: {
      pointBonus: 1,
      terrainBonusMap: {
        TANJAKAN: 3
      }
    },
    flavor: 'Menggoyang stang kiri-kanan menyalurkan bobot tubuh penuh ke pedal.',
    colorTheme: 'from-emerald-600 to-green-800'
  },
  {
    id: 'SK-11',
    type: 'SKILL',
    subType: 'SKILL',
    name: 'Track Stand Feint (Tipuan Curi Angin)',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Taktik pura-pura tertahan: Curi angin (+2 Point jika tertinggal) & +1 ⚡ Energy!',
    applyEffect: {
      conditionalBehindBonus: 2,
      energyDelta: 1
    },
    flavor: 'Memancing lawan mengambil inisiatif di depan lalu menyerang dari slipstream.',
    colorTheme: 'from-indigo-600 to-blue-800'
  },
  {
    id: 'SK-12',
    type: 'SKILL',
    subType: 'SKILL',
    name: 'Apex Late Braking Skid',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Kunci roda di detik terakhir sudut: +3 Point khusus pada Event TIKUNGAN.',
    applyEffect: {
      terrainBonusMap: {
        TIKUNGAN: 3
      }
    },
    flavor: 'Memperlambat laju tepat di bibir tikungan tajam sebelum melesat keluar.',
    colorTheme: 'from-sky-600 to-indigo-800'
  },
  {
    id: 'SK-13',
    type: 'SKILL',
    subType: 'SKILL',
    name: 'Alleycat Traffic Weave',
    cost: 2,
    isUltimate: false,
    effectDescription: 'Kelincahan kurir kota: +2 Point di SEMUA medan & abaikan semua Extra Event!',
    applyEffect: {
      pointBonus: 2,
      ignoreHazard: true
    },
    flavor: 'Menembus sela-sela kepadatan jalanan dengan insting navigasi tanpa cela.',
    colorTheme: 'from-teal-600 to-emerald-800'
  },
  {
    id: 'SK-14',
    type: 'SKILL',
    subType: 'SKILL',
    name: 'Leadout Train Punch',
    cost: 2,
    isUltimate: false,
    effectDescription: 'Tarikan sprint eksplosif: +3 Point di DATAR & kurangi -1 Point skor lawan.',
    applyEffect: {
      terrainBonusMap: {
        DATAR: 3
      },
      opponentPointReduction: 1
    },
    flavor: 'Akselerasi mendadak yang mematahkan ritme kayuhan lawan di belakang.',
    colorTheme: 'from-red-600 to-orange-800'
  },
  {
    id: 'SK-15',
    type: 'SKILL',
    subType: 'SKILL',
    name: 'Spinning Recovery (Kayuhan Rileks)',
    cost: 0,
    isUltimate: false,
    effectDescription: 'Putar pedal ringan: Pulihkan +2 ⚡ Energy & siapkan serangan kombo lap berikutnya.',
    applyEffect: {
      energyDelta: 2
    },
    flavor: 'Mengatur nafas dan menurunkan asam laktat untuk mempersiapkan serangan penentu.',
    colorTheme: 'from-cyan-600 to-teal-700'
  },
  {
    id: 'SK-16',
    type: 'SKILL',
    subType: 'SKILL',
    name: 'Counter Attack Surge',
    cost: 2,
    isUltimate: false,
    effectDescription: 'Serangan balik kilat: +3 Point saat skormu seimbang atau tertinggal dari lawan!',
    applyEffect: {
      conditionalBehindBonus: 3
    },
    flavor: 'Membalas manuver lawan tepat saat mereka mengira sudah unggul di depan.',
    colorTheme: 'from-rose-600 to-red-900'
  },
  {
    id: 'SK-17',
    type: 'SKILL',
    subType: 'SKILL',
    name: 'Super-Tuck Descent Dive',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Nukikan menembus gravitasi: +3 Point khusus pada Event bertipe TURUNAN.',
    applyEffect: {
      terrainBonusMap: {
        TURUNAN: 3
      }
    },
    flavor: 'Duduk di atas top tube meminimalkan hambatan angin di turunan curam.',
    colorTheme: 'from-cyan-500 to-blue-700'
  },
  {
    id: 'SK-18',
    type: 'SKILL',
    subType: 'SKILL',
    name: 'Dropbar Power Grip',
    cost: 1,
    isUltimate: false,
    effectDescription: 'Tarik handlebar bawah: +2 Point pada Event bertipe TANJAKAN atau DATAR.',
    applyEffect: {
      terrainBonusMap: {
        TANJAKAN: 2,
        DATAR: 2
      }
    },
    flavor: 'Genggaman kokoh di lengkungan bawah dropbar menyalurkan daya maksimal.',
    colorTheme: 'from-amber-600 to-yellow-800'
  },

  // ------------------------------------------
  // 7. ULTIMATE CARD (Kartu Aksi 7: Ultimate Skill & Ultimate Item)
  // ------------------------------------------
  // --- Ultimate Skill ---
  {
    id: 'ULT-01',
    type: 'ULTIMATE',
    subType: 'ULTIMATE_SKILL',
    name: 'ULTIMATE SKILL: Rocket Launch Sprint',
    cost: 3,
    isUltimate: true,
    effectDescription: '🔥 +5 Point pada DATAR (+4 Point di medan lain)! [1× Per Match]',
    applyEffect: {
      pointBonus: 4,
      terrainBonusMap: {
        DATAR: 5
      }
    },
    flavor: 'Meledakkan seluruh cadangan tenaga glikogen dalam satu tarikan sprint maut.',
    colorTheme: 'from-amber-500 via-red-600 to-purple-800'
  },
  {
    id: 'ULT-02',
    type: 'ULTIMATE',
    subType: 'ULTIMATE_SKILL',
    name: 'ULTIMATE SKILL: Apex Predator Drift',
    cost: 2,
    isUltimate: true,
    effectDescription: '🔥 +5 Point di TIKUNGAN & kurangi -1 Point skor lawan! [1× Per Match]',
    applyEffect: {
      pointBonus: 2,
      terrainBonusMap: {
        TIKUNGAN: 5
      },
      opponentPointReduction: 1
    },
    flavor: 'Memotong racing line dengan skid mematikan yang mustahil disusul.',
    colorTheme: 'from-blue-600 via-indigo-700 to-purple-900'
  },
  {
    id: 'ULT-03',
    type: 'ULTIMATE',
    subType: 'ULTIMATE_SKILL',
    name: 'ULTIMATE SKILL: Suicide Mash Breakaway',
    cost: 3,
    isUltimate: true,
    effectDescription: '🔥 +4 Point secara mutlak. Jika tertinggal skor, dapatkan total +6 Point! [1× Per Match]',
    applyEffect: {
      pointBonus: 4,
      conditionalBehindBonus: 2
    },
    flavor: 'Gak ada rem, gak ada rasa takut. Menyerang solo menuju garis finis.',
    colorTheme: 'from-red-600 via-rose-700 to-amber-700'
  },
  {
    id: 'ULT-04',
    type: 'ULTIMATE',
    subType: 'ULTIMATE_SKILL',
    name: 'ULTIMATE SKILL: Super Bunny Hop Gap Jump',
    cost: 2,
    isUltimate: true,
    effectDescription: '🔥 +4 Point di TURUNAN atau TANJAKAN & abaikan semua Extra Event! [1× Per Match]',
    applyEffect: {
      pointBonus: 2,
      terrainBonusMap: {
        TURUNAN: 4,
        TANJAKAN: 4
      },
      ignoreHazard: true
    },
    flavor: 'Lompatan super tinggi melompati celah jalanan layang kota.',
    colorTheme: 'from-emerald-500 via-teal-600 to-blue-900'
  },
  {
    id: 'ULT-07',
    type: 'ULTIMATE',
    subType: 'ULTIMATE_SKILL',
    name: 'ULTIMATE SKILL: Alleycat World Champion Dash',
    cost: 3,
    isUltimate: true,
    effectDescription: '🔥 +5 Point di TIKUNGAN atau TURUNAN & kebal semua Hazard! [1× Per Match]',
    applyEffect: {
      pointBonus: 2,
      terrainBonusMap: {
        TIKUNGAN: 5,
        TURUNAN: 5
      },
      ignoreHazard: true
    },
    flavor: 'Kecepatan legendaris juara dunia alleycat melewati hiruk-pikuk kota tanpa ragu.',
    colorTheme: 'from-fuchsia-600 via-purple-700 to-cyan-800'
  },

  // --- Ultimate Item ---
  {
    id: 'ULT-05',
    type: 'ULTIMATE',
    subType: 'ULTIMATE_ITEM',
    name: 'ULTIMATE ITEM: Nitto Gold NJS & Izumi Toughness',
    cost: 2,
    isUltimate: true,
    effectDescription: '🔥 +3 Point di SEMUA medan & pulihkan +2 ⚡ Energy jika menang ronde ini! [1× Per Match]',
    applyEffect: {
      pointBonus: 3,
      energyDelta: 2
    },
    flavor: 'Drivetrain legendaris NJS Jepang tanpa gesekan energi yang terbuang.',
    colorTheme: 'from-yellow-400 via-amber-600 to-stone-900'
  },
  {
    id: 'ULT-06',
    type: 'ULTIMATE',
    subType: 'ULTIMATE_ITEM',
    name: 'ULTIMATE ITEM: Aerospoke Prototype Full Disc',
    cost: 2,
    isUltimate: true,
    effectDescription: '🔥 +4 Point pada DATAR atau TURUNAN & beri diskon 2 ⚡ Energy! [1× Per Match]',
    applyEffect: {
      pointBonus: 2,
      terrainBonusMap: {
        DATAR: 4,
        TURUNAN: 4
      },
      energyDelta: 1
    },
    flavor: 'Velg piringan solid pemecah angin velodrome kelas dunia.',
    colorTheme: 'from-cyan-500 via-blue-600 to-indigo-900'
  },
  {
    id: 'ULT-08',
    type: 'ULTIMATE',
    subType: 'ULTIMATE_ITEM',
    name: 'ULTIMATE ITEM: Sugino 75 Grand Mighty Gold Edition',
    cost: 3,
    isUltimate: true,
    effectDescription: '🔥 +4 Point di SEMUA medan & pulihkan +3 ⚡ Energy seketika! [1× Per Match]',
    applyEffect: {
      pointBonus: 4,
      energyDelta: 3
    },
    flavor: 'Crankset emas NJS terkuat dengan kekakuan mutlak untuk transfer tenaga murni.',
    colorTheme: 'from-yellow-300 via-amber-500 to-orange-900'
  }
];

/**
 * Spitz Apel I - Imperial Static Website Core Scripts
 * Handles Web Audio Synthesis, feed simulator, certificate printer, scheduler sheets, and photo popup details.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Audio Synthesizer (Web Audio API) ---
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playBark() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const barksCount = 2;

      for (let i = 0; i < barksCount; i++) {
        const delay = i * 0.18;
        const start = now + delay;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, start);
        osc.frequency.exponentialRampToValueAtTime(350, start + 0.12);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.12);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, start);
        filter.Q.setValueAtTime(3, start);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.13);
      }
    } catch (error) {
      console.warn("Audio Context is blocked or not supported by browser:", error);
    }
  }

  function playCrunch() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      for (let i = 0; i < 3; i++) {
        const start = now + i * 0.12;
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let j = 0; j < bufferSize; j++) {
          data[j] = Math.random() * 2 - 1;
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000 + Math.random() * 500, start);
        filter.Q.setValueAtTime(2, start);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.06);

        noiseNode.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noiseNode.start(start);
        noiseNode.stop(start + 0.08);
      }
    } catch (error) {
      console.warn("Audio playback failed:", error);
    }
  }

  // Bind general audio triggers
  document.querySelectorAll('.trigger-bark').forEach(el => {
    el.addEventListener('click', playBark);
  });
  document.querySelectorAll('.trigger-crunch').forEach(el => {
    el.addEventListener('click', playCrunch);
  });


  // --- 2. Mobile Menu Dropdown Toggle ---
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenuDropdown = document.getElementById('mobile-menu-dropdown');
  if (mobileMenuToggle && mobileMenuDropdown) {
    mobileMenuToggle.addEventListener('click', () => {
      const isOpen = !mobileMenuDropdown.classList.contains('hidden');
      if (isOpen) {
        mobileMenuDropdown.classList.add('hidden');
      } else {
        mobileMenuDropdown.classList.remove('hidden');
      }
    });

    // Close menu when navigation option is clicked
    mobileMenuDropdown.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        mobileMenuDropdown.classList.add('hidden');
      });
    });
  }


  // --- 3. Click-to-Pat Heart Spray effect ---
  const heartContainer = document.getElementById('hearts-container');
  const patBtn = document.getElementById('btn-hero-pat');

  function spawnHeartsAt(x, y) {
    if (!heartContainer) return;
    for (let i = 0; i < 8; i++) {
      const heart = document.createElement('div');
      heart.innerText = '❤️';
      heart.style.position = 'absolute';
      heart.style.fontSize = `${20 + Math.random() * 20}px`;
      heart.style.pointerEvents = 'none';
      heart.style.userSelect = 'none';
      heart.style.left = `${x}px`;
      heart.style.top = `${y}px`;
      heart.style.transition = 'transform 1.2s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 1.2s ease-out';
      
      heartContainer.appendChild(heart);

      // Force lay out and execute animation transforms
      setTimeout(() => {
        const destY = y - 120 - Math.random() * 80;
        const destX = x + (Math.random() * 120 - 60);
        heart.style.transform = `translate(${destX - x}px, ${destY - y}px) scale(${1 + Math.random() * 0.8})`;
        heart.style.opacity = '0';
      }, 20);

      // Cleanup
      setTimeout(() => {
        heart.remove();
      }, 1300);
    }
  }

  if (patBtn) {
    patBtn.addEventListener('click', (e) => {
      playBark();
      const rect = patBtn.getBoundingClientRect();
      const clientX = rect.left + rect.width / 2 + window.scrollX;
      const clientY = rect.top + window.scrollY;
      spawnHeartsAt(clientX, clientY);
    });
  }


  // --- 4. Photos & Polaroid Popup Modal Operations ---
  const photoMoments = [
    {
      id: 0,
      title: 'Первая поездка домой!',
      emoji: '🚗💙',
      imgUrl: 'src/assets/images/apel_photo_0_1779903999773.png',
      description: 'Апель в стильном автокресле и королевской синей шлейке, язык радостно наружу!',
      soundType: 'bark',
      colorTheme: 'from-blue-400 to-sky-600',
      bgAccent: 'border-sky-300 text-sky-800 bg-sky-50',
      location: 'Трасса Приют — Диван',
      date: 'Май 2025 г.',
      intel: '«Ура! Я еду в личной карете! Шлейка синяя в тон моих глаз (хотя они карие, но стиль превыше всего). Язык наружу, ловлю встречные потоки воздуха и предвкушаю первую сырную дегустацию!»',
      koksComment: '«Слышу скрежет зубовный. Откуда взялась эта меховая сигнализация на батарейках? Везите обратно.»',
      kroshikComment: '«ШУРРР! МАШИНА! КРОШИК ХОЧЕТ ОРЕХ ХОРОШЕМУ ПОПУГАЮ ЧАО КАК ДЕЛА!»'
    },
    {
      id: 1,
      title: 'Сдобная Булочка в лугах',
      emoji: '🌾🧺',
      imgUrl: 'src/assets/images/apel_photo_1_1779904023578.png',
      description: 'Апель инспектирует полевой сектор и гордо держит плетеное лукошко в зубах.',
      soundType: 'crunch',
      colorTheme: 'from-emerald-400 to-green-600',
      bgAccent: 'border-emerald-300 text-emerald-800 bg-emerald-50',
      location: 'Секретная дачная поляна',
      date: 'Июль 2025 г.',
      intel: '«Кто сказал, что шпицы не приспособлены к сельскому хозяйству? Лично принес лукошко для сбора сырных грибов. Поляну проверил, жуков разогнал тявканьем.»',
      koksComment: '«Злоупотребление детским трудом. Лучше бы он мышь поймал. Ах да, он же боится даже сушеных легких...»',
      kroshikComment: '«ТРАВА! БОЛЬШОЙ КРОШИК ЛЕТИТ ВПЕРЕД! АПЕЛЬ — ШЛЯПА!»'
    },
    {
      id: 2,
      title: 'Звезда подиума «Лапа»',
      emoji: '✂️👑',
      imgUrl: 'src/assets/images/apel_photo_2_1779904040018.png',
      description: 'Вершина ухода. Апель стоит на профессиональном столе под неоновой вывеской «Лапа Груминг».',
      soundType: 'bark',
      colorTheme: 'from-pink-400 to-rose-600',
      bgAccent: 'border-rose-300 text-rose-800 bg-rose-50',
      location: 'Салон спа «Лапа Груминг»',
      date: 'Октябрь 2025 г.',
      intel: '«Штанишки вычесаны до состояния облака. Вокруг неоновый свет, расчески из белого золота и фен с эффектом морского бриза. Корона на голове держится исключительно за счет ушей!»',
      koksComment: '«Пылевой клещ перекрасился и думает, что он Элвис Пресли. Смешно до колик.»',
      kroshikComment: '«KРАСИВAЯ ПТИЦA! КРОШИК СМОТРИТ НА ПУХ! ДАЙТЕ СУШКУ ДЛЯ ПРИЧЕСКИ!»'
    },
    {
      id: 3,
      title: 'Дипломатический шпионаж',
      emoji: '📸🕵️',
      imgUrl: 'src/assets/images/apel_photo_3_1779904056842.png',
      description: 'Кот Кокс на кухонной столешнице у коричневой клетки бдит за попугаем Крошиком.',
      soundType: 'crunch',
      colorTheme: 'from-amber-500 to-amber-700',
      bgAccent: 'border-amber-400 text-amber-900 bg-amber-50',
      location: 'Кухонный Терминал Б',
      date: 'Сентябрь 2025 г.',
      intel: '«Засек несанкционированное совещание. Кот Кокс подобрался к Крошику на расстояние одного царапа. Я вовремя тявкнул, предотвратив международный инцидент!»',
      koksComment: '«Я просто помогал Крошику разгадывать кроссворд. А этот рыжий паникер поднял хай на три подъезда.»',
      kroshikComment: '«КОКС — ГРАБИТЕЛЬ! ХОЗЯИН, СПАСИТЕ ПУШКА! КОКС ХОЧЕТ ОРЕХ ЧАО!»'
    },
    {
      id: 4,
      title: 'Министерский презрительный взор',
      emoji: '👁️😾',
      imgUrl: 'src/assets/images/apel_photo_4_1779904072461.png',
      description: 'Суровый крупный план кота Кокса. Желтые глаза, сканирующие грешную душу шпица.',
      soundType: 'crunch',
      colorTheme: 'from-slate-500 to-slate-700',
      bgAccent: 'border-slate-400 text-slate-800 bg-slate-50',
      location: 'Центральный наблюдательный диван',
      date: 'Ноябрь 2025 г.',
      intel: '«Этот взгляд... Он парализует мою волю к тявканью лучше любого строгого поводка. Бегу прятаться за тапки.»',
      koksComment: '«Развелось тут шпицев в синих шлейках. В мое время за такое гавканье лишали ужина. Смотрю на него как на недоразумение.»',
      kroshikComment: '«МЯУ! КОКС ПУГАЕТ! КРОШИК ПЕТЬ ХОЧЕТ ТРА-ЛА-ЛА!»'
    },
    {
      id: 5,
      title: 'Саммит на белом паркете',
      emoji: '🤝🏔️',
      imgUrl: 'src/assets/images/apel_photo_5_1779904090477.png',
      description: 'Кот Кокс и шпиц Апель сидят рядышком на чистом белом полу. Пакт о ненападении.',
      soundType: 'bark',
      colorTheme: 'from-orange-400 to-amber-600',
      bgAccent: 'border-orange-300 text-orange-800 bg-orange-50',
      location: 'Белая площадь (Гостиная)',
      date: 'Декабрь 2025 г.',
      intel: '«Важнейший момент в истории! Великое выравнивание сил. Мы сели бок о бок. Была достигнута договоренность: кот не трогает мой хвост, я не выдаю его места ночной заточки ковров.»',
      koksComment: '«Я сел там только из-за того, что пол подогревался. А этот рыжий пристроился рядом и слюни пускал. Но ладно, фотогенично.»',
      kroshikComment: '«ДВА СТРАННЫХ ЗВЕРЯ! КРОШИК НАВЕРХУ ВСЁ ВИДИТ! ХОРОШИЙ ДЕНЬ!»'
    },
    {
      id: 6,
      title: 'Патруль воздушных границ',
      emoji: '🕌🦖',
      imgUrl: 'src/assets/images/apel_photo_6_1779904111159.png',
      description: 'Кот Кокс сидит у клетки, пока зеленый попугай наблюдает сверху.',
      soundType: 'crunch',
      colorTheme: 'from-zinc-400 to-neutral-600',
      bgAccent: 'border-zinc-400 text-zinc-900 bg-zinc-50',
      location: 'Кабинет надсмотрщика (Кухня)',
      date: 'Январь 2026 г.',
      intel: '«Кот у клетки 2.0. Они явно замышляют что-то незаконное со сдачами сушек. Веду наружное наблюдение из-под обеденного стола.»',
      koksComment: '«Мы обсуждали тарифы на отопление. Попугаи знают в этом толк, они же из тропиков. Шпицам не понять.»',
      kroshikComment: '«ПРИВЕТ ШПИОНУ! КРОШИК ГРОМКИЙ! ТРРРРЯВ!»'
    },
    {
      id: 7,
      title: 'Генеральный инструктаж ВВС',
      emoji: '🦜👮‍♀️',
      imgUrl: 'src/assets/images/apel_photo_7_1779904128913.png',
      description: 'Мама Джекки держит Крошика на пальце, а Апель преданно и удивленно заглядывает снизу вверх.',
      soundType: 'bark',
      colorTheme: 'from-teal-400 to-indigo-600',
      bgAccent: 'border-teal-300 text-teal-800 bg-indigo-50',
      location: 'КПП Мамы Джекки',
      date: 'Февраль 2026 г.',
      intel: '«Мама Джекки держит птицу! Птица летает, птица кричит, почему тогда мне нельзя летать? Я внимательно слежу за обоими глазами-пуговками. Если Крошик сделает лишний взмах — пресеку лаем!»',
      koksComment: '«Подлизы. Сплошной союз флоры и фауны против одного вечно голодного кота.»',
      kroshikComment: '«МАМА ДЖЕККИ ХОРОШАЯ! КРОШИК НА ПАЛЬЧИКЕ! АПЕЛЬ — СТРЕЛОК, ТЯВК-ТЯВК!»'
    },
    {
      id: 8,
      title: 'Властитель Колена Храброго',
      emoji: '🦵🦜',
      imgUrl: 'src/assets/images/apel_photo_8_1779904145449.png',
      description: 'Крошик величественно восседает на колене папы Миши. Крупный план авиатора.',
      soundType: 'crunch',
      colorTheme: 'from-cyan-400 to-emerald-600',
      bgAccent: 'border-cyan-300 text-cyan-800 bg-cyan-50',
      location: 'Аэродром «Левое Колено папы Миши»',
      date: 'Март 2026 г.',
      intel: '«У него лапы цепкие, а у меня хвостик колечком. Он сидит высоко — считает себя королем мира. Но диван-то всё равно принадлежит мне!»',
      koksComment: '«Пассажир без билета занял вип-место на коленке папы Миши. Если бы не хозяйский гнев, я бы провел дезинфекцию.»',
      kroshikComment: '«ЭТО МОЯ ГОРА! КРОШИК — ЦАРЬ! КОКС, НЕ СМОТРИ, СЪЕМ СУШКУ ЧАО!»'
    },
    {
      id: 9,
      title: 'Сладкая Булка атакует Маму Джекки',
      emoji: '🛏️🐶🍳',
      imgUrl: 'src/assets/images/apel_photo_9_1779904162178.png',
      description: 'Утренний ритуал любви: шпиц лежит прямо на лице мамы Джекки в кровати, лижет щеку.',
      soundType: 'bark',
      colorTheme: 'from-rose-300 to-pink-500',
      bgAccent: 'border-pink-300 text-rose-900 bg-rose-50/30',
      location: 'Королевское ложе мамы Джекки',
      date: 'Апрель 2026 г.',
      intel: '«Идеальная диспозиция: я лежу у мамы Джекки на груди, хвостик щекочет ей нос, язык полирует щеки. Просыпайся, время 6:15 утра, пора резать сыр на одинаковые кубики!»',
      koksComment: '«Отвратительно слюнявый будильник. Я бужу гораздо интеллигентнее — просто сажусь горлом на дыхательные пути мамы.»',
      kroshikComment: '«ВСТАВАЙ! КРОШИК ХОЧЕТ ЧАЙ! ПОДЪЕМ, ЛЕНТЯИ!»'
    },
    {
      id: 10,
      title: 'Дачный Совет на Закате',
      emoji: '🏡🌇❤️',
      imgUrl: 'src/assets/images/apel_photo_10_1779904183317.png',
      description: 'Кокс и Апель бок о бок на деревянном крыльце загородного дома на закате солнца.',
      soundType: 'crunch',
      colorTheme: 'from-amber-400 to-rose-700',
      bgAccent: 'border-amber-400 text-amber-950 bg-amber-50/50',
      location: 'Дачная веранда умиротворения',
      date: 'Май 2026 г.',
      intel: '«Самый тихий час года. Мы сидим с Коксом на деревянном крыльце на закате. Вокруг пахнет соснами, шашлыком и беззаботным летом. В такие минуты я даже прощаю ему украденный вчера сухарик.»',
      koksComment: '«Тишина, сверчки поют. Рыжий молчит, уставившись на солнце. Да, признаю, в этот момент он выглядит почти приличным псом.»',
      kroshikComment: '«КРОШИК ДОМА! ЗАБОТА, КУХНЯ, ОРЕХИ! ВСЕ ВМЕСТЕ ВЫ ЧУДЕСНЫЕ!»'
    }
  ];

  // Likes memory tracker
  const photoLikes = {
    0: 142, 1: 189, 2: 245, 3: 112, 4: 310, 5: 198, 6: 121, 7: 177, 8: 98, 9: 289, 10: 341
  };
  
  // Comments memory tracker
  const photoComments = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: []
  };

  // Build Polaroids dynamically
  const polaroidsContainer = document.getElementById('polaroids-grid');
  const rotationsClasses = ['-rotate-2 hover:rotate-1', 'rotate-3 hover:rotate-0', 'rotate-1 hover:-rotate-2', '-rotate-3 hover:-rotate-1', 'rotate-2 hover:-rotate-1'];

  if (polaroidsContainer) {
    photoMoments.forEach((photo, index) => {
      const rotClass = rotationsClasses[index % rotationsClasses.length];
      const card = document.createElement('div');
      card.className = `w-full max-w-[280px] bg-white border border-[#eae2d5] p-3.5 pb-6 rounded-xs shadow-md transition-all cursor-pointer transform ${rotClass} hover:scale-105 hover:shadow-xl flex flex-col justify-between`;
      card.id = `polaroid-card-${photo.id}`;

      card.innerHTML = `
        <div class="aspect-square w-full rounded-xs bg-gradient-to-tr ${photo.colorTheme} relative overflow-hidden group select-none">
          <!-- Real image -->
          <img src="${photo.imgUrl}" alt="${photo.title}" class="w-full h-full object-cover transition-opacity duration-300" onerror="this.classList.add('hidden'); this.nextElementSibling.classList.remove('hidden')" />
          
          <!-- Fallback customized element -->
          <div class="hidden absolute inset-0 bg-gradient-to-tr ${photo.colorTheme} flex flex-col items-center justify-center p-4 text-center text-white">
            <div class="absolute inset-0 bg-black/10 opacity-30 pattern-bg"></div>
            <span class="text-5xl md:text-6xl mb-3 filter drop-shadow z-10 select-none transform group-hover:scale-110 transition-transform">
              ${photo.emoji}
            </span>
            <span class="text-[8px] font-mono font-bold tracking-widest uppercase bg-white/20 border border-white/25 px-2 py-0.5 rounded-full z-10 backdrop-blur-md">
              ФОТОСНИМОК #${photo.id + 1}
            </span>
            <div class="mt-2 text-[11px] font-semibold px-2 leading-snug tracking-normal z-10 opacity-90 line-clamp-2">
              ${photo.title}
            </div>
          </div>
          <span class="absolute top-2 right-2 text-xl filter drop-shadow z-20">🐾</span>
        </div>
        
        <div class="pt-4 flex flex-col justify-between items-center text-center">
          <span class="font-serif font-bold text-sm text-amber-950 flex items-center gap-1 leading-tight">
            🔍 ${photo.title}
          </span>
          <p class="text-[9px] text-amber-900/60 font-mono italic mt-1 uppercase tracking-wider">
            ${photo.date}
          </p>
          <div class="flex items-center justify-between w-full mt-4 bg-amber-50/50 p-1.5 rounded-lg border border-amber-100/60">
            <button class="like-photo-btn flex items-center gap-1 bg-white hover:bg-rose-50 border border-amber-100 hover:border-rose-200 py-1 px-2.5 rounded-md text-[9px] font-mono font-bold text-rose-600 transition-all active:scale-95" data-id="${photo.id}">
              <i data-lucide="heart" class="w-3 h-3 fill-current text-rose-500 animate-pulse"></i>
              <span class="likes-text">${photoLikes[photo.id]} ЛАПОК</span>
            </button>
            <div class="text-[10px] font-mono text-amber-800 flex items-center gap-0.5">
              <i data-lucide="message-square" class="w-3 h-3 text-amber-500"></i>
              <span class="comments-count">Читать (${3 + photoComments[photo.id].length})</span>
            </div>
          </div>
        </div>
      `;

      // Prevent card click when clicking the like button
      const likeBtn = card.querySelector('.like-photo-btn');
      likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = photo.id;
        photoLikes[pid] += 1;
        card.querySelector('.likes-text').innerText = `${photoLikes[pid]} ЛАПОК`;
        
        if (photo.soundType === 'bark') playBark();
        else playCrunch();
      });

      // Card clicks open Modal
      card.addEventListener('click', () => {
        openModalFor(photo);
      });

      polaroidsContainer.appendChild(card);
    });
  }

  // Modal elements
  const photoModal = document.getElementById('photo-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalFooterClose = document.getElementById('modal-footer-close');
  const modalHeader = document.getElementById('modal-header');
  const modalHeading = document.getElementById('modal-title');
  const modalMeta = document.getElementById('modal-meta');
  const modalDesc = document.getElementById('modal-description');
  const modalSpitzIntel = document.getElementById('modal-intel');
  const modalKoksComment = document.getElementById('modal-koks-comment');
  const modalKroshikComment = document.getElementById('modal-kroshik-comment');
  const reviewNameInput = document.getElementById('reviewer-name-input');
  const commentTextInput = document.getElementById('comment-text-input');
  const submitCommentBtn = document.getElementById('modal-submit-comment');
  const commentsListContainer = document.getElementById('modal-comments-list');

  let activePhotoInModal = null;

  function openModalFor(photo) {
    if (!photoModal) return;
    activePhotoInModal = photo;

    // Remove gradient classes on header and add matching one
    modalHeader.className = `p-6 bg-gradient-to-r ${photo.colorTheme} text-white relative`;
    modalHeading.innerText = `${photo.emoji} ${photo.title}`;
    modalMeta.innerText = `📍 ${photo.location} • 📅 ${photo.date}`;
    modalDesc.innerText = photo.description;
    modalSpitzIntel.innerText = photo.intel;
    modalKoksComment.innerText = photo.koksComment;
    modalKroshikComment.innerText = photo.kroshikComment;

    // Load active reviews
    refreshModalComments();

    // Toggle Modal visibility
    photoModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    lucide.createIcons();
  }

  function closeModal() {
    if (!photoModal) return;
    photoModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    activePhotoInModal = null;
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalFooterClose) modalFooterClose.addEventListener('click', closeModal);

  function refreshModalComments() {
    if (!activePhotoInModal || !commentsListContainer) return;
    const pid = activePhotoInModal.id;

    // Hardcoded items
    let commentsHTML = `
      <div class="text-xs bg-white border border-amber-100 p-2.5 rounded-lg shadow-sm">
        <span class="font-bold text-amber-950 block">Мама Джекки:</span>
        <span class="text-amber-900/85 font-sans">О боже, это самый милый момент в истории планеты Земля! Реву от умиления ❤️🥺</span>
      </div>
      <div class="text-xs bg-white border border-amber-100 p-2.5 rounded-lg shadow-sm">
        <span class="font-bold text-amber-950 block">Папа Миша:</span>
        <span class="text-amber-900/85 font-sans">Ага, мило, а кто теперь будет чистить салон от собачьей и кошачьей шерсти? 😂</span>
      </div>
      <div class="text-xs bg-white border border-amber-100 p-2.5 rounded-lg shadow-sm">
        <span class="font-bold text-amber-950 block">Сын Тёма:</span>
        <span class="text-amber-900/85 font-sans">Апель, ты супер-пупер звезда! Пойдём гонять мяч во дворе, только чур Кокса не звать! ⚽⭐️</span>
      </div>
    `;

    // Render user custom comments
    photoComments[pid].forEach(comm => {
      commentsHTML += `
        <div class="text-xs bg-amber-50/40 border border-amber-200/60 p-2.5 rounded-lg shadow-sm animate-fade-in">
          <span class="font-bold text-amber-950 block">${comm.author}:</span>
          <span class="text-amber-900/85 font-sans">${comm.text}</span>
        </div>
      `;
    });

    commentsListContainer.innerHTML = commentsHTML;
    
    // Update polaroid reader count
    const cardEl = document.getElementById(`polaroid-card-${pid}`);
    if (cardEl) {
      cardEl.querySelector('.comments-count').innerText = `Читать (${3 + photoComments[pid].length})`;
    }
  }

  if (submitCommentBtn) {
    submitCommentBtn.addEventListener('click', () => {
      if (!activePhotoInModal || !commentTextInput) return;
      const text = commentTextInput.value.trim();
      if (!text) return;

      const author = reviewNameInput.value.trim() || 'Анонимный Ценитель';
      photoComments[activePhotoInModal.id].push({ author, text });

      commentTextInput.value = '';
      refreshModalComments();
    });

    // Enter key submits comments
    commentTextInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        submitCommentBtn.click();
      }
    });
  }


  // --- 5. Allies / Koks' Anger Meter & Kroshik ---
  const koksRageInput = document.getElementById('koks-rage-slider');
  const koksRageVal = document.getElementById('koks-rage-value');
  const koksStatusMsg = document.getElementById('koks-status-msg');

  function getKoksMessage(rage) {
    if (rage <= 30) return '💤 Кокс дрыхнет на хозяйской черной футболке. Угроза минимальна.';
    if (rage <= 60) return '👁️ Кокс сузил глаза до ниточек. Тщательно анализирует верстку этого сайта.';
    if (rage <= 85) return '😾 Внимание! Кокс точит когти о ножку стола под гимн СССР. Возможны диверсии.';
    return '🚨 КРАСНЫЙ КОД! В 3:00 ночи ожидается падение вазы и бег по стене над вашей кроватью!';
  }

  if (koksRageInput && koksRageVal && koksStatusMsg) {
    koksRageInput.addEventListener('input', (e) => {
      const rage = parseInt(e.target.value, 10);
      koksRageVal.innerText = `${rage}%`;
      koksStatusMsg.innerText = getKoksMessage(rage);
    });
  }

  // Kroshik the parrot
  const pokeParrotBtn = document.getElementById('btn-poke-parrot');
  const parrotDialogue = document.getElementById('parrot-speech');
  if (pokeParrotBtn && parrotDialogue) {
    pokeParrotBtn.addEventListener('click', () => {
      playBark(); // triggers dog bark sound representing his reply
      const phrases = [
        'АПЕЛЬ! СЫР! СЫР СЪЕЛИ!',
        'Крошик — босс! Кокс — воришка!',
        'Пиастры! Тьфу, то есть Сушки!',
        'Хозяин, собака опять на диване!',
        'ШУРР-ШУРР! ОТКРЫВАЙ ПАКЕТ!'
      ];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      parrotDialogue.innerText = `"${randomPhrase}"`;

      // Visual feedback trigger
      pokeParrotBtn.classList.add('scale-95');
      setTimeout(() => pokeParrotBtn.classList.remove('scale-95'), 150);
    });
  }


  // --- 6. Chronos Diary / Schedule Section timelineSelector ---
  const scheduleItems = [
    {
      time: '08:00',
      title: 'Утренний Экзорцизм',
      emoji: '👁️',
      description: 'Медленное заглядывание в душу спящему хозяину с расстояния 3 см. Нос к носу. Если хозяин не просыпается — вздыхает со звуком разбитого корыта и облизывает подбородок.',
      energyLevel: 2,
      stat: 'Фокусировка на сырках: 150%'
    },
    {
      time: '10:00',
      title: 'Влажная Проверка',
      emoji: '🐾',
      description: 'Тщательный обход свежевымытого мамой ламината. Метод тестирования: печатание ровных, влажных следов от лапок в формате 4К. Ставит оценку 5 из 5 мокрых попок.',
      energyLevel: 4,
      stat: 'Тест чистоты пола: Пройдено'
    },
    {
      time: '13:00',
      title: 'Режим «Хлебушек»',
      emoji: '🍞',
      description: 'Сон в 15 невероятных позах, включая культовую «пузом вверх со сложенными лапками». Занимает 120% площади подушки. Любые попытки согнать наказываются сонным потягиванием.',
      energyLevel: 1,
      stat: 'Уровень милоты: Избыточен'
    },
    {
      time: '16:00',
      title: 'Слуховая Инспекция',
      emoji: '👂',
      description: 'Мгновенное сканирование шуршания полиэтиленовых кульков в зоне кухни. Если в радиусе 100 метров открылся сырок «Дружба», Апель телепортируется на звук со скоростью O(1).',
      energyLevel: 5,
      stat: 'Слух: Супернаучный'
    },
    {
      time: '20:00',
      title: 'Ночной Тыгыдык и Сыр',
      emoji: '⚡',
      description: 'Вечерний спорткомплекс. Включает бег жопкой вперед, прыжки на кровать с разворотом, гавканье на пылесос и вымогательство финальной ночной сушки. Кот Кокс часто ассистирует.',
      energyLevel: 5,
      stat: 'Максимальная скорость: 45 км/ч'
    }
  ];

  const schedulePanel = document.getElementById('schedule-detail-panel');

  function renderScheduleCard(time) {
    if (!schedulePanel) return;
    const item = scheduleItems.find(s => s.time === time);
    if (!item) return;

    let energyStars = '';
    for (let i = 0; i < 5; i++) {
      energyStars += `<i data-lucide="star" class="w-4 h-4 fill-current ${i < item.energyLevel ? 'text-amber-500' : 'text-amber-200'}"></i>`;
    }

    schedulePanel.innerHTML = `
      <div class="w-full bg-gradient-to-b from-amber-50/40 to-amber-50/70 p-6 rounded-2xl border border-amber-100/70 space-y-4 relative overflow-hidden animate-fade-in">
        <div class="absolute -top-16 -right-16 w-36 h-36 bg-amber-100/20 rounded-full select-none"></div>
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <span class="text-4xl p-2.5 bg-white rounded-2xl shadow-sm border border-amber-100">${item.emoji}</span>
            <div>
              <span class="text-[10px] font-mono font-extrabold text-amber-700 uppercase bg-amber-100/60 px-1.5 py-0.5 rounded">
                Время: ${item.time}
              </span>
              <h4 class="text-lg md:text-xl font-black text-amber-950 font-serif tracking-tight mt-1">
                ${item.title}
              </h4>
            </div>
          </div>
        </div>

        <p class="text-xs md:text-sm text-amber-900/90 leading-relaxed font-sans border-l-4 border-amber-500 pl-3">
          ${item.description}
        </p>

        <div class="grid grid-cols-2 gap-4 pt-3 border-t border-dashed border-amber-200">
          <div>
            <span class="text-[9px] font-mono text-amber-800/60 uppercase block font-bold">Уровень энергии:</span>
            <div class="flex gap-1 mt-1 text-amber-500">
              ${energyStars}
            </div>
          </div>
          <div>
            <span class="text-[9px] font-mono text-amber-800/60 uppercase block font-bold">Ключевая статистика:</span>
            <span class="text-xs font-bold text-amber-950 font-mono block mt-1.5">${item.stat}</span>
          </div>
        </div>
      </div>
    `;
    lucide.createIcons();
  }

  // Set up hour button clicks
  const hourButtons = document.querySelectorAll('.schedule-btn');
  hourButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deactivate others
      hourButtons.forEach(b => {
        b.classList.remove('bg-amber-100/90', 'border-amber-300', 'shadow-sm', 'translate-x-2');
        b.classList.add('bg-amber-50/20', 'border-amber-100/70');
      });

      // Activate clicked
      btn.classList.add('bg-amber-100/90', 'border-amber-300', 'shadow-sm', 'translate-x-2');
      btn.classList.remove('bg-amber-50/20', 'border-amber-100/70');

      const targetTime = btn.getAttribute('data-time');
      renderScheduleCard(targetTime);
    });
  });

  // Initial load
  renderScheduleCard('08:00');


  // --- 7. Treat Eating Simulator ---
  const savedFed = localStorage.getItem('apel_fed_count');
  let fedCount = savedFed ? parseInt(savedFed, 10) : 482;
  let satisfaction = 85;
  const dogHead = document.getElementById('simulator-dog-head');
  const satisfactionBar = document.getElementById('satisfaction-progress');
  const satisfactionVal = document.getElementById('satisfaction-value');
  const totalFedText = document.getElementById('total-fed-count');
  const lastFedText = document.getElementById('last-fed-text');
  const simulatorParticles = document.getElementById('simulator-particles');
  const resetTreatsBtn = document.getElementById('btn-reset-treats');

  const foodTops = {
    gauda: { name: 'Сырный Слайс «Гауда»', emoji: '🧀', power: 5 },
    lung: { name: 'Сушеное Легкое говяжье', emoji: '🥩', power: 8 },
    sweetbun: { name: 'Плюшка «Сладкая булочка»', emoji: '🥯', power: 12 },
    kroshik: { name: 'Развед-Сушка Крошика', emoji: '🥨', power: -2 }
  };

  function spawnSnackParticle(emoji) {
    if (!simulatorParticles) return;
    const particle = document.createElement('div');
    particle.className = 'absolute text-4xl select-none transition-all duration-1000 ease-out pointer-events-none';
    particle.innerText = emoji;
    
    // Position near Center of dog-head
    particle.style.left = '50%';
    particle.style.top = '50%';
    particle.style.transform = 'translate(-50%, -50%) scale(0.5)';
    simulatorParticles.appendChild(particle);

    setTimeout(() => {
      const xOffset = Math.random() * 120 - 60;
      const yOffset = -40 - Math.random() * 50;
      const rotate = Math.random() * 360;
      particle.style.transform = `translate(calc(-50% + ${xOffset}px), calc(-50% + ${yOffset}px)) scale(1.5) rotate(${rotate}deg)`;
      particle.style.opacity = '0';
    }, 20);

    setTimeout(() => particle.remove(), 1100);
  }

  function triggerFeed(foodKey) {
    const food = foodTops[foodKey];
    if (!food) return;

    playCrunch();

    // Trigger chew anim
    if (dogHead) {
      dogHead.classList.remove('chewing');
      void dogHead.offsetWidth; // Force reflow
      dogHead.classList.add('chewing');
      setTimeout(() => dogHead.classList.remove('chewing'), 900);
    }

    // Spawn crumbs visually
    spawnSnackParticle(food.emoji);

    // Update Counters
    fedCount += 1;
    localStorage.setItem('apel_fed_count', fedCount.toString());
    satisfaction = Math.min(100, Math.max(0, satisfaction + food.power));

    // Update fields
    if (totalFedText) totalFedText.innerText = `${fedCount} шт.`;
    if (satisfactionVal) satisfactionVal.innerText = `${satisfaction}%`;
    if (lastFedText) lastFedText.innerText = `Последний хруст: ${food.name}`;
    
    if (satisfactionBar) {
      satisfactionBar.style.width = `${satisfaction}%`;
      // Colors based on full index
      satisfactionBar.className = 'h-full rounded-full transition-all duration-300';
      if (satisfaction > 90) {
        satisfactionBar.classList.add('bg-green-500');
      } else if (satisfaction > 50) {
        satisfactionBar.classList.add('bg-amber-500');
      } else {
        satisfactionBar.classList.add('bg-rose-500');
      }
    }
  }

  // Bind feed actions
  document.querySelectorAll('.feed-toy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const foodKey = btn.getAttribute('data-food');
      triggerFeed(foodKey);
    });
  });

  if (resetTreatsBtn) {
    resetTreatsBtn.addEventListener('click', () => {
      fedCount = 482;
      satisfaction = 100;
      localStorage.setItem('apel_fed_count', '482');
      if (totalFedText) totalFedText.innerText = '482 шт.';
      if (satisfactionVal) satisfactionVal.innerText = '100%';
      if (lastFedText) lastFedText.innerText = 'Последний хруст: Сброшено';
      if (satisfactionBar) {
        satisfactionBar.style.width = '100%';
        satisfactionBar.className = 'h-full rounded-full transition-all duration-300 bg-green-500';
      }
    });
  }


  // --- 8. Certificate Generator Office ---
  const certForm = document.getElementById('certificate-form');
  const candidateNameInput = document.getElementById('cert-candidate-name');
  const certRoleSelect = document.getElementById('cert-role-select');
  const certQuirkSelect = document.getElementById('cert-quirk-select');
  const certLoyaltyInput = document.getElementById('cert-loyalty-slider');
  const certLoyaltyVal = document.getElementById('cert-loyalty-value');
  const btnGenerateText = document.getElementById('btn-generate-text');

  const certPlaceholder = document.getElementById('cert-placeholder');
  const certResultHolder = document.getElementById('cert-result-holder');
  
  // Certificate Fields
  const certSerial = document.getElementById('cert-doc-serial');
  const certDate = document.getElementById('cert-doc-date');
  const certShowcaseName = document.getElementById('cert-showcase-name');
  const certShowcaseRole = document.getElementById('cert-showcase-role');
  const certShowcaseQuirk = document.getElementById('cert-showcase-quirk');
  const certShowcaseLoyalty = document.getElementById('cert-showcase-loyalty');
  const btnResetCert = document.getElementById('btn-cert-reset');

  if (certLoyaltyInput && certLoyaltyVal) {
    certLoyaltyInput.addEventListener('input', (e) => {
      certLoyaltyVal.innerText = `${e.target.value}%`;
    });
  }

  if (certForm) {
    certForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = candidateNameInput.value.trim();
      if (!n) return;

      playBark();

      // Show spinner in submit button
      if (btnGenerateText) {
        btnGenerateText.innerHTML = `
          <i data-lucide="sparkles" class="w-4 h-4 animate-spin text-amber-200"></i>
          Печатаем грамоту...
        `;
        lucide.createIcons();
      }

      setTimeout(() => {
        // Reset button
        if (btnGenerateText) {
          btnGenerateText.innerHTML = `
            <i data-lucide="file-text" class="w-4 h-4"></i>
            Пожаловать грамоту!
          `;
          lucide.createIcons();
        }

        // Fill data
        const date = new Date().toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        const serialCode = `APEL-${Math.floor(100000 + Math.random() * 900000)}`;

        if (certSerial) certSerial.innerText = `№ ${serialCode} // ОТ ${date}`;
        if (certShowcaseName) certShowcaseName.innerText = n;
        if (certShowcaseRole) certShowcaseRole.innerText = certRoleSelect.value;
        if (certShowcaseQuirk) {
          const selectedOption = certQuirkSelect.options[certQuirkSelect.selectedIndex];
          certShowcaseQuirk.innerText = selectedOption.text.split(' ').slice(1).join(' '); // Slice the emoji for fine look
        }
        if (certShowcaseLoyalty) certShowcaseLoyalty.innerText = `${certLoyaltyInput.value}%`;

        // Switch templates
        if (certPlaceholder) certPlaceholder.classList.add('hidden');
        if (certResultHolder) certResultHolder.classList.remove('hidden');

      }, 1200);
    });
  }

  if (btnResetCert) {
    btnResetCert.addEventListener('click', () => {
      if (candidateNameInput) candidateNameInput.value = '';
      if (certRoleSelect) certRoleSelect.selectedIndex = 0;
      if (certQuirkSelect) certQuirkSelect.selectedIndex = 0;
      if (certLoyaltyInput) {
        certLoyaltyInput.value = 100;
        certLoyaltyVal.innerText = '100%';
      }
      if (certPlaceholder) certPlaceholder.classList.remove('hidden');
      if (certResultHolder) certResultHolder.classList.add('hidden');
    });
  }


  // --- 9. FAQ Accordion dropdowns ---
  const faqButtons = document.querySelectorAll('.faq-toggle-btn');
  faqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const dropdown = btn.nextElementSibling;
      const chevron = btn.querySelector('.chevron-icon');
      const isClosed = dropdown.classList.contains('hidden');

      // Close all other dropdowns
      document.querySelectorAll('.faq-answer-block').forEach(ans => ans.classList.add('hidden'));
      document.querySelectorAll('.chevron-icon').forEach(chev => chev.classList.remove('rotate-180'));

      if (isClosed) {
        dropdown.classList.remove('hidden');
        chevron.classList.add('rotate-180');
      } else {
        dropdown.classList.add('hidden');
        chevron.classList.remove('rotate-180');
      }
    });
  });


  // --- 10. Anchor Scrolling ---
  document.querySelectorAll('a[href^="#"], button[data-scroll]').forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href') ? this.getAttribute('href').substring(1) : this.getAttribute('data-scroll');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Start Lucide
  lucide.createIcons();
});

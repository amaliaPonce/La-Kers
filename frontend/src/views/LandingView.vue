<template>
  <div class="landing-shell relative overflow-hidden bg-[#f8f5ef] text-slate-900">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute left-[-12%] top-[-8%] h-[28rem] w-[28rem] rounded-full bg-[#c96a37]/14 blur-[120px]"></div>
      <div class="absolute right-[-10%] top-[18rem] h-[30rem] w-[30rem] rounded-full bg-[#1f4f46]/12 blur-[130px]"></div>
      <div class="absolute bottom-[-10rem] left-[18%] h-[24rem] w-[24rem] rounded-full bg-[#d7a35d]/16 blur-[120px]"></div>
      <div class="landing-grid absolute inset-0 opacity-40"></div>
    </div>

    <header class="relative z-50 border-b border-white/60 bg-[#f8f5ef]/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-[90rem] items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <router-link to="/" class="flex shrink-0 items-center">
          <BrandMark icon-only icon-class="h-10 w-10 sm:h-11 sm:w-11" />
        </router-link>

        <nav class="hidden items-center gap-7 text-sm text-slate-600 lg:flex">
          <a href="#problema" class="transition hover:text-[#1f4f46]">Problema</a>
          <a href="#precios" class="transition hover:text-[#1f4f46]" @click="handlePricingClick('header_nav')">Precios</a>
          <a href="#faq" class="transition hover:text-[#1f4f46]">FAQ</a>
        </nav>

        <div class="flex shrink-0 items-center gap-2 sm:gap-3">
          <router-link
            to="/sign-in"
            class="rounded-full border border-slate-200/80 bg-white/70 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 sm:px-4 sm:text-sm"
            @click="handleLoginClick('header')"
          >
            Iniciar sesión
          </router-link>
          <router-link
            to="/demo"
            class="hidden rounded-full border border-[#d5e4dd] bg-white/80 px-4 py-2 text-sm font-medium text-[#1f4f46] transition hover:border-[#bfd6cd] hover:bg-[#edf6f2] sm:inline-flex"
            @click="handleDemoClick('header')"
          >
            Ver demo
          </router-link>
          <router-link
            to="/sign-up"
            class="rounded-full bg-[#c96a37] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-orange-950/10 transition hover:-translate-y-0.5 hover:bg-[#b85d2d] sm:px-5 sm:py-2.5 sm:text-sm"
            @click="handleRegisterClick('header')"
          >
            <span class="sm:hidden">Gratis</span>
            <span class="hidden sm:inline">Empieza gratis</span>
          </router-link>
        </div>
      </div>
    </header>

    <main class="relative z-10 mx-auto max-w-[90rem] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section class="section-frame overflow-hidden rounded-[34px] px-6 py-6 lg:px-8 lg:py-8">
        <div class="grid gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-center">
          <div class="space-y-8">
            <div class="hero-pill inline-flex items-center rounded-full border border-[#d6c7bb] bg-white/80 font-semibold uppercase text-[#1f4f46] shadow-sm">
              <span class="h-2.5 w-2.5 rounded-full bg-[#c96a37] shadow-[0_0_0_6px_rgba(201,106,55,0.14)]"></span>
              Para propietarios cansados de Excel
            </div>

            <div class="space-y-5">
              <h1 class="max-w-3xl text-4xl font-semibold leading-[0.88] text-slate-900 sm:text-5xl xl:text-[5.25rem]">
                La forma premium de gestionar alquileres con orden real.
              </h1>
              <p class="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Propiedades, pagos, incidencias, contratos, documentos y resumen mensual en una sola plataforma pensada para propietarios.
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <router-link
                to="/sign-up"
                class="col-span-2 inline-flex items-center justify-center rounded-full bg-[#c96a37] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-950/10 transition hover:-translate-y-0.5 hover:bg-[#b85d2d] sm:col-span-1"
                @click="handleRegisterClick('hero_primary')"
              >
                Crear cuenta gratis
              </router-link>
              <router-link
                to="/demo"
                class="inline-flex items-center justify-center rounded-full border border-[#d5e4dd] bg-white/85 px-5 py-3.5 text-center text-sm font-semibold text-[#1f4f46] transition hover:-translate-y-0.5 hover:border-[#bfd6cd] hover:bg-[#edf6f2] sm:px-6"
                @click="handleDemoClick('hero_secondary')"
              >
                Ver demo
              </router-link>
              <a
                href="#precios"
                class="inline-flex items-center justify-center rounded-full border border-[#ead8ca] bg-[#fff4ea] px-5 py-3.5 text-center text-sm font-semibold text-[#8c4d29] transition hover:-translate-y-0.5 hover:bg-[#fff0e2] sm:px-6"
                @click="handlePricingClick('hero_secondary')"
              >
                Ver precios
              </a>
            </div>

          </div>

          <div class="relative mx-auto w-full max-w-[36rem]">
            <article class="relative aspect-square overflow-hidden rounded-[30px] border-2 border-[#1f4f46] shadow-[12px_12px_0_0_rgba(31,79,70,0.16)]">
              <img :src="buildingImage" alt="Edificio residencial moderno" class="h-full w-full object-cover" />
              <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.04),rgba(7,17,31,0.36)_48%,rgba(7,17,31,0.74)_100%)]"></div>
              <div class="absolute bottom-0 left-0 right-0 p-6">
                <p class="inline-flex rounded-full border-2 border-[#f1ba7a] bg-[#fff1e7]/90 px-3 py-1 text-[11px] font-extrabold uppercase text-[#8c4d29]" style="letter-spacing: 0.22em;">Visión clara de cartera</p>
                <p class="mt-3 max-w-sm text-3xl font-semibold leading-[1.02] tracking-[-0.03em] text-white sm:text-4xl">
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="section-frame trust-strip rounded-[30px] px-6 py-6 lg:px-8 lg:py-8" aria-label="Confianza">
        <div class="grid gap-4 xl:grid-cols-[0.74fr_1.26fr] xl:items-stretch">
          <div class="rounded-[24px] border-2 border-[#1f4f46] bg-[#dff3ea] p-6 shadow-[8px_8px_0_0_rgba(31,79,70,0.18)] lg:p-7">
            <p class="text-[11px] font-extrabold uppercase text-[#1f4f46]" style="letter-spacing: 0.24em;">Construido para la operativa real</p>
            <h2 class="mt-4 max-w-[10ch] text-balance text-[2.15rem] font-semibold leading-[0.92] tracking-[-0.04em] text-slate-900 sm:text-[2.45rem]">una forma más seria de gestionar tus alquileres.</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article
              v-for="(item, index) in trustItems"
              :key="item.title"
              class="flex min-h-[12rem] flex-col justify-between rounded-[24px] border-2 p-5"
              :class="trustCardClasses[index]"
            >
              <p class="text-[11px] font-extrabold uppercase" :class="trustTextClasses[index]" style="letter-spacing: 0.18em;">{{ item.title }}</p>
              <p class="trust-claim mt-6 max-w-[11ch]" :class="trustTextClasses[index]">{{ item.value }}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="problema" class="grid gap-6 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
        <article class="rounded-[30px] border-2 border-[#8c4d29] bg-[#fff0e4] px-6 py-6 shadow-[10px_10px_0_0_rgba(140,77,41,0.14)] lg:px-8">
          <p class="inline-flex rounded-full border-2 border-[#c96a37] bg-[#ffd9c7] px-3 py-1 text-[11px] font-extrabold uppercase text-[#8c4d29]" style="letter-spacing: 0.24em;">El coste del caos</p>
          <h2 class="mt-4 max-w-xl text-3xl font-semibold leading-[1.02] tracking-[-0.03em] text-slate-900 sm:text-4xl">
            Si tu operativa depende de hojas sueltas, mensajes y carpetas, pierdes tiempo.
          </h2>
          <p class="mt-4 max-w-xl text-base leading-8 text-slate-700">
            Cuando los cobros, contratos e incidencias viven en herramientas distintas, cada mes empieza con dudas, búsquedas y tareas repetidas.
          </p>

          <div class="mt-8 grid gap-4">
            <article
              v-for="(item, index) in problemItems"
              :key="item.title"
              class="rounded-[24px] border-2 p-5 shadow-[6px_6px_0_0_rgba(15,23,42,0.08)]"
              :class="problemCardClasses[index]"
            >
              <div class="flex items-center gap-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl border-2 bg-white/60" :class="problemIconClasses[index]">
                  <SolidIcon :name="item.icon" class="h-5 w-5" />
                </div>
                <div>
                  <h3 class="trust-claim max-w-[18ch]" :class="problemTextClasses[index]">{{ item.title }}</h3>
                </div>
              </div>
            </article>
          </div>
        </article>

        <article class="relative overflow-hidden rounded-[30px] border-2 border-[#1f4f46] shadow-[10px_10px_0_0_rgba(31,79,70,0.16)]">
          <img :src="documentsImage" alt="Propietaria revisando documentación" class="h-full min-h-[24rem] w-full object-cover" />
          <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.06),rgba(7,17,31,0.54)_48%,rgba(7,17,31,0.88)_100%)]"></div>
        </article>
      </section>

      <section class="px-6 py-6 lg:px-8 lg:py-8">
        <div class="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-stretch">
          <div class="relative h-full overflow-hidden rounded-[28px] border-2 border-[#1f4f46] shadow-[8px_8px_0_0_rgba(31,79,70,0.16)]">
            <img :src="laptopImage" alt="Persona trabajando con portátil en casa" class="h-full min-h-[24rem] w-full object-cover lg:min-h-[100%]" />
            <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,18,34,0.02),rgba(10,18,34,0.7)_100%)]"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6">
              <p class="inline-flex rounded-full border-2 border-[#f1ba7a] bg-[#fff1e7]/90 px-3 py-1 text-[11px] font-extrabold uppercase text-[#8c4d29]" style="letter-spacing: 0.24em;">Ordena tu día a día</p>
              <p class="mt-3 max-w-md text-3xl font-semibold leading-[1.02] tracking-[-0.03em] text-white sm:text-4xl">Menos administración. Más claridad para decidir.</p>
            </div>
          </div>

          <div class="rounded-[28px] border-2 border-[#c96a37] bg-[#fff6ef] p-6 shadow-[8px_8px_0_0_rgba(201,106,55,0.12)] lg:p-7">
            <p class="inline-flex rounded-full border-2 border-[#c96a37] bg-[#ffd9c7] px-3 py-1 text-[11px] font-extrabold uppercase text-[#8c4d29]" style="letter-spacing: 0.24em;">La solución</p>
            <h2 class="mt-4 max-w-2xl text-3xl font-semibold leading-[1.02] tracking-[-0.03em] text-slate-900 sm:text-4xl">
              Todo lo que importa de cada alquiler en un único sistema.
            </h2>
            <p class="mt-4 max-w-2xl text-base leading-8 text-slate-700">
            Sabes qué ha pasado, qué falta y qué toca hacer después sin perseguir información.
            </p>

            <div class="mt-8 grid gap-4 md:grid-cols-2">
              <article
                v-for="(benefit, index) in benefits"
                :key="benefit.title"
                class="rounded-[24px] border-2 p-5 shadow-[6px_6px_0_0_rgba(15,23,42,0.08)]"
                :class="benefitCardClasses[index]"
              >
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl border-2 bg-white/60" :class="benefitIconClasses[index]">
                  <SolidIcon :name="benefit.icon" class="h-5 w-5" />
                </div>
                <h3 class="trust-claim mt-4 max-w-[18ch]" :class="benefitTextClasses[index]">{{ benefit.title }}</h3>
                <p class="mt-2 text-sm leading-7 text-slate-700">{{ benefit.description }}</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-6">
        <div class="grid gap-4 lg:grid-cols-3">
          <article
            v-for="(step, index) in steps"
            :key="step.step"
            class="rounded-[28px] border-2 px-6 py-6 shadow-[8px_8px_0_0_rgba(15,23,42,0.08)]"
            :class="stepCardClasses[index]"
          >
            <div class="flex items-center justify-between gap-4">
              <span class="text-5xl font-semibold" :class="stepNumberClasses[index]">{{ step.step }}</span>
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl border-2 bg-white/60" :class="stepIconClasses[index]">
                <SolidIcon :name="step.icon" class="h-5 w-5" />
              </div>
            </div>
            <h3 class="mt-8 text-2xl font-semibold" :class="stepTextClasses[index]">{{ step.title }}</h3>
            <p class="mt-3 text-sm leading-7 text-slate-700">{{ step.description }}</p>
          </article>
        </div>
      </section>

      <section class="px-6 py-6 lg:px-8 lg:py-8">
        <div class="grid gap-8 xl:grid-cols-[0.86fr_1.14fr] xl:items-start">
          <div class="rounded-[28px] border-2 border-[#c96a37] bg-[#fff7f1] p-6 shadow-[8px_8px_0_0_rgba(201,106,55,0.12)]">
            <p class="inline-flex rounded-full border-2 border-[#c96a37] bg-[#ffd9c7] px-3 py-1 text-[11px] font-extrabold uppercase text-[#8c4d29]" style="letter-spacing: 0.24em;">Comparativa</p>
            <h2 class="mt-4 max-w-xl text-3xl font-semibold text-slate-900 sm:text-4xl">
              Lo que parece barato en Excel suele salir caro en tiempo, errores y estrés.
            </h2>
            <div class="mt-6 overflow-hidden rounded-[24px] border-2 border-[#c96a37] shadow-[6px_6px_0_0_rgba(201,106,55,0.12)]">
              <img :src="comparisonImage" alt="Gestión inmobiliaria con portátil y documentos" class="h-44 w-full object-cover lg:h-48 xl:h-44" />
            </div>
          </div>

          <div class="mx-auto w-full max-w-[46rem]">
            <div class="mx-auto mb-4 flex w-full max-w-[22rem] flex-col items-center gap-3 text-center lg:hidden">
              <p class="text-xs font-extrabold uppercase text-[#8c4d29]" style="letter-spacing: 0.14em;">Comparativa</p>
            </div>

            <div class="mx-auto w-full max-w-[22rem] lg:hidden">
              <div
                class="comparison-carousel overflow-hidden"
                @pointerdown="handleComparisonPointerDown"
                @pointerup="handleComparisonPointerUp"
                @pointercancel="resetComparisonPointer"
              >
                <div class="comparison-carousel__track" :style="{ transform: `translateX(-${comparisonSlideIndex * 100}%)` }">
                  <article
                    v-for="(row, index) in comparisonRows"
                    :key="`mobile-${row.label}`"
                    class="comparison-carousel__slide"
                  >
                    <div class="flex h-full flex-col rounded-[24px] border-2 border-[#efd9ca] bg-white/78 p-4 shadow-[5px_5px_0_0_rgba(140,77,41,0.08)]">
                      <div class="flex items-start gap-3">
                        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-[#c96a37] bg-[#fff0e4] text-sm font-extrabold text-[#8c4d29]">
                          {{ index + 1 }}
                        </span>
                        <div>
                          <p class="text-[11px] font-extrabold uppercase text-[#8c4d29]" style="letter-spacing: 0.16em;">Operativa</p>
                          <h3 class="mt-1 text-xl font-semibold leading-tight text-slate-900">{{ row.label }}</h3>
                        </div>
                      </div>

                      <div class="mt-4 grid gap-3">
                        <div class="rounded-[20px] border-2 border-[#efd9ca] bg-[#fff7f1] p-4">
                          <div class="flex items-center gap-2">
                            <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ffe0d1] text-[#c96a37]">
                              <SolidIcon name="warning" class="h-4 w-4" />
                            </span>
                            <p class="text-xs font-extrabold uppercase text-[#8c4d29]" style="letter-spacing: 0.12em;">Métodos antiguos</p>
                          </div>
                          <p class="mt-3 text-sm font-medium leading-7 text-slate-600">{{ row.legacy }}</p>
                        </div>

                        <div class="rounded-[20px] border-2 border-[#b9ddd1] bg-[#edf8f3] p-4 shadow-[4px_4px_0_0_rgba(31,79,70,0.08)]">
                          <div class="flex items-center gap-2">
                            <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-[#dff3ea] text-[#1f4f46]">
                              <SolidIcon name="check" class="h-4 w-4" />
                            </span>
                            <p class="text-xs font-extrabold uppercase text-[#1f4f46]" style="letter-spacing: 0.12em;">Con {{ APP_NAME }}</p>
                          </div>
                          <p class="mt-3 text-sm font-semibold leading-7 text-[#1f4f46]">{{ row.modern }}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>

              <div class="mt-4 flex items-center justify-center gap-2">
                <button
                  v-for="(_, index) in comparisonRows"
                  :key="`dot-${index}`"
                  type="button"
                  class="h-2.5 rounded-full transition-all"
                  :class="comparisonSlideIndex === index ? 'w-8 bg-[#1f4f46]' : 'w-2.5 bg-[#d9c6b8]'"
                  :aria-label="`Ir a la comparativa ${index + 1}`"
                  @click="comparisonSlideIndex = index"
                />
              </div>
            </div>

            <div class="hidden gap-4 lg:grid lg:grid-cols-2">
              <article
                v-for="(row, index) in comparisonRows"
                :key="row.label"
                class="flex h-full flex-col rounded-[24px] border-2 border-[#efd9ca] bg-white/78 p-4 shadow-[5px_5px_0_0_rgba(140,77,41,0.08)]"
              >
                <div class="flex items-start gap-3">
                  <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-[#c96a37] bg-[#fff0e4] text-sm font-extrabold text-[#8c4d29]">
                    {{ index + 1 }}
                  </span>
                  <div>
                    <p class="text-[11px] font-extrabold uppercase text-[#8c4d29]" style="letter-spacing: 0.16em;">Operativa</p>
                    <h3 class="mt-1 text-xl font-semibold leading-tight text-slate-900">{{ row.label }}</h3>
                  </div>
                </div>

                <div class="mt-4 grid gap-3">
                  <div class="rounded-[20px] border-2 border-[#efd9ca] bg-[#fff7f1] p-4">
                    <div class="flex items-center gap-2">
                      <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ffe0d1] text-[#c96a37]">
                        <SolidIcon name="warning" class="h-4 w-4" />
                      </span>
                      <p class="text-xs font-extrabold uppercase text-[#8c4d29]" style="letter-spacing: 0.12em;">Métodos antiguos</p>
                    </div>
                    <p class="mt-3 text-sm font-medium leading-7 text-slate-600">{{ row.legacy }}</p>
                  </div>

                  <div class="rounded-[20px] border-2 border-[#b9ddd1] bg-[#edf8f3] p-4 shadow-[4px_4px_0_0_rgba(31,79,70,0.08)]">
                    <div class="flex items-center gap-2">
                      <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-[#dff3ea] text-[#1f4f46]">
                        <SolidIcon name="check" class="h-4 w-4" />
                      </span>
                      <p class="text-xs font-extrabold uppercase text-[#1f4f46]" style="letter-spacing: 0.12em;">Con {{ APP_NAME }}</p>
                    </div>
                    <p class="mt-3 text-sm font-semibold leading-7 text-[#1f4f46]">{{ row.modern }}</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="precios" ref="pricingSectionRef" class="space-y-6">
        <div class="pricing-shell section-frame overflow-hidden rounded-[34px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div class="mx-auto mb-5 flex w-full max-w-[23rem] flex-col items-center gap-3 text-center lg:hidden">
            <p class="text-xs font-extrabold uppercase text-[#8c4d29]" style="letter-spacing: 0.16em;">Planes</p>
          </div>

          <div class="lg:hidden">
            <div
              class="comparison-carousel overflow-hidden"
              @pointerdown="handlePricingPointerDown"
              @pointerup="handlePricingPointerUp"
              @pointercancel="resetPricingPointer"
            >
              <div class="comparison-carousel__track" :style="{ transform: `translateX(-${pricingSlideIndex * 100}%)` }">
                <article class="comparison-carousel__slide">
                  <div class="flex h-full flex-col rounded-[28px] border-2 border-[#1f4f46] bg-[linear-gradient(180deg,#f8fcfa_0%,#e8f7f0_100%)] p-5 shadow-[0_20px_44px_rgba(31,79,70,0.12)]">
                    <div>
                      <p class="inline-flex rounded-full border-2 border-[#1f4f46] bg-white/90 px-3 py-1 text-[11px] font-extrabold uppercase text-[#1f4f46]" style="letter-spacing: 0.18em;">Starter</p>
                      <h3 class="mt-4 text-[2rem] font-semibold leading-[0.95] text-slate-900">Empieza gratis.</h3>
                      <div class="mt-4 flex items-center justify-between rounded-[22px] border border-[#9fcdbd] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(239,249,244,0.98))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_24px_rgba(31,79,70,0.08)]">
                        <div>
                          <p class="text-[10px] font-extrabold uppercase text-[#1f4f46]" style="letter-spacing: 0.18em;">Plan base</p>
                          <p class="mt-1 text-xs font-medium text-[#4f6f68]">Sin coste mensual</p>
                        </div>
                        <p class="text-4xl font-semibold leading-none text-slate-900">0 €</p>
                      </div>
                    </div>

                    <p class="mt-4 text-sm leading-7 text-slate-700">Para ordenar tus primeros alquileres sin compromiso.</p>

                    <div class="mt-4 flex flex-wrap gap-2">
                      <span class="rounded-full border-2 border-[#b9ddd1] bg-white/80 px-3 py-2 text-xs font-semibold text-[#1f4f46]">Hasta 3 inmuebles</span>
                      <span class="rounded-full border-2 border-[#b9ddd1] bg-white/80 px-3 py-2 text-xs font-semibold text-[#1f4f46]">Sin tarjeta</span>
                      <span class="rounded-full border-2 border-[#b9ddd1] bg-white/80 px-3 py-2 text-xs font-semibold text-[#1f4f46]">Sin límite</span>
                    </div>

                    <div class="mt-5 flex flex-1 flex-col border-t border-[#b9ddd1] pt-4">
                      <ul class="space-y-3">
                        <li v-for="item in freePlanFeatures" :key="item" class="flex items-center gap-3 rounded-[16px] bg-white/78 px-4 py-3 text-sm font-medium text-slate-700">
                          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dff3ea]">
                            <SolidIcon name="check" class="h-4 w-4 text-[#1f4f46]" />
                          </span>
                          <span>{{ item }}</span>
                        </li>
                      </ul>

                      <router-link
                        to="/sign-up"
                        class="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#1f4f46] px-5 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#173c36]"
                        @click="handleRegisterClick('pricing_free_mobile')"
                      >
                        Crear cuenta gratis
                      </router-link>
                    </div>
                  </div>
                </article>

                <article class="comparison-carousel__slide">
                  <div class="relative flex h-full flex-col overflow-hidden rounded-[28px] border-2 border-[#d9982c] bg-[linear-gradient(180deg,#fffaf0_0%,#ffe8b8_100%)] p-5 shadow-[0_22px_46px_rgba(217,152,44,0.16)]">
                    <div class="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.68),transparent_72%)]"></div>

                    <div class="relative">
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="inline-flex rounded-full border-2 border-[#d9982c] bg-[#fff8e5] px-3 py-1 text-[11px] font-extrabold uppercase text-[#8a6518]" style="letter-spacing: 0.18em;">Plan Pro</p>
                        <span class="inline-flex rounded-full border-2 border-[#8c4d29] bg-[#fff1e7] px-3 py-1 text-[11px] font-extrabold uppercase text-[#8c4d29]" style="letter-spacing: 0.16em;">Más popular</span>
                      </div>
                      <h3 class="mt-4 text-[2rem] font-semibold leading-[0.95] text-slate-900">Sin límites.</h3>
                      <div class="mt-4 flex items-center justify-between gap-3 rounded-[22px] border border-[#e7cf8c] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(255,247,223,0.98))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_28px_rgba(217,152,44,0.12)]">
                        <div>
                          <p class="text-[10px] font-extrabold uppercase text-[#8a6518]" style="letter-spacing: 0.18em;">Mejor valor</p>
                          <p class="mt-1 text-xs font-medium text-slate-600">o 99 €/año</p>
                          <p class="mt-1 text-[11px] font-semibold text-[#8c4d29]">Precio bloqueado</p>
                        </div>
                        <p class="whitespace-nowrap text-[2.3rem] font-semibold leading-none text-slate-900">9,90 €</p>
                      </div>
                    </div>

                    <div class="relative mt-4 flex flex-wrap gap-2">
                      <span class="rounded-full border-2 border-[#e7cf8c] bg-[#fff7df] px-3 py-2 text-xs font-semibold text-[#8a6518]">Inmuebles ilimitados</span>
                      <span class="rounded-full border-2 border-[#e7cf8c] bg-[#fff7df] px-3 py-2 text-xs font-semibold text-[#8a6518]">Sin permanencia</span>
                    </div>

                    <div class="relative mt-4 rounded-[18px] bg-white/62 px-4 py-3">
                      <p class="text-sm font-medium leading-6 text-slate-700">Precio especial para los primeros clientes de {{ APP_NAME }}.</p>
                    </div>

                    <div class="relative mt-5 flex flex-1 flex-col border-t border-[#e7cf8c] pt-4">
                      <ul class="space-y-3">
                        <li v-for="item in proPlanFeatures" :key="item" class="flex items-center gap-3 rounded-[16px] bg-white/82 px-4 py-3 text-sm font-medium text-slate-700">
                          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff3cd]">
                            <SolidIcon name="check" class="h-4 w-4 text-[#8a6518]" />
                          </span>
                          <span>{{ item }}</span>
                        </li>
                      </ul>

                      <div class="mt-5 grid gap-3">
                        <router-link
                          to="/sign-up"
                          class="inline-flex items-center justify-center rounded-full bg-[#d9982c] px-5 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#c58a22]"
                          @click="handleProUpgradeClick('pricing_pro_mobile')"
                        >
                          Quiero Pro
                        </router-link>
                        <router-link
                          to="/demo"
                          class="inline-flex items-center justify-center rounded-full border-2 border-[#d9982c] bg-white px-5 py-4 text-sm font-semibold text-[#8a6518] transition hover:-translate-y-0.5 hover:bg-[#fff7df]"
                          @click="handleDemoClick('pricing_pro_mobile')"
                        >
                          Ver demo
                        </router-link>
                      </div>
                    </div>
                  </div>
                </article>

                <article class="comparison-carousel__slide">
                  <div class="flex h-full flex-col rounded-[28px] border-2 border-dashed border-slate-300 bg-[linear-gradient(180deg,#fcfcfb_0%,#f4f5f7_100%)] p-5 shadow-[0_18px_38px_rgba(148,163,184,0.12)]">
                    <div>
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="inline-flex rounded-full border-2 border-slate-300 bg-white/90 px-3 py-1 text-[11px] font-extrabold uppercase text-slate-700" style="letter-spacing: 0.18em;">Empresa</p>
                        <span class="inline-flex rounded-full border-2 border-slate-300 bg-slate-100 px-3 py-1 text-[11px] font-extrabold uppercase text-slate-600" style="letter-spacing: 0.16em;">Próximamente</span>
                      </div>
                      <h3 class="mt-4 text-[2rem] font-semibold leading-[0.95] text-slate-900">Para equipos.</h3>
                    </div>

                    <p class="mt-4 text-sm leading-7 text-slate-600">Una futura capa para gestionar más usuarios, más coordinación y más reporting dentro de {{ APP_NAME }}.</p>

                    <div class="mt-4 flex flex-wrap gap-2">
                      <span class="rounded-full border-2 border-slate-300 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700">Escalabilidad futura</span>
                      <span class="rounded-full border-2 border-slate-300 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700">Sin fecha aún</span>
                    </div>

                    <div class="mt-5 flex flex-1 flex-col border-t border-slate-300 pt-4">
                      <ul class="space-y-3">
                        <li v-for="item in teamPlanFeatures" :key="item" class="flex items-center gap-3 rounded-[16px] bg-white/82 px-4 py-3 text-sm font-medium text-slate-600">
                          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                            <SolidIcon name="check" class="h-4 w-4 text-slate-500" />
                          </span>
                          <span>{{ item }}</span>
                        </li>
                      </ul>

                      <div class="mt-5 inline-flex w-full items-center justify-center rounded-full border-2 border-dashed border-slate-300 px-5 py-4 text-sm font-semibold text-slate-500">
                        Próximamente
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-center gap-2">
              <button
                v-for="(_, index) in pricingPlanTabs"
                :key="`pricing-dot-${index}`"
                type="button"
                class="h-2.5 rounded-full transition-all"
                :class="pricingSlideIndex === index ? 'w-8 bg-[#1f4f46]' : 'w-2.5 bg-[#d9c6b8]'"
                :aria-label="`Ir al plan ${index + 1}`"
                @click="pricingSlideIndex = index"
              />
            </div>
          </div>

          <div class="hidden gap-5 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] xl:items-stretch 2xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)_minmax(0,0.88fr)] lg:grid">
              <article class="flex h-full flex-col rounded-[30px] border-2 border-[#1f4f46] bg-[linear-gradient(180deg,#f8fcfa_0%,#e8f7f0_100%)] p-6 shadow-[0_24px_52px_rgba(31,79,70,0.12)]">
                <div class="flex flex-wrap items-start justify-between gap-4">
                  <div class="max-w-[19rem]">
                    <p class="inline-flex rounded-full border-2 border-[#1f4f46] bg-white/85 px-3 py-1 text-[11px] font-extrabold uppercase text-[#1f4f46]" style="letter-spacing: 0.22em;">Starter</p>
                    <h3 class="mt-4 text-3xl font-semibold leading-[1.02] tracking-[-0.03em] text-slate-900">
                      Empieza gratis.
                    </h3>
                  </div>
                  <div class="rounded-[24px] border border-[#9fcdbd] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(239,249,244,0.98))] px-5 py-4 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_16px_30px_rgba(31,79,70,0.08)]">
                    <p class="text-[10px] font-extrabold uppercase text-[#1f4f46]" style="letter-spacing: 0.2em;">Plan base</p>
                    <p class="mt-2 text-5xl font-semibold leading-none text-slate-900">0 €</p>
                    <p class="mt-2 text-xs font-medium text-[#4f6f68]">Sin coste mensual</p>
                  </div>
                </div>

                <p class="mt-5 text-sm leading-7 text-slate-700">
                  Para ordenar tus primeros alquileres sin compromiso.
                </p>

                <div class="mt-5 flex flex-wrap gap-2">
                  <span class="rounded-full border-2 border-[#b9ddd1] bg-white/75 px-3 py-2 text-xs font-semibold text-[#1f4f46]">Hasta 3 inmuebles</span>
                  <span class="rounded-full border-2 border-[#b9ddd1] bg-white/75 px-3 py-2 text-xs font-semibold text-[#1f4f46]">Sin tarjeta</span>
                  <span class="rounded-full border-2 border-[#b9ddd1] bg-white/75 px-3 py-2 text-xs font-semibold text-[#1f4f46]">Sin límite de tiempo</span>
                </div>

                <div class="mt-6 flex flex-1 flex-col border-t border-[#b9ddd1] pt-4">
                  <ul class="space-y-3">
                    <li v-for="item in freePlanFeatures" :key="item" class="flex items-center gap-3 rounded-[18px] bg-white/78 px-4 py-3 text-sm font-medium text-slate-700">
                      <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dff3ea]">
                        <SolidIcon name="check" class="h-4 w-4 text-[#1f4f46]" />
                      </span>
                      <span>{{ item }}</span>
                    </li>
                  </ul>

                  <router-link
                    to="/sign-up"
                    class="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#1f4f46] px-5 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#173c36]"
                    @click="handleRegisterClick('pricing_free')"
                  >
                    Crear cuenta gratis
                  </router-link>
                </div>
              </article>

              <article class="relative flex h-full flex-col overflow-hidden rounded-[32px] border-2 border-[#d9982c] bg-[linear-gradient(180deg,#fffaf0_0%,#ffe8b8_100%)] p-6 shadow-[0_26px_56px_rgba(217,152,44,0.16)] 2xl:-translate-y-2">
                <div class="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.65),transparent_70%)]"></div>

                <div class="relative flex flex-wrap items-start justify-between gap-4">
                  <div class="max-w-[20rem]">
                    <div class="flex flex-wrap items-center gap-2">
                      <p class="inline-flex rounded-full border-2 border-[#d9982c] bg-[#fff8e5] px-3 py-1 text-[11px] font-extrabold uppercase text-[#8a6518]" style="letter-spacing: 0.22em;">Plan Pro</p>
                      <span class="inline-flex rounded-full border-2 border-[#8c4d29] bg-[#fff1e7] px-3 py-1 text-[11px] font-extrabold uppercase text-[#8c4d29]" style="letter-spacing: 0.18em;">Más popular</span>
                    </div>
                    <h3 class="mt-4 text-3xl font-semibold leading-[1.02] tracking-[-0.03em] text-slate-900">
                      Sin límites para tu cartera.
                    </h3>
                  </div>

                  <div class="rounded-[24px] border border-[#e7cf8c] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(255,247,223,0.98))] px-5 py-4 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_34px_rgba(217,152,44,0.12)]">
                    <p class="text-[10px] font-extrabold uppercase text-[#8a6518]" style="letter-spacing: 0.2em;">Mejor valor</p>
                    <p class="mt-2 text-4xl font-semibold leading-none text-slate-900">9,90 €<span class="text-lg text-slate-500">/mes</span></p>
                    <p class="mt-2 text-sm font-medium text-slate-600">o 99 €/año</p>
                    <p class="mt-2 text-xs font-semibold text-[#8c4d29]">Precio bloqueado mientras seas cliente</p>
                  </div>
                </div>

                <div class="relative mt-5 flex flex-wrap gap-2">
                  <span class="rounded-full border-2 border-[#e7cf8c] bg-[#fff7df] px-3 py-2 text-xs font-semibold text-[#8a6518]">Inmuebles ilimitados</span>
                  <span class="rounded-full border-2 border-[#e7cf8c] bg-[#fff7df] px-3 py-2 text-xs font-semibold text-[#8a6518]">Sin permanencia</span>
                  <span class="rounded-full border-2 border-[#c96a37] bg-white/80 px-3 py-2 text-xs font-semibold text-[#8c4d29]">Precio bloqueado mientras seas cliente</span>
                </div>

                <div class="relative mt-4 rounded-[18px] bg-white/62 px-4 py-3">
                  <p class="text-sm font-medium leading-6 text-slate-700">Precio especial para los primeros clientes de {{ APP_NAME }}.</p>
                </div>

                <div class="relative mt-6 flex flex-1 flex-col border-t border-[#e7cf8c] pt-4">
                  <ul class="space-y-3">
                    <li v-for="item in proPlanFeatures" :key="item" class="flex items-center gap-3 rounded-[18px] bg-white/82 px-4 py-3 text-sm font-medium text-slate-700">
                      <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff3cd]">
                        <SolidIcon name="check" class="h-4 w-4 text-[#8a6518]" />
                      </span>
                      <span>{{ item }}</span>
                    </li>
                  </ul>

                  <div class="mt-6 grid gap-3 sm:grid-cols-2">
                    <router-link
                      to="/sign-up"
                      class="inline-flex items-center justify-center rounded-full bg-[#d9982c] px-5 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#c58a22]"
                      @click="handleProUpgradeClick('pricing_pro')"
                    >
                      Quiero Pro
                    </router-link>
                    <router-link
                      to="/demo"
                      class="inline-flex items-center justify-center rounded-full border-2 border-[#d9982c] bg-white px-5 py-4 text-sm font-semibold text-[#8a6518] transition hover:-translate-y-0.5 hover:bg-[#fff7df]"
                      @click="handleDemoClick('pricing_pro')"
                    >
                      Ver demo
                    </router-link>
                  </div>
                </div>
              </article>

              <article class="flex h-full flex-col rounded-[30px] border-2 border-dashed border-slate-300 bg-[linear-gradient(180deg,#fcfcfb_0%,#f4f5f7_100%)] p-6 shadow-[0_22px_48px_rgba(148,163,184,0.12)] xl:col-span-2 2xl:col-span-1">
                <div class="flex flex-wrap items-start justify-between gap-4">
                  <div class="max-w-[20rem]">
                    <div class="flex flex-wrap items-center gap-2">
                      <p class="inline-flex rounded-full border-2 border-slate-300 bg-white/90 px-3 py-1 text-[11px] font-extrabold uppercase text-slate-700" style="letter-spacing: 0.22em;">Empresa</p>
                      <span class="inline-flex rounded-full border-2 border-slate-300 bg-slate-100 px-3 py-1 text-[11px] font-extrabold uppercase text-slate-600" style="letter-spacing: 0.18em;">Próximamente</span>
                    </div>
                    <h3 class="mt-4 text-3xl font-semibold leading-[1.02] tracking-[-0.03em] text-slate-900">
                      Para equipos y operativa compartida.
                    </h3>
                  </div>
                </div>

                <p class="mt-5 text-sm leading-7 text-slate-600">
                  Una futura capa para gestionar más usuarios, más coordinación y más reporting dentro de {{ APP_NAME }}.
                </p>

                <div class="mt-5 flex flex-wrap gap-2">
                  <span class="rounded-full border-2 border-slate-300 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700">Escalabilidad futura</span>
                  <span class="rounded-full border-2 border-slate-300 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700">Sin fecha aún</span>
                </div>

                <div class="mt-6 flex flex-1 flex-col border-t border-slate-300 pt-4">
                  <ul class="space-y-3">
                    <li v-for="item in teamPlanFeatures" :key="item" class="flex items-center gap-3 rounded-[18px] bg-white/82 px-4 py-3 text-sm font-medium text-slate-600">
                      <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                        <SolidIcon name="check" class="h-4 w-4 text-slate-500" />
                      </span>
                      <span>{{ item }}</span>
                    </li>
                  </ul>

                  <div class="mt-6 inline-flex w-full items-center justify-center rounded-full border-2 border-dashed border-slate-300 px-5 py-4 text-sm font-semibold text-slate-500">
                    Próximamente
                  </div>
                </div>
              </article>
          </div>
        </div>
      </section>

      <section class="space-y-6">
        <div class="max-w-3xl rounded-[28px] border-2 border-[#8c4d29] bg-[#fff0e4] p-6 shadow-[8px_8px_0_0_rgba(140,77,41,0.12)]">
          <p class="inline-flex rounded-full border-2 border-[#c96a37] bg-[#ffd9c7] px-3 py-1 text-[11px] font-extrabold uppercase text-[#8c4d29]" style="letter-spacing: 0.24em;">Testimonios</p>
          <h2 class="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Propietarios que ya entienden el valor de gestionar con más orden.</h2>
        </div>

        <div class="grid gap-4 xl:grid-cols-3">
          <article
            v-for="(testimonial, index) in testimonials"
            :key="testimonial.name"
            class="flex h-full flex-col overflow-hidden rounded-[28px] border-2 p-5 shadow-[8px_8px_0_0_rgba(15,23,42,0.08)]"
            :class="testimonialCardClasses[index]"
          >
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-1 text-[1.05rem]" :class="testimonialTextClasses[index]">
                <span v-for="star in 5" :key="star">★</span>
              </div>
              <span class="rounded-full border-2 bg-white/70 px-3 py-1 text-[11px] font-extrabold uppercase" :class="testimonialBadgeClasses[index]" style="letter-spacing: 0.18em;">
                Cliente
              </span>
            </div>

            <div class="mt-5 flex flex-1 rounded-[22px] bg-white/72 p-5">
              <p class="text-base font-semibold leading-8" :class="testimonialTextClasses[index]">“{{ testimonial.quote }}”</p>
            </div>

            <div class="mt-5 flex items-center gap-4 rounded-[22px] border-2 bg-white/68 p-4 shadow-[4px_4px_0_0_rgba(15,23,42,0.06)]" :class="testimonialInnerClasses[index]">
              <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 bg-white/60 text-sm font-semibold" :class="testimonialAvatarClasses[index]">
                <img
                  v-if="testimonial.avatar && !failedTestimonialAvatars[testimonial.name]"
                  :src="testimonial.avatar"
                  :alt="testimonial.name"
                  class="h-full w-full object-cover"
                  loading="lazy"
                  @error="handleTestimonialAvatarError(testimonial.name)"
                />
                <span v-else>{{ testimonial.initials }}</span>
              </div>
              <div>
                <p class="font-semibold text-slate-900">{{ testimonial.name }}</p>
                <p class="text-sm text-slate-500">{{ testimonial.role }}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="faq" class="px-6 py-6 lg:px-8 lg:py-8">
        <div class="grid gap-8 xl:grid-cols-[0.74fr_1.26fr] xl:items-start">
          <div class="rounded-[28px] border-2 border-[#1f4f46] bg-[#dff3ea] p-6 shadow-[8px_8px_0_0_rgba(31,79,70,0.12)]">
            <p class="inline-flex rounded-full border-2 border-[#1f4f46] bg-[#eef8f3] px-3 py-1 text-[11px] font-extrabold uppercase text-[#1f4f46]" style="letter-spacing: 0.24em;">FAQ</p>
            <h2 class="mt-4 max-w-md text-3xl font-semibold text-slate-900 sm:text-4xl">Respuestas claras para despejar objeciones antes del registro.</h2>
            <p class="mt-4 max-w-md text-base leading-8 text-slate-700">
              La intención es simple: reducir fricción, reforzar confianza y facilitar la decisión de empezar gratis o ver la aplicación antes de registrarte.
            </p>
          </div>

          <div class="space-y-3">
            <details
              v-for="(item, index) in faqItems"
              :key="item.question"
              class="faq-item rounded-[24px] border-2 px-5 py-4 shadow-[6px_6px_0_0_rgba(15,23,42,0.08)]"
              :class="faqCardClasses[index % faqCardClasses.length]"
              @toggle="handleFaqToggle(item.question, $event)"
            >
              <summary class="cursor-pointer list-none pr-8 text-lg font-semibold text-slate-900">
                {{ item.question }}
              </summary>
              <p class="mt-3 text-sm leading-7 text-slate-700">
                {{ item.answer }}
              </p>
            </details>
          </div>
        </div>
      </section>

    </main>

    <footer class="relative z-10 px-4 pb-6 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-[90rem] overflow-hidden rounded-[34px] px-6 py-6 lg:px-10 lg:py-8">
        <div class="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_repeat(3,minmax(0,0.65fr))]">
          <div class="rounded-[28px] border-2 border-[#1f4f46] bg-[#dff3ea] p-6 shadow-[8px_8px_0_0_rgba(31,79,70,0.16)] lg:p-7">
            <BrandMark hide-icon use-wordmark-image wordmark-class="h-12 sm:h-14" label-class="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl" />
            <p class="mt-5 max-w-xl text-base leading-8 text-slate-700">
              Plataforma para propietarios que quieren centralizar propiedades, pagos, incidencias, contratos y documentos sin trabajar con herramientas dispersas.
            </p>
            <div class="mt-6 flex flex-wrap gap-3">
              <router-link
                to="/sign-up"
                class="inline-flex items-center justify-center rounded-full bg-[#c96a37] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#b85d2d]"
                @click="handleRegisterClick('footer_primary')"
              >
                Crear cuenta
              </router-link>
              <router-link
                to="/demo"
                class="inline-flex items-center justify-center rounded-full border-2 border-[#1f4f46] bg-white/75 px-5 py-3 text-sm font-semibold text-[#1f4f46] transition hover:-translate-y-0.5 hover:bg-white"
                @click="handleDemoClick('footer_secondary')"
              >
                Ver demo
              </router-link>
            </div>
          </div>

          <div class="rounded-[24px] border-2 border-[#d9982c] bg-[#ffecc4] p-5 shadow-[8px_8px_0_0_rgba(217,152,44,0.18)]">
            <p class="text-[11px] font-extrabold uppercase text-[#8a6518]" style="letter-spacing: 0.2em;">Producto</p>
            <div class="mt-4 grid gap-3 text-sm text-slate-700">
              <router-link to="/demo" class="transition hover:text-slate-900" @click="handleDemoClick('footer_demo')">Ver demo</router-link>
              <a href="#precios" class="transition hover:text-slate-900" @click="handlePricingClick('footer_pricing')">Precios</a>
              <a href="#faq" class="transition hover:text-slate-900">FAQ</a>
              <a href="#problema" class="transition hover:text-slate-900">Problema</a>
            </div>
          </div>

          <div class="rounded-[24px] border-2 border-[#1f4f46] bg-[#dff3ea] p-5 shadow-[8px_8px_0_0_rgba(31,79,70,0.16)]">
            <p class="text-[11px] font-extrabold uppercase text-[#1f4f46]" style="letter-spacing: 0.2em;">Cuenta</p>
            <div class="mt-4 grid gap-3 text-sm text-slate-700">
              <router-link to="/sign-in" class="transition hover:text-slate-900" @click="handleLoginClick('footer_login')">Iniciar sesión</router-link>
              <router-link to="/sign-up" class="transition hover:text-slate-900" @click="handleRegisterClick('footer_register')">Crear cuenta</router-link>
              <router-link to="/sign-up" class="transition hover:text-slate-900" @click="handleProUpgradeClick('footer_pro')">Empezar con Pro</router-link>
            </div>
          </div>

          <div class="rounded-[24px] border-2 border-[#c96a37] bg-[#ffe0d1] p-5 shadow-[8px_8px_0_0_rgba(201,106,55,0.16)]">
            <p class="text-[11px] font-extrabold uppercase text-[#8c4d29]" style="letter-spacing: 0.2em;">Contacto</p>
            <div class="mt-4 space-y-4 text-sm text-slate-700">
              <div>
                <p class="font-semibold text-slate-900">{{ APP_SUPPORT_EMAIL }}</p>
                <p class="mt-1 leading-7 text-slate-600">Para ventas y dudas comerciales.</p>
              </div>
              <a
                :href="contactLink"
                class="inline-flex items-center justify-center rounded-full border-2 border-[#c96a37] bg-white/75 px-4 py-3 font-semibold text-[#8c4d29] transition hover:-translate-y-0.5 hover:bg-white"
                @click="handleContactClick('footer_contact_cta')"
              >
                Escribir al equipo
              </a>
            </div>
          </div>
        </div>

        <div class="mt-6 flex flex-col gap-3 border-t border-[#e6ddd1] pt-5 text-sm text-slate-600 lg:flex-row lg:items-center lg:justify-between">
          <p>© {{ currentYear }} {{ APP_NAME }}. {{ APP_DESCRIPTION }}.</p>
          <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span class="inline-flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-[#1f4f46]"></span>
              Plan Starter disponible
            </span>
            <span class="inline-flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-[#d9982c]"></span>
              Demo interactiva disponible
            </span>
            <span class="inline-flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-[#c96a37]"></span>
              Hecho para carteras pequeñas y medianas
            </span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import BrandMark from '../components/BrandMark.vue';
import SolidIcon from '../components/SolidIcon.vue';
import { APP_DESCRIPTION, APP_NAME, APP_SUPPORT_EMAIL } from '../config/brand';
import { track } from '../lib/analytics';

const contactLink = `mailto:${APP_SUPPORT_EMAIL}?subject=${encodeURIComponent(`Contacto ${APP_NAME}`)}`;
const currentYear = new Date().getFullYear();

const buildingImage =
  'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&fm=jpg&q=80&w=1400';
const documentsImage =
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&fm=jpg&q=80&w=1400';
const laptopImage =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&fm=jpg&q=80&w=1400';
const comparisonImage =
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&fm=jpg&q=80&w=1400';
const failedTestimonialAvatars = ref<Record<string, boolean>>({});

const trustItems = [
  {
    title: 'Pensado para',
    value: 'Propietarios con visión de cartera'},
  {
    title: 'Base operativa',
    value: 'Cobros, contratos e incidencias',
  },
  {
    title: 'Experiencia',
    value: 'Menos seguimiento. Más control.',
  },
  {
    title: 'Modelo',
    value: 'Empieza gratis. Escala con Pro.'
  }
];

const trustCardClasses = [
  'border-[#d9982c] bg-[#ffe3b3] shadow-[8px_8px_0_0_rgba(217,152,44,0.22)]',
  'border-[#1f4f46] bg-[#cfeee1] shadow-[8px_8px_0_0_rgba(31,79,70,0.18)]',
  'border-[#c96a37] bg-[#ffd4c1] shadow-[8px_8px_0_0_rgba(201,106,55,0.2)]',
  'border-[#8c4d29] bg-[#f6d9c6] shadow-[8px_8px_0_0_rgba(140,77,41,0.18)]'
];

const trustTextClasses = [
  'text-[#d9982c]',
  'text-[#1f4f46]',
  'text-[#c96a37]',
  'text-[#8c4d29]'
];

const problemItems = [
  {
    icon: 'warning',
    title: 'Pagos que se revisan tarde',
  },
  {
    icon: 'message',
    title: 'Incidencias dispersas en conversaciones'
  },
  {
    icon: 'calendar',
    title: 'Contratos y documentos difíciles de localizar'
  }
];

const problemCardClasses = [
  'border-[#c96a37] bg-[#ffd4c1]',
  'border-[#d9982c] bg-[#ffe3b3]',
  'border-[#1f4f46] bg-[#cfeee1]'
];

const problemIconClasses = [
  'border-[#c96a37] text-[#c96a37]',
  'border-[#d9982c] text-[#d9982c]',
  'border-[#1f4f46] text-[#1f4f46]'
];

const problemTextClasses = [
  'text-[#8c4d29]',
  'text-[#8a6518]',
  'text-[#1f4f46]'
];

const benefits = [
  {
    icon: 'building',
    title: 'Cada inmueble con su historia completa',
    description: 'Datos, pagos, contratos y documentos vinculados a la misma propiedad para no perder contexto.'
  },
  {
    icon: 'wallet',
    title: 'Control de cobros sin fricción',
    description: 'Sabrás qué entra, qué está pendiente y dónde necesitas intervenir antes de que se acumule.'
  },
  {
    icon: 'refresh',
    title: 'Operativa más fluida',
    description: 'Menos pasos, menos herramientas y una lógica de trabajo más limpia para repetir cada mes.'
  },
  {
    icon: 'spark',
    title: 'Imagen profesional ante inquilinos',
    description: 'Una gestión más ordenada y clara mejora la experiencia del inquilino.'
  }
];

const benefitCardClasses = [
  'border-[#1f4f46] bg-[#dff3ea]',
  'border-[#d9982c] bg-[#ffe3b3]',
  'border-[#c96a37] bg-[#ffd4c1]',
  'border-[#8c4d29] bg-[#f6d9c6]'
];

const benefitIconClasses = [
  'border-[#1f4f46] text-[#1f4f46]',
  'border-[#d9982c] text-[#d9982c]',
  'border-[#c96a37] text-[#c96a37]',
  'border-[#8c4d29] text-[#8c4d29]'
];

const benefitTextClasses = [
  'text-[#1f4f46]',
  'text-[#8a6518]',
  'text-[#8c4d29]',
  'text-[#8c4d29]'
];

const steps = [
  {
    step: '01',
    icon: 'home',
    title: 'Importa tu operativa actual',
    description: 'Empieza cargando tus inmuebles y la información básica sin una configuración interminable.'
  },
  {
    step: '02',
    icon: 'refresh',
    title: 'Centraliza pagos, contratos y documentos',
    description: 'Todo pasa a vivir en el mismo sitio, con una estructura clara y más fácil de mantener.'
  },
  {
    step: '03',
    icon: 'spark',
    title: 'Gestiona cada mes con más control',
    description: 'Revisa el panel, actúa sobre pendientes y toma decisiones con mejor visibilidad.'
  }
];

const stepCardClasses = [
  'border-[#1f4f46] bg-[#dff3ea]',
  'border-[#d9982c] bg-[#ffe3b3]',
  'border-[#c96a37] bg-[#ffd4c1]'
];

const stepNumberClasses = [
  'text-[#1f4f46]/20',
  'text-[#d9982c]/30',
  'text-[#c96a37]/25'
];

const stepIconClasses = [
  'border-[#1f4f46] text-[#1f4f46]',
  'border-[#d9982c] text-[#d9982c]',
  'border-[#c96a37] text-[#c96a37]'
];

const stepTextClasses = [
  'text-[#1f4f46]',
  'text-[#8a6518]',
  'text-[#8c4d29]'
];

const comparisonRows = [
  {
    label: 'Estado de la cartera',
    legacy: 'Se recompone entre hojas y mensajes.',
    modern: 'Se ve en un panel conectado.'
  },
  {
    label: 'Seguimiento de pagos',
    legacy: 'Depende de memoria y revisión manual.',
    modern: 'Se sigue con estados y prioridades.'
  },
  {
    label: 'Contratos y documentos',
    legacy: 'Se pierden entre carpetas y correos.',
    modern: 'Se abren desde cada alquiler.'
  },
  {
    label: 'Imagen profesional',
    legacy: 'La gestión se ve improvisada.',
    modern: 'La operativa transmite orden.'
  }
];

const freePlanFeatures = [
  'Hasta 3 inmuebles activos',
  'Pagos, incidencias, contratos y documentos',
  'Misma base de trabajo desde el primer día'
];

const proPlanFeatures = [
  'Inmuebles ilimitados',
  'Todo Starter, sin límite de cartera',
  'Upgrade inmediato desde tu cuenta'
];

const teamPlanFeatures = [
  'Usuarios y flujos compartidos',
  'Más reporting y colaboración',
  'Disponible más adelante'
];

const testimonials = [
  {
    name: 'Lucía Herrero',
    initials: 'LH',
    avatar:
      'https://images.unsplash.com/photo-1758518727888-ffa196002e59?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=60&w=400&h=400',
    role: 'Propietaria de 6 inmuebles en Madrid',
    quote: `Antes tenía todo repartido entre Excel, Drive y WhatsApp. Ahora entro en ${APP_NAME} y sé exactamente qué pagos faltan y qué contratos tengo que revisar.`
  },
  {
    name: 'Javier Costa',
    initials: 'JC',
    avatar:
      'https://images.unsplash.com/photo-1758598497192-15ffa411c3de?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=60&w=400&h=400',
    role: 'Pequeño inversor con 11 activos',
    quote: 'La sensación no es la de una herramienta improvisada. El panel transmite control y me permite gestionar mi cartera con mucha más calma.'
  },
  {
    name: 'Marta Vidal',
    initials: 'MV',
    avatar:
      'https://images.unsplash.com/photo-1758691737605-69a0e78bd193?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=60&w=400&h=400',
    role: 'Sociedad patrimonial familiar',
    quote: 'La diferencia más grande es la claridad. Todo está donde espero encontrarlo y el cierre mensual dejó de ser una tarea pesada.'
  }
];

const testimonialCardClasses = [
  'border-[#1f4f46] bg-[#dff3ea]',
  'border-[#d9982c] bg-[#ffecc4]',
  'border-[#c96a37] bg-[#ffe0d1]'
];

const testimonialTextClasses = [
  'text-[#1f4f46]',
  'text-[#d9982c]',
  'text-[#c96a37]'
];

const testimonialBadgeClasses = [
  'border-[#1f4f46] text-[#1f4f46]',
  'border-[#d9982c] text-[#8a6518]',
  'border-[#c96a37] text-[#8c4d29]'
];

const testimonialInnerClasses = [
  'border-[#b9ddd1]',
  'border-[#efd28b]',
  'border-[#efb796]'
];

const testimonialAvatarClasses = [
  'border-[#1f4f46] text-[#1f4f46]',
  'border-[#d9982c] text-[#8a6518]',
  'border-[#c96a37] text-[#8c4d29]'
];

const handleTestimonialAvatarError = (name: string) => {
  failedTestimonialAvatars.value[name] = true;
};

const faqItems = [
  {
    question: '¿Puedo empezar sin tarjeta?',
    answer: `Sí. El plan Starter te permite probar la plataforma sin tarjeta, sin límite de tiempo y gestionar hasta 3 inmuebles para validar si ${APP_NAME} encaja contigo.`
  },
  {
    question: `¿Para quién está pensado realmente ${APP_NAME}?`,
    answer: 'Para propietarios con varios inmuebles, pequeños inversores y perfiles que quieren abandonar Excel, WhatsApp y procesos administrativos dispersos.'
  },
  {
    question: '¿Qué pasa cuando necesito más capacidad?',
    answer: 'Puedes pasar a Pro por 9,90 €/mes o 99 €/año y gestionar inmuebles ilimitados sin cambiar de herramienta ni de flujo. El salto se hace dentro de la misma cuenta.'
  },
  {
    question: '¿Puedo ver una demo antes de registrarme?',
    answer: 'Sí. La landing abre una demo interactiva para que puedas recorrer una versión simulada del producto antes de crear tu cuenta.'
  },
  {
    question: '¿La plataforma cubre solo pagos?',
    answer: 'No. La propuesta de valor está en tener propiedades, pagos, incidencias, contratos, documentos y resumen mensual dentro del mismo sistema.'
  }
];

const faqCardClasses = [
  'border-[#1f4f46] bg-[#dff3ea]',
  'border-[#d9982c] bg-[#ffecc4]',
  'border-[#c96a37] bg-[#ffe0d1]',
  'border-[#8c4d29] bg-[#f6dfcf]'
];

const pricingPlanTabs = ['starter', 'pro', 'team'];
const pricingSectionRef = ref<HTMLElement | null>(null);
const comparisonSlideIndex = ref(0);
const comparisonPointerStartX = ref<number | null>(null);
const pricingSlideIndex = ref(0);
const pricingPointerStartX = ref<number | null>(null);
let pricingObserver: IntersectionObserver | null = null;
let pricingViewedTracked = false;

const trackPricingViewed = () => {
  if (pricingViewedTracked) return;
  pricingViewedTracked = true;
  track('pricing_viewed');
};

const handleRegisterClick = (source: string) => {
  track('cta_register_clicked', { source, location: 'landing' });
};

const handleLoginClick = (source: string) => {
  track('login_clicked', { source, location: 'landing' });
};

const handlePricingClick = (source: string) => {
  trackPricingViewed();
  track('pricing_clicked', { source, location: 'landing' });
};

const handleDemoClick = (source: string) => {
  track('demo_requested', { source, location: 'landing' });
};

const handleContactClick = (source: string) => {
  track('contact_clicked', { source, location: 'landing' });
};

const handleProUpgradeClick = (source: string) => {
  track('pro_upgrade_clicked', { source, location: 'landing' });
};

const handleFaqToggle = (question: string, event: Event) => {
  const details = event.target as HTMLDetailsElement | null;
  if (details?.open) {
    track('faq_opened', { question, location: 'landing' });
  }
};

const changeComparisonSlide = (direction: 'prev' | 'next') => {
  const lastIndex = comparisonRows.length - 1;
  if (direction === 'next') {
    comparisonSlideIndex.value = comparisonSlideIndex.value >= lastIndex ? 0 : comparisonSlideIndex.value + 1;
    return;
  }

  comparisonSlideIndex.value = comparisonSlideIndex.value <= 0 ? lastIndex : comparisonSlideIndex.value - 1;
};

const handleComparisonPointerDown = (event: PointerEvent) => {
  comparisonPointerStartX.value = event.clientX;
};

const handleComparisonPointerUp = (event: PointerEvent) => {
  if (comparisonPointerStartX.value === null) return;

  const deltaX = event.clientX - comparisonPointerStartX.value;
  comparisonPointerStartX.value = null;

  if (Math.abs(deltaX) < 40) return;
  changeComparisonSlide(deltaX < 0 ? 'next' : 'prev');
};

const resetComparisonPointer = () => {
  comparisonPointerStartX.value = null;
};

const changePricingSlide = (direction: 'prev' | 'next') => {
  const lastIndex = pricingPlanTabs.length - 1;
  if (direction === 'next') {
    pricingSlideIndex.value = pricingSlideIndex.value >= lastIndex ? 0 : pricingSlideIndex.value + 1;
    return;
  }

  pricingSlideIndex.value = pricingSlideIndex.value <= 0 ? lastIndex : pricingSlideIndex.value - 1;
};

const handlePricingPointerDown = (event: PointerEvent) => {
  pricingPointerStartX.value = event.clientX;
};

const handlePricingPointerUp = (event: PointerEvent) => {
  if (pricingPointerStartX.value === null) return;

  const deltaX = event.clientX - pricingPointerStartX.value;
  pricingPointerStartX.value = null;

  if (Math.abs(deltaX) < 40) return;
  changePricingSlide(deltaX < 0 ? 'next' : 'prev');
};

const resetPricingPointer = () => {
  pricingPointerStartX.value = null;
};

onMounted(() => {
  if (!pricingSectionRef.value || typeof IntersectionObserver === 'undefined') {
    return;
  }

  pricingObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        trackPricingViewed();
        pricingObserver?.disconnect();
        pricingObserver = null;
      }
    },
    { threshold: 0.35 }
  );

  pricingObserver.observe(pricingSectionRef.value);
});

onBeforeUnmount(() => {
  pricingObserver?.disconnect();
  pricingObserver = null;
});
</script>

<style scoped>
.landing-shell {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.landing-grid {
  background-image:
    linear-gradient(rgba(140, 77, 41, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(31, 79, 70, 0.05) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(circle at center, black 28%, transparent 82%);
}

.section-frame {
  position: relative;
  border: 1px solid rgba(231, 221, 208, 0.95);
  background:
    radial-gradient(circle at top left, rgba(201, 106, 55, 0.1), transparent 28%),
    radial-gradient(circle at bottom right, rgba(31, 79, 70, 0.08), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(250, 246, 240, 0.97));
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.08);
}

.trust-strip {
  border: none;
  background: transparent;
  box-shadow: none;
}

.pricing-shell {
  border: none;
  background: transparent;
  box-shadow: none;
}

.premium-card {
  border: 1px solid rgba(231, 221, 208, 0.95);
  background:
    radial-gradient(circle at top left, rgba(201, 106, 55, 0.08), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(250, 246, 239, 0.96));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
}

.dashboard-shell {
  background:
    radial-gradient(circle at top left, rgba(248, 193, 92, 0.16), transparent 24%),
    radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.08), transparent 22%),
    linear-gradient(155deg, rgba(22, 61, 55, 0.98), rgba(31, 79, 70, 0.98) 52%, rgba(17, 46, 42, 0.98));
}

.cta-frame {
  box-shadow: 0 34px 90px rgba(15, 23, 42, 0.12);
}

.trust-claim {
  text-wrap: balance;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.1rem;
  font-weight: 900;
  line-height: 1.06;
  letter-spacing: -0.02em;
}

.hero-pill {
  max-width: 100%;
  gap: 0.5rem;
  padding: 0.7rem 0.85rem;
  white-space: nowrap;
  font-size: 0.53rem;
  letter-spacing: 0.1em;
}

.hero-pill span {
  flex: 0 0 auto;
}

.comparison-carousel {
  overflow: hidden;
  touch-action: pan-y;
  user-select: none;
}

.comparison-carousel__track {
  display: flex;
  transition: transform 260ms ease;
  will-change: transform;
}

.comparison-carousel__slide {
  width: 100%;
  flex: 0 0 100%;
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item summary {
  position: relative;
}

.faq-item summary::after {
  content: '+';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(31, 79, 70, 0.9);
  font-size: 1.5rem;
  line-height: 1;
}

.faq-item[open] summary::after {
  content: '−';
}

@media (min-width: 640px) {
  .trust-claim {
    font-size: 1.2rem;
  }

  .hero-pill {
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    font-size: 0.6875rem;
    letter-spacing: 0.26em;
  }
}
</style>

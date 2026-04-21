<template>
  <div class="landing-shell relative overflow-hidden bg-[#f8f5ef] text-slate-900">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute left-[-12%] top-[-8%] h-[28rem] w-[28rem] rounded-full bg-[#c96a37]/14 blur-[120px]"></div>
      <div class="absolute right-[-10%] top-[18rem] h-[30rem] w-[30rem] rounded-full bg-[#1f4f46]/12 blur-[130px]"></div>
      <div class="absolute bottom-[-10rem] left-[18%] h-[24rem] w-[24rem] rounded-full bg-[#d7a35d]/16 blur-[120px]"></div>
      <div class="landing-grid absolute inset-0 opacity-40"></div>
    </div>

    <header class="relative z-50 border-b border-white/60 bg-[#f8f5ef]/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <router-link to="/" class="flex items-center gap-3">
          <img :src="brandLogo" alt="La-Kers" class="h-14 w-auto object-contain drop-shadow-[0_18px_40px_rgba(61,217,180,0.14)] sm:h-16" />
        </router-link>

        <nav class="hidden items-center gap-7 text-sm text-slate-600 lg:flex">
          <a href="#problema" class="transition hover:text-[#1f4f46]">Problema</a>
          <a href="#funciones" class="transition hover:text-[#1f4f46]">Funciones</a>
          <a href="#dashboard" class="transition hover:text-[#1f4f46]">Dashboard</a>
          <a href="#precios" class="transition hover:text-[#1f4f46]" @click="handlePricingClick('header_nav')">Precios</a>
          <a href="#faq" class="transition hover:text-[#1f4f46]">FAQ</a>
        </nav>

        <div class="flex flex-wrap items-center gap-3">
          <router-link
            to="/sign-in"
            class="rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            @click="handleLoginClick('header')"
          >
            Iniciar sesión
          </router-link>
          <a
            :href="demoRequestLink"
            class="rounded-full border border-[#d5e4dd] bg-white/80 px-4 py-2 text-sm font-medium text-[#1f4f46] transition hover:border-[#bfd6cd] hover:bg-[#edf6f2]"
            @click="handleDemoClick('header')"
          >
            Solicitar demo
          </a>
          <router-link
            to="/sign-up"
            class="rounded-full bg-[#c96a37] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-950/10 transition hover:-translate-y-0.5 hover:bg-[#b85d2d]"
            @click="handleRegisterClick('header')"
          >
            Empieza gratis
          </router-link>
        </div>
      </div>
    </header>

    <main class="relative z-10 mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section class="section-frame overflow-hidden rounded-[34px] px-6 py-6 lg:px-8 lg:py-8">
        <div class="grid gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-center">
          <div class="space-y-8">
            <div class="inline-flex items-center gap-3 rounded-full border border-[#d6c7bb] bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase text-[#1f4f46] shadow-sm" style="letter-spacing: 0.26em;">
              <span class="h-2.5 w-2.5 rounded-full bg-[#c96a37] shadow-[0_0_0_6px_rgba(201,106,55,0.14)]"></span>
              SaaS para propietarios que ya no quieren vivir en Excel
            </div>

            <div class="space-y-5">
              <h1 class="max-w-3xl text-4xl font-semibold leading-[0.88] text-slate-900 sm:text-5xl xl:text-[5.25rem]">
                La forma premium de gestionar alquileres con orden real.
              </h1>
              <p class="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Propiedades, pagos, incidencias, contratos, documentos y resumen mensual en una sola plataforma pensada para propietarios con 2 a 25 inmuebles.
              </p>
            </div>

            <div class="flex flex-wrap gap-3">
              <router-link
                to="/sign-up"
                class="rounded-full bg-[#c96a37] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-950/10 transition hover:-translate-y-0.5 hover:bg-[#b85d2d]"
                @click="handleRegisterClick('hero_primary')"
              >
                Crear cuenta gratis
              </router-link>
              <a
                :href="demoRequestLink"
                class="rounded-full border border-[#d5e4dd] bg-white/85 px-6 py-3.5 text-sm font-semibold text-[#1f4f46] transition hover:-translate-y-0.5 hover:border-[#bfd6cd] hover:bg-[#edf6f2]"
                @click="handleDemoClick('hero_secondary')"
              >
                Solicitar demo guiada
              </a>
              <a
                href="#precios"
                class="rounded-full border border-[#ead8ca] bg-[#fff4ea] px-6 py-3.5 text-sm font-semibold text-[#8c4d29] transition hover:-translate-y-0.5 hover:bg-[#fff0e2]"
                @click="handlePricingClick('hero_secondary')"
              >
                Ver precios
              </a>
            </div>

            <div class="grid gap-3 sm:grid-cols-3">
              <article
                v-for="(metric, index) in heroMetrics"
                :key="metric.label"
                class="premium-card opacity-0 animate-fade-up rounded-[24px] p-4"
                :style="{ animationDelay: `${index * 110}ms` }"
              >
                <p class="text-xs font-semibold uppercase text-slate-500" style="letter-spacing: 0.18em;">{{ metric.label }}</p>
                <p class="mt-3 text-2xl font-semibold text-slate-900">{{ metric.value }}</p>
                <p class="mt-2 text-sm leading-6 text-slate-600">{{ metric.copy }}</p>
              </article>
            </div>

            <div class="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span class="rounded-full border border-[#e7ddd0] bg-white/80 px-3 py-1.5">Hasta 2 inmuebles gratis</span>
              <span class="rounded-full border border-[#d9e5df] bg-white/80 px-3 py-1.5">Pro 9,90 €/mes o 99 €/año</span>
              <span class="rounded-full border border-[#e7ddd0] bg-white/80 px-3 py-1.5">Sin tarjeta para empezar</span>
            </div>
          </div>

          <div class="relative mx-auto w-full max-w-[40rem]">
            <div class="floating-chip absolute -left-2 top-12 hidden rounded-[22px] border border-[#d5e4dd] bg-white/92 px-4 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.14)] lg:block">
              <p class="text-[10px] font-semibold uppercase text-[#1f4f46]" style="letter-spacing: 0.24em;">Cobros del mes</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">42.300 €</p>
              <p class="mt-1 text-sm text-slate-500">97% previsto para el día 5</p>
            </div>

            <div class="floating-chip absolute -right-3 top-24 hidden rounded-[22px] border border-[#ead8ca] bg-white/92 px-4 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.14)] xl:block">
              <p class="text-[10px] font-semibold uppercase text-[#8c4d29]" style="letter-spacing: 0.24em;">Alertas</p>
              <p class="mt-2 text-lg font-semibold text-slate-900">3 incidencias abiertas</p>
              <p class="mt-1 text-sm text-slate-500">2 con proveedor asignado</p>
            </div>

            <div class="dashboard-shell relative overflow-hidden rounded-[30px] border border-white/10 p-4 shadow-[0_34px_90px_rgba(1,6,18,0.55)]">
              <div class="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(90,200,255,0.16),rgba(90,200,255,0))]"></div>
              <div class="grid gap-4 lg:grid-cols-[0.24fr_0.76fr]">
                <aside class="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <div class="flex items-center gap-3 border-b border-white/8 pb-4">
                    <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#c96a37_0%,#f1ba7a_100%)] text-white">
                      <SolidIcon name="dashboard" class="h-5 w-5" />
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-white">Dashboard</p>
                      <p class="text-xs text-slate-400">Vista de propietario</p>
                    </div>
                  </div>

                  <div class="mt-4 space-y-2">
                    <div
                      v-for="item in dashboardMenu"
                      :key="item.label"
                      class="flex items-center gap-3 rounded-2xl px-3 py-2.5"
                      :class="item.active ? 'bg-white/12 text-white' : 'text-emerald-50/70'"
                    >
                      <SolidIcon :name="item.icon" class="h-4 w-4 shrink-0" />
                      <span class="text-sm font-medium">{{ item.label }}</span>
                    </div>
                  </div>

                  <div class="mt-6 rounded-[22px] border border-[#f3c59d]/30 bg-white/10 p-4">
                    <p class="text-[10px] font-semibold uppercase text-[#fbe6d2]" style="letter-spacing: 0.24em;">Resumen mensual</p>
                    <p class="mt-3 text-3xl font-semibold text-white">18.640 €</p>
                    <p class="mt-2 text-sm leading-6 text-emerald-50/85">Ingresos previstos, vencimientos y documentación crítica en el mismo panel.</p>
                  </div>
                </aside>

                <div class="space-y-4">
                  <div class="grid gap-3 md:grid-cols-3">
                    <article
                      v-for="card in dashboardStats"
                      :key="card.label"
                      class="rounded-[24px] border border-white/8 bg-white/[0.05] p-4"
                    >
                      <div class="flex items-center justify-between gap-3">
                        <p class="text-xs font-semibold uppercase text-slate-400" style="letter-spacing: 0.16em;">{{ card.label }}</p>
                        <span class="h-2.5 w-2.5 rounded-full" :class="card.dot"></span>
                      </div>
                      <p class="mt-3 text-2xl font-semibold text-white">{{ card.value }}</p>
                      <p class="mt-2 text-sm text-slate-300">{{ card.detail }}</p>
                    </article>
                  </div>

                  <div class="grid gap-4 xl:grid-cols-[0.63fr_0.37fr]">
                    <article class="rounded-[26px] border border-white/8 bg-white/[0.04] p-4">
                      <div class="flex items-center justify-between gap-3 border-b border-white/8 pb-4">
                        <div>
                          <p class="text-sm font-semibold text-white">Propiedades activas</p>
                          <p class="text-xs text-slate-400">Estado, pagos y contratos por inmueble</p>
                        </div>
                        <span class="rounded-full border border-white/8 bg-white/[0.05] px-3 py-1 text-xs text-emerald-50/75">Actualizado hoy</span>
                      </div>

                      <div class="mt-4 space-y-3">
                        <div
                          v-for="property in propertyRows"
                          :key="property.name"
                          class="grid gap-3 rounded-[22px] border border-white/8 bg-[#0f1729]/75 px-4 py-3 md:grid-cols-[minmax(0,1.2fr)_120px_140px_110px] md:items-center"
                        >
                          <div>
                            <p class="font-semibold text-white">{{ property.name }}</p>
                            <p class="mt-1 text-sm text-slate-400">{{ property.location }}</p>
                          </div>
                          <div>
                            <p class="text-xs text-slate-400">Renta</p>
                            <p class="mt-1 text-sm font-semibold text-white">{{ property.rent }}</p>
                          </div>
                          <div>
                            <p class="text-xs text-slate-400">Contrato</p>
                            <p class="mt-1 text-sm font-semibold text-white">{{ property.contract }}</p>
                          </div>
                          <div>
                            <span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold" :class="property.statusClass">{{ property.status }}</span>
                          </div>
                        </div>
                      </div>
                    </article>

                    <div class="space-y-4">
                      <article class="overflow-hidden rounded-[26px] border border-white/8 bg-white/[0.04]">
                        <img :src="workspaceImage" alt="Workspace elegante para gestionar alquileres" class="h-44 w-full object-cover" />
                        <div class="p-4">
                          <p class="text-sm font-semibold text-white">Productividad sin fricción</p>
                          <p class="mt-2 text-sm leading-6 text-slate-300">Revisa todo desde una vista limpia y profesional, sin saltar entre carpetas, hojas y chats.</p>
                        </div>
                      </article>

                      <article class="rounded-[26px] border border-white/8 bg-white/[0.04] p-4">
                        <div class="flex items-start gap-3">
                          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8 text-[#fbe6d2]">
                            <SolidIcon name="chart" class="h-5 w-5" />
                          </div>
                          <div>
                            <p class="text-sm font-semibold text-white">Lectura ejecutiva</p>
                            <p class="mt-2 text-sm leading-6 text-slate-300">El resumen mensual te dice rápido qué has cobrado, qué falta y qué requiere acción.</p>
                          </div>
                        </div>
                      </article>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="floating-image absolute -bottom-8 right-4 hidden w-[13rem] overflow-hidden rounded-[26px] border border-[#d5e4dd] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.16)] lg:block">
              <img :src="buildingImage" alt="Edificio residencial moderno" class="h-44 w-full object-cover" />
              <div class="p-4">
                <p class="text-xs font-semibold uppercase text-[#1f4f46]" style="letter-spacing: 0.24em;">Portfolio</p>
                <p class="mt-2 text-lg font-semibold text-slate-900">De 2 a 25 inmuebles</p>
                <p class="mt-1 text-sm text-slate-500">Escala sin cambiar tu forma de trabajar.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section-frame rounded-[30px] px-6 py-6 lg:px-8" aria-label="Confianza">
        <div class="grid gap-4 xl:grid-cols-[0.8fr_1.2fr] xl:items-center">
          <div>
            <p class="text-[11px] font-semibold uppercase text-[#1f4f46]" style="letter-spacing: 0.26em;">Construido para la operativa real</p>
            <h2 class="mt-3 max-w-xl text-3xl font-semibold text-slate-900 sm:text-4xl">No es otra app bonita. Es una forma más seria de gestionar alquileres.</h2>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article
              v-for="item in trustItems"
              :key="item.title"
              class="rounded-[22px] border border-white/8 bg-white/[0.04] p-4"
            >
              <p class="text-xs font-semibold uppercase text-slate-500" style="letter-spacing: 0.16em;">{{ item.title }}</p>
              <p class="mt-3 text-lg font-semibold text-slate-900">{{ item.value }}</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">{{ item.copy }}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="problema" class="grid gap-6 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
        <article class="section-frame rounded-[30px] px-6 py-6 lg:px-8">
          <p class="text-[11px] font-semibold uppercase text-[#8c4d29]" style="letter-spacing: 0.26em;">El coste del caos</p>
          <h2 class="mt-4 max-w-xl text-3xl font-semibold text-slate-900 sm:text-4xl">
            Si tu operativa depende de hojas sueltas, mensajes y carpetas, pierdes tiempo y control.
          </h2>
          <p class="mt-4 max-w-xl text-base leading-8 text-slate-600">
            Cuando los cobros, contratos e incidencias viven en herramientas distintas, cada mes empieza con dudas, búsquedas y tareas repetidas.
          </p>

          <div class="mt-8 space-y-4">
            <article
              v-for="item in problemItems"
              :key="item.title"
              class="rounded-[24px] border border-[#ead8ca] bg-white/75 p-5"
            >
              <div class="flex items-start gap-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1e7] text-[#8c4d29]">
                  <SolidIcon :name="item.icon" class="h-5 w-5" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-slate-900">{{ item.title }}</h3>
                  <p class="mt-2 text-sm leading-7 text-slate-600">{{ item.description }}</p>
                </div>
              </div>
            </article>
          </div>
        </article>

        <article class="section-frame relative overflow-hidden rounded-[30px]">
          <img :src="documentsImage" alt="Propietaria revisando documentación" class="h-full min-h-[24rem] w-full object-cover" />
          <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.1),rgba(7,17,31,0.85)_70%,rgba(7,17,31,0.94)_100%)]"></div>
          <div class="absolute inset-0 p-6 lg:p-8">
            <div class="flex h-full flex-col justify-between">
              <div class="ml-auto max-w-[14rem] rounded-[24px] border border-white/50 bg-white/78 p-4 backdrop-blur">
                <p class="text-[10px] font-semibold uppercase text-[#8c4d29]" style="letter-spacing: 0.24em;">Antes</p>
                <p class="mt-2 text-lg font-semibold text-slate-900">Excel, WhatsApp y PDFs sueltos</p>
                <p class="mt-2 text-sm leading-6 text-slate-600">Tres sitios para una sola decisión.</p>
              </div>

              <div class="grid gap-3 md:grid-cols-3">
                <article
                  v-for="pill in painPills"
                  :key="pill.title"
                  class="rounded-[24px] border border-white/50 bg-white/78 p-4 backdrop-blur"
                >
                  <p class="text-xs font-semibold uppercase text-slate-500" style="letter-spacing: 0.14em;">{{ pill.title }}</p>
                  <p class="mt-2 text-lg font-semibold text-slate-900">{{ pill.value }}</p>
                  <p class="mt-1 text-sm leading-6 text-slate-600">{{ pill.copy }}</p>
                </article>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section class="section-frame overflow-hidden rounded-[30px] px-6 py-6 lg:px-8 lg:py-8">
        <div class="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center">
          <div class="relative overflow-hidden rounded-[28px] border border-white/10">
            <img :src="laptopImage" alt="Persona trabajando con portátil en casa" class="h-full min-h-[24rem] w-full object-cover" />
            <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,18,34,0),rgba(10,18,34,0.85)_100%)]"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6">
              <p class="text-[11px] font-semibold uppercase text-[#fbe6d2]" style="letter-spacing: 0.24em;">La-Kers ordena tu día a día</p>
              <p class="mt-3 max-w-md text-2xl font-semibold text-white">Menos administración reactiva. Más claridad para decidir y crecer.</p>
            </div>
          </div>

          <div>
            <p class="text-[11px] font-semibold uppercase text-[#1f4f46]" style="letter-spacing: 0.26em;">La solución</p>
            <h2 class="mt-4 max-w-2xl text-3xl font-semibold text-slate-900 sm:text-4xl">
              Todo lo que importa de cada alquiler en un sistema limpio, claro y accionable.
            </h2>
            <p class="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              La-Kers convierte la gestión dispersa en un flujo profesional: sabes qué ha pasado, qué falta y qué toca hacer después sin perseguir información.
            </p>

            <div class="mt-8 grid gap-4 md:grid-cols-2">
              <article
                v-for="benefit in benefits"
                :key="benefit.title"
                class="rounded-[24px] border border-[#d5e4dd] bg-white/80 p-5"
              >
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf6f2] text-[#1f4f46]">
                  <SolidIcon :name="benefit.icon" class="h-5 w-5" />
                </div>
                <h3 class="mt-4 text-lg font-semibold text-slate-900">{{ benefit.title }}</h3>
                <p class="mt-2 text-sm leading-7 text-slate-600">{{ benefit.description }}</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="funciones" class="space-y-6">
        <div class="max-w-3xl">
          <p class="text-[11px] font-semibold uppercase text-[#1f4f46]" style="letter-spacing: 0.26em;">Funciones clave</p>
          <h2 class="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Las piezas que necesitas para gestionar con orden y presencia profesional.</h2>
          <p class="mt-4 text-base leading-8 text-slate-600">
            No más herramientas sueltas. Cada módulo existe para eliminar fricción, acelerar decisiones y darte una visión completa del negocio.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="(feature, index) in featureCards"
            :key="feature.title"
            class="feature-card opacity-0 animate-fade-up rounded-[28px] p-6"
            :style="{ animationDelay: `${index * 80}ms` }"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d5e4dd] bg-[#edf6f2] text-[#1f4f46]">
                <SolidIcon :name="feature.icon" class="h-5 w-5" />
              </div>
              <span class="rounded-full border border-[#ead8ca] bg-[#fff4ea] px-3 py-1 text-xs text-[#8c4d29]">{{ feature.badge }}</span>
            </div>
            <h3 class="mt-6 text-2xl font-semibold text-slate-900">{{ feature.title }}</h3>
            <p class="mt-3 text-sm leading-7 text-slate-600">{{ feature.description }}</p>
            <p class="mt-5 text-sm font-medium text-[#1f4f46]">{{ feature.outcome }}</p>
          </article>
        </div>
      </section>

      <section id="dashboard" class="section-frame overflow-hidden rounded-[30px] px-6 py-6 lg:px-8 lg:py-8">
        <div class="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] xl:items-center">
          <div class="space-y-5">
            <p class="text-[11px] font-semibold uppercase text-[#1f4f46]" style="letter-spacing: 0.26em;">Dashboard preview</p>
            <h2 class="max-w-2xl text-3xl font-semibold text-slate-900 sm:text-4xl">
              Un panel que se siente como producto serio desde el primer vistazo.
            </h2>
            <p class="max-w-2xl text-base leading-8 text-slate-600">
              Diseñado para que en pocos segundos entiendas tu estado actual: propiedades, cobros, incidencias, documentación y puntos de bloqueo.
            </p>

            <div class="space-y-4">
              <article
                v-for="highlight in dashboardHighlights"
                :key="highlight.title"
                class="rounded-[24px] border border-[#d5e4dd] bg-white/80 p-5"
              >
                <div class="flex items-start gap-4">
                  <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf6f2] text-[#1f4f46]">
                    <SolidIcon :name="highlight.icon" class="h-5 w-5" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-slate-900">{{ highlight.title }}</h3>
                    <p class="mt-2 text-sm leading-7 text-slate-600">{{ highlight.description }}</p>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <div class="relative">
            <div class="absolute -left-6 top-10 hidden h-40 w-40 rounded-full bg-[#c96a37]/14 blur-[90px] lg:block"></div>
            <div class="absolute -right-10 bottom-10 hidden h-48 w-48 rounded-full bg-[#1f4f46]/14 blur-[110px] lg:block"></div>

            <div class="relative overflow-hidden rounded-[30px] border border-[#d5e4dd] bg-[linear-gradient(155deg,#163d37_0%,#1f4f46_52%,#112e2a_100%)] p-4 shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
              <div class="grid gap-4">
                <div class="grid gap-3 sm:grid-cols-2">
                  <article class="rounded-[24px] border border-white/8 bg-white/[0.05] p-4">
                    <p class="text-xs font-semibold uppercase text-slate-400" style="letter-spacing: 0.16em;">Cobros pendientes</p>
                    <p class="mt-3 text-3xl font-semibold text-white">4</p>
                    <div class="mt-4 space-y-2">
                      <div v-for="payment in paymentRows" :key="payment.tenant" class="flex items-center justify-between rounded-2xl bg-[#173b35]/95 px-3 py-2 text-sm">
                        <span class="text-slate-200">{{ payment.tenant }}</span>
                        <span :class="payment.class">{{ payment.status }}</span>
                      </div>
                    </div>
                  </article>

                  <article class="rounded-[24px] border border-white/8 bg-white/[0.05] p-4">
                    <p class="text-xs font-semibold uppercase text-slate-400" style="letter-spacing: 0.16em;">Documentación crítica</p>
                    <div class="mt-4 space-y-3">
                      <div v-for="document in documentRows" :key="document.name" class="rounded-[20px] bg-[#173b35]/95 px-4 py-3">
                        <p class="text-sm font-semibold text-white">{{ document.name }}</p>
                        <p class="mt-1 text-xs text-slate-400">{{ document.meta }}</p>
                      </div>
                    </div>
                  </article>
                </div>

                <article class="overflow-hidden rounded-[26px] border border-white/8 bg-white/[0.04]">
                  <div class="grid gap-0 md:grid-cols-[0.54fr_0.46fr]">
                    <div class="p-5">
                      <p class="text-xs font-semibold uppercase text-slate-400" style="letter-spacing: 0.16em;">Resumen de cartera</p>
                      <div class="mt-5 grid gap-3 sm:grid-cols-3">
                        <div v-for="summary in portfolioSummary" :key="summary.label" class="rounded-[20px] bg-[#173b35]/95 p-4">
                          <p class="text-xs text-slate-400">{{ summary.label }}</p>
                          <p class="mt-2 text-xl font-semibold text-white">{{ summary.value }}</p>
                        </div>
                      </div>
                    </div>

                    <div class="relative min-h-[16rem] overflow-hidden">
                      <img :src="investmentImage" alt="Inversión inmobiliaria" class="h-full w-full object-cover" />
                      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.08),rgba(7,17,31,0.74)_100%)]"></div>
                      <div class="absolute bottom-0 left-0 right-0 p-5">
                        <p class="text-[11px] font-semibold uppercase text-[#fbe6d2]" style="letter-spacing: 0.24em;">Visión patrimonial</p>
                        <p class="mt-2 text-xl font-semibold text-white">Control diario con mentalidad de portfolio.</p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-6">
        <div class="max-w-3xl">
          <p class="text-[11px] font-semibold uppercase text-[#1f4f46]" style="letter-spacing: 0.26em;">Cómo funciona</p>
          <h2 class="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Tres pasos para pasar del caos a una operativa controlada.</h2>
        </div>

        <div class="grid gap-4 lg:grid-cols-3">
          <article
            v-for="step in steps"
            :key="step.step"
            class="section-frame rounded-[28px] px-6 py-6"
          >
            <div class="flex items-center justify-between gap-4">
              <span class="text-5xl font-semibold text-[#1f4f46]/10">{{ step.step }}</span>
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf6f2] text-[#1f4f46]">
                <SolidIcon :name="step.icon" class="h-5 w-5" />
              </div>
            </div>
            <h3 class="mt-8 text-2xl font-semibold text-slate-900">{{ step.title }}</h3>
            <p class="mt-3 text-sm leading-7 text-slate-600">{{ step.description }}</p>
          </article>
        </div>
      </section>

      <section class="section-frame overflow-hidden rounded-[30px] px-6 py-6 lg:px-8 lg:py-8">
        <div class="grid gap-8 xl:grid-cols-[0.86fr_1.14fr] xl:items-start">
          <div>
            <p class="text-[11px] font-semibold uppercase text-[#1f4f46]" style="letter-spacing: 0.26em;">Comparativa</p>
            <h2 class="mt-4 max-w-xl text-3xl font-semibold text-slate-900 sm:text-4xl">
              Lo que parece barato en Excel suele salir caro en tiempo, errores y estrés.
            </h2>
            <p class="mt-4 max-w-xl text-base leading-8 text-slate-600">
              La diferencia no es solo estética. Es la velocidad con la que encuentras contexto y ejecutas bien cada tarea.
            </p>
          </div>

          <div class="overflow-hidden rounded-[28px] border border-[#e6ddd2] bg-white/75">
            <div class="comparison-grid border-b border-[#efe7dd] px-5 py-4 text-sm font-semibold text-slate-700">
              <div>Operativa</div>
              <div class="text-slate-500">Métodos antiguos</div>
              <div class="text-[#1f4f46]">Con La-Kers</div>
            </div>

            <div
              v-for="row in comparisonRows"
              :key="row.label"
              class="comparison-grid border-b border-[#efe7dd] px-5 py-4 last:border-b-0"
            >
              <div class="font-semibold text-slate-900">{{ row.label }}</div>
              <div class="text-sm leading-7 text-slate-500">{{ row.legacy }}</div>
              <div class="text-sm leading-7 text-slate-700">{{ row.modern }}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="precios" ref="pricingSectionRef" class="space-y-6">
        <div class="max-w-3xl">
          <p class="text-[11px] font-semibold uppercase text-[#1f4f46]" style="letter-spacing: 0.26em;">Pricing</p>
          <h2 class="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Empieza gratis. Escala a Pro cuando tu cartera pide más capacidad.</h2>
          <p class="mt-4 text-base leading-8 text-slate-600">
            Sin tarjeta para probar. Mismo producto desde el primer día. Solo subes de plan cuando necesitas gestionar más inmuebles y operar con más ambición.
          </p>
        </div>

        <div class="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <article class="pricing-card rounded-[30px] border border-[#e6ddd2] p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <span class="rounded-full border border-[#ead8ca] bg-[#fff4ea] px-3 py-1 text-[11px] font-semibold uppercase text-[#8c4d29]" style="letter-spacing: 0.22em;">Plan gratis</span>
                <h3 class="mt-4 text-3xl font-semibold text-slate-900">Empieza con orden, sin coste.</h3>
              </div>
              <p class="text-right text-4xl font-semibold text-slate-900">0 €</p>
            </div>

            <p class="mt-4 max-w-md text-base leading-8 text-slate-600">
              Perfecto para empezar a sacar tus alquileres del caos y validar el sistema con hasta 2 inmuebles.
            </p>

            <ul class="mt-8 space-y-3">
              <li v-for="item in freePlanFeatures" :key="item" class="flex items-center gap-3 rounded-[18px] border border-[#e6ddd2] bg-white/80 px-4 py-3 text-sm text-slate-700">
                <SolidIcon name="check" class="h-5 w-5 shrink-0 text-[#1f4f46]" />
                <span>{{ item }}</span>
              </li>
            </ul>

            <router-link
              to="/sign-up"
              class="mt-8 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200"
              @click="handleRegisterClick('pricing_free')"
            >
              Crear cuenta gratis
            </router-link>
          </article>

          <article class="pricing-card pricing-card-pro rounded-[30px] border border-[#d5e4dd] p-6">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span class="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase text-emerald-50/85" style="letter-spacing: 0.22em;">Plan Pro</span>
                <h3 class="mt-4 text-3xl font-semibold text-white">Para propietarios que quieren operar en serio.</h3>
              </div>
              <div class="text-right">
                <p class="text-4xl font-semibold text-white">9,90 €<span class="text-lg text-slate-300">/mes</span></p>
                <p class="mt-2 text-sm text-[#dffcf6]">o 99 €/año, hasta 25 inmuebles</p>
              </div>
            </div>

              <div class="mt-6 rounded-[24px] border border-white/12 bg-white/10 p-5">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="text-[11px] font-semibold uppercase text-emerald-50/85" style="letter-spacing: 0.22em;">Crecimiento rentable</p>
                  <p class="mt-2 text-lg font-semibold text-white">Dos meses de ahorro con el plan anual.</p>
                </div>
                <span class="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">99 €/año</span>
              </div>
            </div>

            <ul class="mt-8 space-y-3">
              <li v-for="item in proPlanFeatures" :key="item" class="flex items-center gap-3 rounded-[18px] border border-white/8 bg-white/[0.05] px-4 py-3 text-sm text-slate-100">
                <SolidIcon name="check" class="h-5 w-5 shrink-0 text-[#fbe6d2]" />
                <span>{{ item }}</span>
              </li>
            </ul>

            <div class="mt-8 grid gap-3 sm:grid-cols-2">
              <a
                :href="proActivationLink"
                class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3.5 text-sm font-semibold text-[#1f4f46] transition hover:-translate-y-0.5 hover:bg-slate-100"
                @click="handleProUpgradeClick('pricing_pro')"
              >
                Quiero Pro
              </a>
              <a
                :href="demoRequestLink"
                class="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/[0.16]"
                @click="handleDemoClick('pricing_pro')"
              >
                Hablar con ventas
              </a>
            </div>
          </article>
        </div>
      </section>

      <section class="space-y-6">
        <div class="max-w-3xl">
          <p class="text-[11px] font-semibold uppercase text-[#1f4f46]" style="letter-spacing: 0.26em;">Testimonios</p>
          <h2 class="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Comentarios que encajan con el tipo de cliente al que quieres convencer.</h2>
        </div>

        <div class="grid gap-4 xl:grid-cols-3">
          <article
            v-for="testimonial in testimonials"
            :key="testimonial.name"
            class="section-frame rounded-[28px] px-6 py-6"
          >
            <div class="flex items-center gap-1 text-[#c96a37]">
              <span v-for="star in 5" :key="star">★</span>
            </div>
            <p class="mt-5 text-base leading-8 text-slate-700">“{{ testimonial.quote }}”</p>
            <div class="mt-8 flex items-center gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#c96a37_0%,#1f4f46_100%)] text-sm font-semibold text-white">
                {{ testimonial.initials }}
              </div>
              <div>
                <p class="font-semibold text-slate-900">{{ testimonial.name }}</p>
                <p class="text-sm text-slate-500">{{ testimonial.role }}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="faq" class="section-frame rounded-[30px] px-6 py-6 lg:px-8 lg:py-8">
        <div class="grid gap-8 xl:grid-cols-[0.74fr_1.26fr] xl:items-start">
          <div>
            <p class="text-[11px] font-semibold uppercase text-[#1f4f46]" style="letter-spacing: 0.26em;">FAQ</p>
            <h2 class="mt-4 max-w-md text-3xl font-semibold text-slate-900 sm:text-4xl">Respuestas claras para despejar objeciones antes del registro.</h2>
            <p class="mt-4 max-w-md text-base leading-8 text-slate-600">
              La intención es simple: reducir fricción, reforzar confianza y facilitar la decisión de empezar gratis o pedir una demo.
            </p>
          </div>

          <div class="space-y-3">
            <details
              v-for="item in faqItems"
              :key="item.question"
              class="faq-item rounded-[24px] border border-[#e6ddd2] bg-white/80 px-5 py-4"
              @toggle="handleFaqToggle(item.question, $event)"
            >
              <summary class="cursor-pointer list-none pr-8 text-lg font-semibold text-slate-900">
                {{ item.question }}
              </summary>
              <p class="mt-3 text-sm leading-7 text-slate-600">
                {{ item.answer }}
              </p>
            </details>
          </div>
        </div>
      </section>

      <section class="cta-frame relative overflow-hidden rounded-[34px] border border-[#d5e4dd]">
        <img :src="buildingImage" alt="Apartamento moderno y premium" class="absolute inset-0 h-full w-full object-cover" />
        <div class="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,31,0.95)_0%,rgba(7,17,31,0.82)_48%,rgba(7,17,31,0.6)_100%)]"></div>
        <div class="relative grid gap-8 px-6 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-10">
          <div class="space-y-5">
            <p class="text-[11px] font-semibold uppercase text-[#fbe6d2]" style="letter-spacing: 0.26em;">CTA final</p>
            <h2 class="max-w-2xl text-3xl font-semibold text-white sm:text-4xl xl:text-5xl">
              Deja atrás el caos operativo y empieza a gestionar como un propietario profesional.
            </h2>
            <p class="max-w-xl text-base leading-8 text-slate-200">
              Entra gratis, ordena tu cartera y descubre por qué una herramienta bien diseñada cambia la forma de llevar alquileres cada mes.
            </p>
          </div>

          <div class="grid gap-4 self-end sm:grid-cols-2">
            <router-link
              to="/sign-up"
              class="inline-flex items-center justify-center rounded-full bg-[#c96a37] px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#b85d2d]"
              @click="handleRegisterClick('final_cta')"
            >
              Empieza gratis ahora
            </router-link>
            <a
              :href="demoRequestLink"
              class="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/[0.08] px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/[0.12]"
              @click="handleDemoClick('final_cta')"
            >
              Solicitar demo
            </a>
          </div>
        </div>
      </section>
    </main>

    <footer class="relative z-10 border-t border-[#e7ddd0] bg-white/80">
      <div class="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <img :src="brandLogo" alt="La-Kers" class="h-14 w-auto object-contain" />
          <p class="mt-4 max-w-md text-sm leading-7 text-slate-500">
            Plataforma para propietarios que quieren gestionar propiedades, pagos, incidencias, contratos y documentos con una experiencia de producto más clara y profesional.
          </p>
        </div>

        <div class="grid gap-2 text-sm text-slate-600">
          <router-link to="/demo" class="transition hover:text-slate-900" @click="handleDemoClick('footer_demo')">Ver demo</router-link>
          <a href="#precios" class="transition hover:text-slate-900" @click="handlePricingClick('footer_pricing')">Precios</a>
          <router-link to="/sign-in" class="transition hover:text-slate-900" @click="handleLoginClick('footer_login')">Iniciar sesión</router-link>
          <router-link to="/sign-up" class="transition hover:text-slate-900" @click="handleRegisterClick('footer_register')">Crear cuenta</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import SolidIcon from '../components/SolidIcon.vue';
import brandLogo from '../assets/logo.png';
import { track } from '../lib/analytics';

const demoRequestLink = 'mailto:contacto@la-kers.com?subject=Solicitar%20demo%20La-Kers';
const proActivationLink = 'mailto:contacto@la-kers.com?subject=Quiero%20La-Kers%20Pro';

const buildingImage =
  'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&fm=jpg&q=80&w=1400';
const documentsImage =
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&fm=jpg&q=80&w=1400';
const laptopImage =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&fm=jpg&q=80&w=1400';
const workspaceImage =
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&fm=jpg&q=80&w=1400';
const investmentImage =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&fm=jpg&q=80&w=1400';

const heroMetrics = [
  {
    label: 'Visión total',
    value: '1 panel',
    copy: 'Todo tu portfolio en una vista central con contexto real.'
  },
  {
    label: 'Entrada fácil',
    value: '0 €',
    copy: 'Empiezas gratis y validas el flujo antes de ampliar.'
  },
  {
    label: 'Escalado',
    value: '25 inmuebles',
    copy: 'Capacidad suficiente para pequeños inversores y carteras en crecimiento.'
  }
];

const trustItems = [
  {
    title: 'Pensado para',
    value: 'Propietarios e inversores',
    copy: 'Desde quien gestiona 2 inmuebles hasta carteras de 25.'
  },
  {
    title: 'Base operativa',
    value: 'Pagos + contratos + incidencias',
    copy: 'Las tareas que más fricción generan, resueltas en el mismo sistema.'
  },
  {
    title: 'Experiencia',
    value: 'Más orden, menos seguimiento manual',
    copy: 'Menos tiempo buscando contexto y más tiempo actuando.'
  },
  {
    title: 'Modelo',
    value: 'Gratis y Pro',
    copy: 'Sin barreras para entrar y con opción clara para crecer.'
  }
];

const dashboardMenu = [
  { label: 'Resumen', icon: 'dashboard', active: true },
  { label: 'Propiedades', icon: 'building', active: false },
  { label: 'Pagos', icon: 'wallet', active: false },
  { label: 'Incidencias', icon: 'warning', active: false },
  { label: 'Contratos', icon: 'calendar', active: false },
  { label: 'Documentos', icon: 'message', active: false }
];

const dashboardStats = [
  {
    label: 'Inmuebles activos',
    value: '12',
    detail: '8 alquilados y 4 listos para seguimiento.',
    dot: 'bg-[#f1ba7a]'
  },
  {
    label: 'Cobros al día',
    value: '91%',
    detail: 'Pagos controlados con alertas en un vistazo.',
    dot: 'bg-[#d5e4dd]'
  },
  {
    label: 'Incidencias',
    value: '03',
    detail: 'Prioriza lo urgente sin abrir varios canales.',
    dot: 'bg-[#c96a37]'
  }
];

const propertyRows = [
  {
    name: 'Ático Salamanca',
    location: 'Madrid Centro',
    rent: '1.450 €/mes',
    contract: 'Renueva en 28 días',
    status: 'Estable',
    statusClass: 'bg-emerald-400/12 text-emerald-200'
  },
  {
    name: 'Loft Poblenou',
    location: 'Barcelona',
    rent: '1.180 €/mes',
    contract: 'Firmado en marzo',
    status: 'Pagado',
    statusClass: 'bg-sky-400/12 text-sky-200'
  },
  {
    name: 'Apartamento Triana',
    location: 'Sevilla',
    rent: '920 €/mes',
    contract: 'PDF pendiente',
    status: 'Atención',
    statusClass: 'bg-orange-400/12 text-orange-200'
  }
];

const problemItems = [
  {
    icon: 'warning',
    title: 'Pagos que se revisan tarde',
    description: 'Sin una vista única, los vencimientos se controlan con memoria, mensajes y revisiones manuales.'
  },
  {
    icon: 'message',
    title: 'Incidencias dispersas en conversaciones',
    description: 'Lo urgente se mezcla con lo accesorio y terminas gestionando tareas críticas dentro de chats.'
  },
  {
    icon: 'calendar',
    title: 'Contratos y documentos difíciles de localizar',
    description: 'Cada renovación o consulta requiere buscar archivos, versiones y fechas entre carpetas sueltas.'
  }
];

const painPills = [
  {
    title: 'Seguimiento manual',
    value: 'Horas perdidas',
    copy: 'Cada cierre mensual exige reconstruir contexto.'
  },
  {
    title: 'Visión incompleta',
    value: 'Decisiones lentas',
    copy: 'No ves de un vistazo qué está bien y qué está bloqueado.'
  },
  {
    title: 'Percepción del producto',
    value: 'Poco profesional',
    copy: 'Tu gestión merece una herramienta con mejor presencia.'
  }
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
    title: 'Imagen de producto premium',
    description: 'Una experiencia visual más sólida transmite orden, confianza y valor percibido desde el primer clic.'
  }
];

const featureCards = [
  {
    icon: 'building',
    badge: 'Propiedades',
    title: 'Control de cartera',
    description: 'Centraliza inmuebles, estado de ocupación, rentas y contexto clave de cada unidad.',
    outcome: 'Sabes dónde está cada activo y qué necesita.'
  },
  {
    icon: 'wallet',
    badge: 'Pagos',
    title: 'Cobros claros',
    description: 'Sigue pagos cobrados, pendientes o atrasados sin hojas externas ni revisiones cruzadas.',
    outcome: 'Menos fugas, menos dudas y más previsión.'
  },
  {
    icon: 'warning',
    badge: 'Incidencias',
    title: 'Seguimiento real',
    description: 'Registra incidencias, prioriza urgencias y mantén trazabilidad de lo que sigue abierto.',
    outcome: 'Respondes antes y con mejor contexto.'
  },
  {
    icon: 'calendar',
    badge: 'Contratos',
    title: 'Contratos ordenados',
    description: 'Ten fechas, renovaciones y documentación contractual accesibles cuando toca actuar.',
    outcome: 'Menos búsquedas, menos errores y mejor timing.'
  },
  {
    icon: 'message',
    badge: 'Documentos',
    title: 'Archivo operativo',
    description: 'Agrupa los documentos importantes donde deben estar: dentro del flujo de gestión.',
    outcome: 'Localizas lo crítico en segundos.'
  },
  {
    icon: 'chart',
    badge: 'Resumen mensual',
    title: 'Lectura ejecutiva',
    description: 'Un resumen con cifras y alertas te permite revisar la salud del mes de forma rápida.',
    outcome: 'Decides mejor sin abrir cinco herramientas.'
  }
];

const dashboardHighlights = [
  {
    icon: 'dashboard',
    title: 'Jerarquía visual pensada para escanear rápido',
    description: 'Lo importante está arriba y lo urgente se reconoce al instante. Menos lectura, más acción.'
  },
  {
    icon: 'chart',
    title: 'Métricas que apoyan decisiones',
    description: 'No solo ves datos: ves señales útiles para intervenir antes de que el problema crezca.'
  },
  {
    icon: 'check',
    title: 'Sensación de producto maduro',
    description: 'La interfaz transmite orden, tecnología y confianza, justo lo que esperas de un SaaS premium.'
  }
];

const paymentRows = [
  { tenant: 'Marta G.', status: 'Pagado', class: 'text-emerald-200' },
  { tenant: 'Daniel P.', status: 'Pendiente', class: 'text-amber-200' },
  { tenant: 'Claudia R.', status: 'Pagado', class: 'text-emerald-200' },
  { tenant: 'Sergio T.', status: 'Atrasado', class: 'text-orange-200' }
];

const documentRows = [
  { name: 'Contrato ático Salamanca', meta: 'Renovación en 28 días' },
  { name: 'Recibo marzo loft Poblenou', meta: 'PDF disponible' },
  { name: 'Parte de incidencia Triana', meta: 'Proveedor asignado' }
];

const portfolioSummary = [
  { label: 'Ingresos previstos', value: '18.640 €' },
  { label: 'Incidencias activas', value: '03' },
  { label: 'Renovaciones este mes', value: '02' }
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

const comparisonRows = [
  {
    label: 'Estado de la cartera',
    legacy: 'Se reconstruye mirando varias hojas o mensajes.',
    modern: 'Se lee en un panel con métricas y propiedades conectadas.'
  },
  {
    label: 'Seguimiento de pagos',
    legacy: 'Depende de revisiones manuales y memoria.',
    modern: 'Se consulta con estados claros y prioridades visibles.'
  },
  {
    label: 'Contratos y documentos',
    legacy: 'Se buscan en carpetas, correos o notas sueltas.',
    modern: 'Se abren dentro del contexto de cada alquiler.'
  },
  {
    label: 'Imagen profesional',
    legacy: 'La gestión se siente artesanal y fragmentada.',
    modern: 'La operativa transmite orden, seriedad y madurez.'
  }
];

const freePlanFeatures = [
  'Hasta 2 inmuebles activos',
  'Gestión de propiedades, pagos, incidencias y documentos',
  'Acceso inmediato sin tarjeta',
  'Ideal para salir de Excel y probar el flujo'
];

const proPlanFeatures = [
  'Hasta 25 inmuebles activos',
  'Misma experiencia premium con más capacidad',
  'Opción mensual o anual según ritmo de crecimiento',
  'Preparado para pequeños inversores y carteras más serias'
];

const testimonials = [
  {
    name: 'Lucía Herrero',
    initials: 'LH',
    role: 'Propietaria de 6 inmuebles en Madrid',
    quote: 'Antes tenía todo repartido entre Excel, Drive y WhatsApp. Ahora entro en La-Kers y sé exactamente qué pagos faltan y qué contratos tengo que revisar.'
  },
  {
    name: 'Javier Costa',
    initials: 'JC',
    role: 'Pequeño inversor con 11 activos',
    quote: 'La sensación no es la de una herramienta improvisada. El panel transmite control y me permite gestionar mi cartera con mucha más calma.'
  },
  {
    name: 'Marta Vidal',
    initials: 'MV',
    role: 'Sociedad patrimonial familiar',
    quote: 'La diferencia más grande es la claridad. Todo está donde espero encontrarlo y el cierre mensual dejó de ser una tarea pesada.'
  }
];

const faqItems = [
  {
    question: '¿Puedo empezar sin tarjeta?',
    answer: 'Sí. El plan Gratis te permite probar la plataforma sin tarjeta y gestionar hasta 2 inmuebles para validar si La-Kers encaja contigo.'
  },
  {
    question: '¿Para quién está pensado realmente La-Kers?',
    answer: 'Para propietarios con varios inmuebles, pequeños inversores y perfiles que quieren abandonar Excel, WhatsApp y procesos administrativos dispersos.'
  },
  {
    question: '¿Qué pasa cuando necesito más capacidad?',
    answer: 'Puedes pasar a Pro por 9,90 €/mes o 99 €/año y gestionar hasta 25 inmuebles sin cambiar de herramienta ni de flujo.'
  },
  {
    question: '¿Puedo solicitar una demo antes de registrarme?',
    answer: 'Sí. La landing ofrece un CTA de demo para quienes prefieren ver el producto con más contexto antes de empezar gratis.'
  },
  {
    question: '¿La plataforma cubre solo pagos?',
    answer: 'No. La propuesta de valor está en tener propiedades, pagos, incidencias, contratos, documentos y resumen mensual dentro del mismo sistema.'
  }
];

const pricingSectionRef = ref<HTMLElement | null>(null);
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

const handleProUpgradeClick = (source: string) => {
  track('pro_upgrade_clicked', { source, location: 'landing' });
};

const handleFaqToggle = (question: string, event: Event) => {
  const details = event.target as HTMLDetailsElement | null;
  if (details?.open) {
    track('faq_opened', { question, location: 'landing' });
  }
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

.feature-card {
  border: 1px solid rgba(231, 221, 208, 0.95);
  background:
    radial-gradient(circle at top right, rgba(31, 79, 70, 0.08), transparent 26%),
    radial-gradient(circle at bottom left, rgba(201, 106, 55, 0.08), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 244, 237, 0.97));
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.08);
}

.pricing-card {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(201, 106, 55, 0.08), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 244, 237, 0.98));
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.08);
}

.pricing-card-pro {
  background:
    radial-gradient(circle at top left, rgba(248, 193, 92, 0.2), transparent 26%),
    radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.08), transparent 24%),
    linear-gradient(155deg, rgba(22, 61, 55, 0.98), rgba(31, 79, 70, 0.98) 54%, rgba(17, 46, 42, 0.98));
}

.comparison-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.34fr) minmax(0, 0.33fr) minmax(0, 0.33fr);
  gap: 1rem;
}

.cta-frame {
  box-shadow: 0 34px 90px rgba(15, 23, 42, 0.12);
}

.floating-chip {
  animation: floatY 8s ease-in-out infinite;
}

.floating-image {
  animation: floatY 10s ease-in-out infinite;
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

@keyframes floatY {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@media (max-width: 1023px) {
  .comparison-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <div id="landing-page">
    <SharedHeader />

    <div
      class="h-fit max-w-240 sm:(absolute inset-0 m-auto)"
      p="x-5 t-30 md:x-20 lt-sm:b-10"
    >
      <div text-center>
        <h1 text="5xl sm:6xl" font-black uppercase tracking-tighter v-html="$t('landing.hero')" />
        <div my-10 text="xl sm:2xl" font-bold uppercase><SharedBrandName /> {{ $t("landing.desc") }}</div>

        <UiButton :as="NuxtLink" :to="localePath('/dashboard')" class="text-xl h-14 px-10 uppercase font-black">
          {{ $t("landing.start") }}
        </UiButton>
      </div>

      <div m="t-20 x-auto" grid="~ cols-1 sm:cols-2 gap-8" max-w-200>
        <div v-for="i in [0, 1]" :key="i" class="brutalist-card p-6 flex flex-col gap-4">
          <div hstack gap-x-3>
            <span
              :class="['flex-center size-8 brutalist-border', i ? 'bg-info' : 'bg-primary']"
              text="white lg"
            >
              <span :class="i ? 'i-wpf:privacy' : 'i-mdi:rocket-launch'" />
            </span>
            <h2 text-2xl font-black uppercase>{{ $t(`landing.feats[${i}].title`) }}</h2>
          </div>

          <ul text="lg font-bold" pl-2 ml-4.5 list-disc space-y-2>
            <li
              v-for="line in $t(`landing.feats[${i}].items`).split('<br>')"
              :key="line"
              v-html="line"
            />
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NuxtLink } from "#components";

const localePath = useLocalePath();
</script>

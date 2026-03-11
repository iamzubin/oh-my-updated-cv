<template>
  <header class="hstack justify-between pl-4 pr-1 border-b-2 border-black dark:border-white h-16">
    <nuxt-link class="hstack gap-x-2" :to="localePath('/')">
      <SharedLogo text-xl />
      <div text-xl font-black uppercase><SharedBrandName /></div>
    </nuxt-link>

    <div class="hstack h-full">
      <UiButton
        :as="NuxtLink"
        :to="localePath('/dashboard')"
        variant="ghost-secondary"
        size="sm"
        class="h-full border-l-2 border-black dark:border-white !shadow-none !active:translate-x-0 !active:translate-y-0"
        :aria-label="$t('dashboard.my_resumes')"
      >
        <span class="i-ep:menu text-xl" />
        <span class="hide-on-mobile text-lg uppercase font-bold">
          {{ $t("dashboard.my_resumes") }}
        </span>
      </UiButton>

      <UiDropdownMenu>
        <UiDropdownMenuTrigger as-child>
          <UiButton
            variant="ghost-secondary"
            size="sm"
            class="h-full border-l-2 border-black dark:border-white !shadow-none !active:translate-x-0 !active:translate-y-0"
            :aria-label="`Switch the language from: ${localeName}`"
          >
            <span class="i-ic:round-translate text-xl" />
            <span class="hide-on-mobile text-lg uppercase font-bold">
              {{ localeName }}
            </span>
          </UiButton>
        </UiDropdownMenuTrigger>
        <UiDropdownMenuContent class="min-w-28" align="start" :side-offset="0">
          <UiDropdownMenuItem
            v-for="item in availableLocales"
            :key="item.code"
            :as="NuxtLink"
            :to="switchLocalePath(item.code)"
          >
            <span v-if="item.icon" :class="[item.icon, 'text-base mr-1.5']" />
            {{ item.name }}
          </UiDropdownMenuItem>
        </UiDropdownMenuContent>
      </UiDropdownMenu>

      <slot name="tail" />

      <div class="h-full border-l-2 border-black dark:border-white flex items-center px-2">
        <SharedToggleDark />
      </div>

      <UiButton
        as="a"
        variant="ghost-secondary"
        size="sm"
        class="h-full border-l-2 border-black dark:border-white !shadow-none !active:translate-x-0 !active:translate-y-0"
        href="http://github.com/Renovamen/oh-my-cv"
        target="_blank"
        rel="nofollow noopener"
      >
        <span i-tabler:brand-github text-xl />
      </UiButton>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { NuxtLink } from "#components";

const switchLocalePath = useSwitchLocalePath();
const localePath = useLocalePath();
const { locale, locales } = useI18n();

const availableLocales = computed(() =>
  locales.value.filter((i) => i.code !== locale.value)
);

const localeName = computed(
  () => locales.value.find((i) => i.code === locale.value)?.name || ""
);
</script>

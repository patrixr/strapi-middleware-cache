<script setup>
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Giscus from '@giscus/vue'

const { isDark } = useData()
const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #doc-after>
      <div class="comments">
        <Giscus
          repo="strapi-community/strapi-plugin-rest-cache"
          repo-id="R_kgDOGtExJQ"
          category="Documentation"
          category-id="DIC_kwDOGtExJc4CTWPj"
          mapping="pathname"
          strict="0"
          reactions-enabled="1"
          emit-metadata="0"
          input-position="bottom"
          :theme="isDark ? 'transparent_dark' : 'light'"
          lang="en"
          loading="lazy"
        />
      </div>
    </template>
  </Layout>
</template>

<style scoped>
.comments {
  margin-top: 2rem;
}
</style>
<script setup lang="ts">
import NavBar from './index/components/NavBar.vue'
import Hero from './index/components/Hero.vue'
import AboutSection from './index/components/AboutSection.vue'
import OpenSourceSection from './index/components/OpenSourceSection.vue'
import SkillsSection from './index/components/SkillsSection.vue'
import ArticleSection from './index/components/ArticleSection.vue'
import TimelineSection from './index/components/TimelineSection.vue'
import ContactSection from './index/components/ContactSection.vue'
</script>

<template>
  <div id="top" class="page">
    <NavBar />

    <main class="content">
      <Hero />
      <AboutSection />
      <OpenSourceSection />
      <SkillsSection />
      <ArticleSection />
      <TimelineSection />
    </main>

    <ContactSection />
  </div>
</template>

<style scoped>
.page {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

.content {
  display: flex;
  flex-direction: column;
}
</style>

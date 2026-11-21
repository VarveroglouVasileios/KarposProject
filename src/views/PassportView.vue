<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import Passport from '@/components/Passport.vue'
import { decodeBatch } from '@/lib/batch'

const route = useRoute()
const res = computed(() => decodeBatch(String(route.params.code)))
</script>

<template>
  <main class="wrap sect">
    <template v-if="res.ok">
      <p class="eyebrow">ΠΑΡΤΙΔΑ {{ res.batch.code }} · {{ res.batch.producer }}</p>
      <h2>Η διαδρομή <em>της παρτίδας</em></h2>
      <Passport :batch="res.batch" />
      <p class="sub">Τα στοιχεία διαβάζονται από τον σύνδεσμο που σκανάρατε. Δεν βρίσκονται σε κανένα server.</p>
    </template>
    <template v-else>
      <h2>Δεν μπορούμε να διαβάσουμε αυτόν τον κωδικό</h2>
      <p class="sub" role="alert">{{ res.error }} Δοκιμάστε να σκανάρετε ξανά το QR.</p>
    </template>
    <RouterLink to="/" class="btn ghost">← Αρχική</RouterLink>
  </main>
</template>

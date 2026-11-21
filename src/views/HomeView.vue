<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Passport from '@/components/Passport.vue'
import { SAMPLE } from '@/lib/batch'

const img = `${import.meta.env.BASE_URL}images/grove.webp`
</script>

<template>
  <main>
    <section class="hero">
      <img :src="img" alt="" width="1024" height="1024" class="bg" />
      <div class="wrap in">
        <p class="eyebrow">ΠΑΡΤΙΔΑ {{ SAMPLE.code }}</p>
        <h1>Ξέρετε <em>από πού</em> έρχεται κάθε σταγόνα.</h1>
        <p class="lead">Σκανάρετε τον κωδικό στο μπουκάλι και δείτε πότε μαζεύτηκαν οι ελιές, πότε πιέστηκαν και τι έδειξε η ανάλυση.</p>
      </div>
    </section>

    <section id="route" class="wrap sect">
      <h2>Η διαδρομή <em>της παρτίδας</em></h2>
      <p class="sub">Κάθε βήμα έχει ημερομηνία και τοποθεσία. Οι τιμές της ανάλυσης είναι ενδεικτικές.</p>
      <Passport :batch="SAMPLE" />
    </section>

    <section class="wrap sect producer">
      <h2>Για τον παραγωγό: <em>ένας κωδικός ανά παρτίδα.</em></h2>
      <p class="sub">Συμπληρώνετε ημερομηνίες και αναλύσεις και παίρνετε QR για την ετικέτα. Τα στοιχεία ζουν μέσα στον ίδιο τον σύνδεσμο: δεν υπάρχει server ούτε λογαριασμός.</p>
      <RouterLink to="/producer" class="btn">Δημιουργία QR ετικέτας</RouterLink>
    </section>
  </main>
</template>

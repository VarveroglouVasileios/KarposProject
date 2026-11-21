<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <a class="skip" href="#main">Μετάβαση στο περιεχόμενο</a>
  <header class="top wrap">
    <RouterLink to="/" class="logo">Καρπός</RouterLink>
    <nav aria-label="Κύρια πλοήγηση">
      <RouterLink :to="{ name: 'home', hash: '#route' }" class="hide-sm">Η διαδρομή</RouterLink>
      <RouterLink to="/producer" class="hide-sm">Για τον παραγωγό</RouterLink>
      <span class="tag">DEMO CONCEPT</span>
    </nav>
  </header>
  <div id="main" tabindex="-1"><RouterView /></div>
  <footer class="foot wrap">
    <p>Φανταστικό demo με ενδεικτικά στοιχεία. Η φωτογραφία είναι δημιουργημένη με AI. Σχεδιασμός και υλοποίηση: Βασίλειος Βαρβέρογλου.</p>
    <p><RouterLink to="/privacy">Απόρρητο και cookies</RouterLink></p>
  </footer>
</template>

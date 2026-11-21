<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { CATEGORY_LABEL, categoryOf, daysBetween, fmt1, formatNum, isCold, litres, longDate, sameDayPress, type Batch } from '@/lib/batch'

defineProps<{ batch: Batch }>()
const root = ref<HTMLElement>()
// Steps fade in as they scroll into view; without IntersectionObserver or with reduced motion everything is simply shown.
onMounted(() => {
  const els = root.value?.querySelectorAll<HTMLElement>('.step')
  if (!els || typeof IntersectionObserver === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  root.value?.classList.add('anim')
  const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: 0.25 })
  els.forEach((el) => io.observe(el))
})
</script>

<template>
  <ol ref="root" class="route">
    <li class="step">
      <p class="date">{{ longDate(batch.harvestDate) }}</p>
      <h3>Συγκομιδή</h3>
      <p>{{ batch.grove }}. Ποικιλία {{ batch.variety.toLowerCase() }}, {{ formatNum(batch.harvestKg) }} κιλά ελιές.</p>
    </li>
    <li class="step">
      <p class="date">{{ longDate(batch.pressDate) }} · {{ batch.pressTime }}</p>
      <h3>{{ sameDayPress(batch) ? 'Πίεση την ίδια μέρα' : `Πίεση ${daysBetween(batch.harvestDate, batch.pressDate)} ${daysBetween(batch.harvestDate, batch.pressDate) === 1 ? 'μέρα' : 'μέρες'} μετά` }}</h3>
      <p>{{ batch.millName }}. {{ isCold(batch) ? `Κρύα έκθλιψη, κάτω από 27 °C (έως ${fmt1(batch.pressTemp)} °C).` : `Θερμοκρασία έως ${fmt1(batch.pressTemp)} °C.` }}</p>
    </li>
    <li class="step">
      <p class="date">{{ longDate(batch.analysisDate) }}</p>
      <h3>Ανάλυση εργαστηρίου</h3>
      <dl class="lab">
        <div><dt>ΟΞΥΤΗΤΑ</dt><dd>{{ fmt1(batch.acidity) }} %</dd></div>
        <div><dt>ΥΠΟΞΕΙΔΙΑ</dt><dd>{{ fmt1(batch.peroxides) }}</dd></div>
        <div class="cat" :class="categoryOf(batch.acidity, batch.peroxides)"><dt>ΚΑΤΗΓΟΡΙΑ</dt><dd>{{ CATEGORY_LABEL[categoryOf(batch.acidity, batch.peroxides)] }}</dd></div>
      </dl>
    </li>
    <li class="step">
      <p class="date">{{ longDate(batch.bottlingDate) }}</p>
      <h3>Εμφιάλωση</h3>
      <p>Σε σκούρα φιάλη {{ batch.bottleMl }} ml, {{ formatNum(batch.bottles) }} φιάλες ({{ formatNum(litres(batch)) }} λίτρα).</p>
    </li>
  </ol>
</template>
